import { describe, expect, it } from "vitest";

import {
  extractListingLinks,
  extractListingMeta,
  normalizeListingUrl,
  parseInboundPayload,
} from "./parse";

describe("parseInboundPayload", () => {
  it("erkennt das Postmark-Format", () => {
    const result = parseInboundPayload({
      Subject: "Neue Treffer für deinen Suchauftrag",
      HtmlBody: "<html><body>Hallo</body></html>",
      TextBody: "Hallo",
      From: "noreply@immobilienscout24.de",
    });
    expect(result).toEqual({
      subject: "Neue Treffer für deinen Suchauftrag",
      html: "<html><body>Hallo</body></html>",
      text: "Hallo",
    });
  });

  it("erkennt Postmark auch ohne HtmlBody (nur TextBody)", () => {
    const result = parseInboundPayload({
      Subject: "Treffer",
      TextBody: "https://www.immobilienscout24.de/expose/12345",
    });
    expect(result).toEqual({
      subject: "Treffer",
      html: "",
      text: "https://www.immobilienscout24.de/expose/12345",
    });
  });

  it("erkennt das Cloudflare-Worker-Format", () => {
    const result = parseInboundPayload({
      subject: "Kleinanzeigen Suchagent",
      html: "<p>Neue Anzeige</p>",
      text: "Neue Anzeige",
    });
    expect(result).toEqual({
      subject: "Kleinanzeigen Suchagent",
      html: "<p>Neue Anzeige</p>",
      text: "Neue Anzeige",
    });
  });

  it("erkennt das generische Format mit body statt html", () => {
    const result = parseInboundPayload({
      subject: "Treffer",
      body: "<p>Inhalt</p>",
    });
    expect(result).toEqual({ subject: "Treffer", html: "<p>Inhalt</p>", text: "" });
  });

  it("liefert null bei Müll", () => {
    expect(parseInboundPayload(null)).toBeNull();
    expect(parseInboundPayload("hallo")).toBeNull();
    expect(parseInboundPayload(42)).toBeNull();
    expect(parseInboundPayload([1, 2, 3])).toBeNull();
    expect(parseInboundPayload({})).toBeNull();
    expect(parseInboundPayload({ foo: "bar" })).toBeNull();
    // Subject allein ohne Inhalt reicht nicht
    expect(parseInboundPayload({ Subject: "Nur Betreff" })).toBeNull();
  });
});

describe("normalizeListingUrl", () => {
  it("entfernt Tracking-Params und Fragment, behält restliche Params", () => {
    expect(
      normalizeListingUrl(
        "https://www.immobilienscout24.de/expose/123456?utm_source=mail&utm_campaign=sa&ref=abc&cid=99&enteredFrom=result_list#section"
      )
    ).toBe("https://www.immobilienscout24.de/expose/123456?enteredFrom=result_list");
  });

  it("liefert null bei unparsebaren URLs", () => {
    expect(normalizeListingUrl("kein-link")).toBeNull();
    expect(normalizeListingUrl("mailto:foo@bar.de")).toBeNull();
  });
});

// Typische Suchagenten-Mail: zwei IS24-Treffer (einer doppelt verlinkt via Bild
// + Titel + Button), ein Kleinanzeigen-Treffer, dazu Navigations-/Abmelde-Links.
const SEARCH_AGENT_HTML = `
<html><body>
  <a href="https://www.immobilienscout24.de/">ImmoScout24</a>
  <table>
    <tr>
      <td>
        <a href="https://www.immobilienscout24.de/expose/155001122?utm_source=email&utm_medium=alert&ref=xyz#top">
          <img src="https://pic.is24.de/1.jpg" alt="">
        </a>
        <a href="https://www.immobilienscout24.de/expose/155001122?utm_source=email&utm_medium=alert">
          Kapitalanlage: 3-Zimmer-Wohnung in Bad Honnef
        </a>
        <p>285.000 € · 78,5 m² · 3 Zimmer · 53604 Bad Honnef</p>
        <a href="https://www.immobilienscout24.de/expose/155001122?utm_campaign=alert">hier klicken</a>
      </td>
    </tr>
    <tr>
      <td>
        <a href="https://www.kleinanzeigen.de/s-anzeige/gepflegte-wohnung/2711223344-196-1234?utm_source=email&cid=42">
          Gepflegte 2-Zimmer-Wohnung mit Balkon
        </a>
        <p>Preis: 149.000 € — Wohnfläche: 54 m²</p>
      </td>
    </tr>
  </table>
  <a href="https://www.immobilienscout24.de/geosearch/">Suche verfeinern</a>
  <a href="https://www.immobilienscout24.de/abmelden?token=abc">Abmelden</a>
</body></html>
`;

