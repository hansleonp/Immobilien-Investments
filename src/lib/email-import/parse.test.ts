import { describe, expect, it } from "vitest";

import {
  bestListingTitle,
  extractAllLinks,
  extractListingLinks,
  extractListingMeta,
  isPortalHost,
  normalizeListingUrl,
  parseInboundPayload,
  toListingUrl,
  unwrapTrackingUrl,
} from "./parse";

describe("Immowelt-Mail: Meta aus Tracker-Container + Titel-Auswahl", () => {
  // Nachbau einer Immowelt-Karte: mehrere <a> auf denselben Klick-Tracker,
  // Eckdaten/Ort/Titel als getrennte Link-Texte, PLZ in Klammern.
  const CLICK = "https://click.by.immowelt.de/?qs=TOKEN123";
  const CARD = `
    <table><tr><td>
      <a href="${CLICK}">195.000 € 2.868 €/m²</a>
      <a href="${CLICK}">Bezugsfreie 2-Zimmer-Eigentumswohnung mit Sonnenloggia</a>
      <a href="${CLICK}">2 Zimmer · 68 m²</a>
      <a href="${CLICK}">Brüser Berg, Bonn / Brüser Berg (53125)</a>
      <a href="${CLICK}">Mehr Informationen</a>
    </td></tr></table>`;

  it("extractListingMeta liest Preis/Fläche/Zimmer/Ort aus dem Tracker-Container", () => {
    const meta = extractListingMeta(CARD, CLICK);
    expect(meta.price).toBe(195000);
    expect(meta.livingArea).toBe(68);
    expect(meta.rooms).toBe(2);
    expect(meta.city).toBe("Bonn");
  });

  it("bestListingTitle wählt den beschreibenden Titel (nicht Preis/Eckdaten/Ort)", () => {
    const titles = [
      "195.000 € 2.868 €/m²",
      "Bezugsfreie 2-Zimmer-Eigentumswohnung mit Sonnenloggia",
      "2 Zimmer · 68 m²",
      "Brüser Berg, Bonn / Brüser Berg (53125)",
      "Mehr Informationen",
    ];
    expect(bestListingTitle(titles)).toBe(
      "Bezugsfreie 2-Zimmer-Eigentumswohnung mit Sonnenloggia"
    );
    // Floskeln kommen bereits als null an (titleCandidate); reine Preise fallen raus
    expect(bestListingTitle(["189.000 €", null])).toBeNull();
  });
});

describe("Klick-Tracker ohne eingebettete Ziel-URL (Netzwerk-Auflösung nötig)", () => {
  const CLICK = "https://click.by.immowelt.de/?qs=ABB7InYiOjEsImQiOjQ5MjZ9ADMxyz";

  it("isPortalHost erkennt Klick-Tracker-Subdomains der Portale", () => {
    expect(isPortalHost(CLICK)).toBe(true);
    expect(isPortalHost("https://email.immobilienscout24.de/r/x")).toBe(true);
    expect(isPortalHost("https://example.com/x")).toBe(false);
    expect(isPortalHost("kein-link")).toBe(false);
  });

  it("toListingUrl liefert null, wenn keine Ziel-URL im Link steckt", () => {
    // Opaker Tracker → ohne Redirect nicht auflösbar
    expect(toListingUrl(CLICK)).toBeNull();
  });

  it("toListingUrl erkennt direkte und eingebettete Inserats-Links", () => {
    expect(toListingUrl("https://www.immowelt.de/expose/aa11?utm_source=x")).toBe(
      "https://www.immowelt.de/expose/aa11"
    );
    expect(
      toListingUrl(
        "https://links.immowelt.de/c/1?url=" +
          encodeURIComponent("https://www.immowelt.de/expose/bb22")
      )
    ).toBe("https://www.immowelt.de/expose/bb22");
  });

  it("extractAllLinks gibt rohe Tracker-Links (unnormalisiert) zurück", () => {
    const html = `<a href="${CLICK}">2 Zimmer · 68 m²</a>`;
    const all = extractAllLinks(html, "");
    expect(all).toEqual([{ url: CLICK, title: "2 Zimmer · 68 m²" }]);
    // Der Listings-Only-Extractor lässt den opaken Tracker (korrekt) fallen
    expect(extractListingLinks(html, "")).toEqual([]);
  });
});

describe("unwrapTrackingUrl / Tracking-Links", () => {
  it("entpackt eine als Query-Param eingebettete Immowelt-URL", () => {
    const tracked =
      "https://links.immowelt.de/c/123?url=" +
      encodeURIComponent("https://www.immowelt.de/expose/2c8f4a1b");
    expect(unwrapTrackingUrl(tracked)).toBe("https://www.immowelt.de/expose/2c8f4a1b");
  });

  it("entpackt eine im Pfad URL-codierte ImmoScout24-URL", () => {
    const tracked =
      "https://email.immobilienscout24.de/r/" +
      encodeURIComponent("https://www.immobilienscout24.de/expose/167591199");
    expect(unwrapTrackingUrl(tracked)).toBe(
      "https://www.immobilienscout24.de/expose/167591199"
    );
  });

  it("liefert null für Tracking-Links ohne eingebettetes Inserat", () => {
    expect(unwrapTrackingUrl("https://links.immowelt.de/c/abc/def")).toBeNull();
  });

  it("extractListingLinks findet die verpackte Inserats-URL", () => {
    const html =
      '<a href="https://links.immowelt.de/c/9?url=' +
      encodeURIComponent("https://www.immowelt.de/expose/aa11bb22") +
      '">Schöne 3-Zimmer-Wohnung in Bad Honnef</a>';
    const links = extractListingLinks(html, "");
    expect(links).toHaveLength(1);
    expect(links[0].url).toBe("https://www.immowelt.de/expose/aa11bb22");
    expect(links[0].title).toContain("3-Zimmer");
  });

  it("entfernt PID-, wt_- und adj_-Tracking-Parameter", () => {
    const n = normalizeListingUrl(
      "https://www.immobilienscout24.de/expose/167591199?PID=abc&wt_mc=xyz&adj_t=q&foo=1"
    );
    expect(n).toBe("https://www.immobilienscout24.de/expose/167591199?foo=1");
  });

  it("adj_t (Immowelt) fällt weg → Varianten deduplizieren zur selben URL", () => {
    const base = "https://www.immowelt.de/expose/a18fca0e-9e53-4284-9020-5175ae5c8e9e";
    expect(normalizeListingUrl(base + "?adj_t=1x281xib_1xhaji93")).toBe(base);
  });
});

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