describe("extractListingLinks", () => {
  it("findet, normalisiert und dedupliziert Inserats-Links aus HTML", () => {
    const links = extractListingLinks(SEARCH_AGENT_HTML, "");
    expect(links).toHaveLength(2);

    const [is24, ka] = links;
    // Tracking-Params + Fragment entfernt, Duplikate (3x derselbe Expose-Link) verschmolzen
    expect(is24.url).toBe("https://www.immobilienscout24.de/expose/155001122");
    // Bester Titel gewinnt (nicht "hier klicken", nicht der leere Bild-Link)
    expect(is24.title).toBe("Kapitalanlage: 3-Zimmer-Wohnung in Bad Honnef");

    expect(ka.url).toBe(
      "https://www.kleinanzeigen.de/s-anzeige/gepflegte-wohnung/2711223344-196-1234"
    );
    expect(ka.title).toBe("Gepflegte 2-Zimmer-Wohnung mit Balkon");
  });

  it("ignoriert Navigations- und Abmelde-Links", () => {
    const links = extractListingLinks(SEARCH_AGENT_HTML, "");
    expect(links.every((l) => !l.url.includes("abmelden"))).toBe(true);
    expect(links.every((l) => !l.url.includes("geosearch"))).toBe(true);
  });

  it("findet nackte URLs im Text-Teil und dedupliziert gegen HTML-Links", () => {
    const text = [
      "Neuer Treffer: https://www.immobilienscout24.de/expose/155001122?utm_source=email.",
      "Und: https://www.immowelt.de/expose/2abcd1e?utm_medium=mail",
    ].join("\n");
    const links = extractListingLinks(SEARCH_AGENT_HTML, text);
    expect(links.map((l) => l.url)).toEqual([
      "https://www.immobilienscout24.de/expose/155001122",
      "https://www.kleinanzeigen.de/s-anzeige/gepflegte-wohnung/2711223344-196-1234",
      "https://www.immowelt.de/expose/2abcd1e",
    ]);
  });

  it("liefert [] wenn keine Inserats-Links vorhanden sind", () => {
    expect(extractListingLinks("<p>Kein Link</p>", "Nur Text")).toEqual([]);
    expect(extractListingLinks("", "")).toEqual([]);
  });
});

describe("extractListingMeta", () => {
  it("findet Preis, Fläche, Zimmer und Ort im Container des Links", () => {
    const meta = extractListingMeta(
      SEARCH_AGENT_HTML,
      "https://www.immobilienscout24.de/expose/155001122?utm_source=email&utm_medium=alert"
    );
    expect(meta.price).toBe(285000);
    expect(meta.livingArea).toBe(78.5);
    expect(meta.rooms).toBe(3);
    expect(meta.city).toBe("Bad Honnef");
  });

  it("findet Metadaten für den zweiten Treffer (eigener Container)", () => {
    const meta = extractListingMeta(
      SEARCH_AGENT_HTML,
      "https://www.kleinanzeigen.de/s-anzeige/gepflegte-wohnung/2711223344-196-1234?cid=42"
    );
    expect(meta.price).toBe(149000);
    expect(meta.livingArea).toBe(54);
  });

  it("liefert {} bei fehlendem Link oder leerem HTML", () => {
    expect(
      extractListingMeta(SEARCH_AGENT_HTML, "https://www.immonet.de/angebot/999999")
    ).toEqual({});
    expect(extractListingMeta("", "https://www.immobilienscout24.de/expose/1")).toEqual(
      {}
    );
  });
});
