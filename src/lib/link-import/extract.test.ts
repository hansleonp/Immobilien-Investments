import { describe, expect, it } from "vitest";

import {
  extractFromHtml,
  looksBlocked,
  parseGermanNumber,
} from "@/lib/link-import/extract";

const URL_FIXTURE = "https://www.example-makler.de/expose/12345";

describe("parseGermanNumber", () => {
  it("parst Tausender-Punkte", () => {
    expect(parseGermanNumber("285.000")).toBe(285000);
  });

  it("parst Tausender-Punkte mit Dezimal-Komma", () => {
    expect(parseGermanNumber("1.234,56")).toBe(1234.56);
  });

  it("parst Dezimal-Komma ohne Tausender", () => {
    expect(parseGermanNumber("58,5")).toBe(58.5);
  });

  it("ignoriert Währungszeichen und Leerzeichen", () => {
    expect(parseGermanNumber("285000 €")).toBe(285000);
  });

  it("gibt null für Unlesbares zurück", () => {
    expect(parseGermanNumber("abc")).toBeNull();
    expect(parseGermanNumber("")).toBeNull();
  });
});

describe("extractFromHtml — JSON-LD", () => {
  const html = `<!doctype html>
    <html><head>
      <title>Irrelevant</title>
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "RealEstateListing",
            "name": "Helle 2-Zimmer-Wohnung in Bad Honnef",
            "image": ["https://cdn.example.de/bild1.jpg", "https://cdn.example.de/bild2.jpg"],
            "description": "Schöne Wohnung mit Balkon.",
            "offers": { "@type": "Offer", "price": "285.000" },
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Hauptstraße 45",
              "postalCode": "53604",
              "addressLocality": "Bad Honnef"
            },
            "floorSize": { "@type": "QuantitativeValue", "value": "58,5" },
            "numberOfRooms": 2
          }
        ]
      }
      </script>
    </head><body>Fallback-Text 999.999 € 120 m² 5 Zimmer 99999 Anderswo</body></html>`;

  it("liest alle Felder aus JSON-LD und priorisiert sie vor Regex", () => {
    const data = extractFromHtml(html, URL_FIXTURE);
    expect(data.title).toBe("Helle 2-Zimmer-Wohnung in Bad Honnef");
    expect(data.imageUrl).toBe("https://cdn.example.de/bild1.jpg");
    expect(data.description).toBe("Schöne Wohnung mit Balkon.");
    expect(data.price).toBe(285000);
    expect(data.livingArea).toBe(58.5);
    expect(data.rooms).toBe(2);
    expect(data.street).toBe("Hauptstraße 45");
    expect(data.zip).toBe("53604");
    expect(data.city).toBe("Bad Honnef");
  });
});

describe("extractFromHtml — OpenGraph", () => {
  const html = `<!doctype html>
    <html><head>
      <meta property="og:title" content="Kapitalanlage: 2-Zimmer-Wohnung" />
      <meta property="og:image" content="https://cdn.example.de/og.jpg" />
      <meta property="og:description" content="Vermietete Wohnung für 149.000 € Kaufpreis." />
    </head><body></body></html>`;

  it("liest title/image/description aus OG-Tags, Preis via Regex aus der Beschreibung", () => {
    const data = extractFromHtml(html, URL_FIXTURE);
    expect(data.title).toBe("Kapitalanlage: 2-Zimmer-Wohnung");
    expect(data.imageUrl).toBe("https://cdn.example.de/og.jpg");
    expect(data.description).toBe("Vermietete Wohnung für 149.000 € Kaufpreis.");
    expect(data.price).toBe(149000);
  });

  it("liest product:price:amount als Preis", () => {
    const withPrice = html.replace(
      "</head>",
      '<meta property="product:price:amount" content="152500" /></head>'
    );
    const data = extractFromHtml(withPrice, URL_FIXTURE);
    expect(data.price).toBe(152500);
  });
});

describe("extractFromHtml — Regex-Fallback", () => {
  const html = `<!doctype html>
    <html><head><title>Wohnung kaufen</title></head>
    <body>
      <h1>Gepflegte Eigentumswohnung</h1>
      <p>Kaufpreis: 285.000 € — Wohnfläche ca. 58 m², 2 Zimmer.</p>
      <p>Lage: 53604 Bad Honnef, ruhige Seitenstraße.</p>
    </body></html>`;

  it("findet Preis, Fläche, Zimmer und PLZ+Ort im Fließtext", () => {
    const data = extractFromHtml(html, URL_FIXTURE);
    expect(data.price).toBe(285000);
    expect(data.livingArea).toBe(58);
    expect(data.rooms).toBe(2);
    expect(data.zip).toBe("53604");
    expect(data.city).toBe("Bad Honnef");
  });
});

describe("extractFromHtml — Müll-HTML", () => {
  it("liefert ein leeres Objekt ohne Throw", () => {
    expect(extractFromHtml("<<<%%% kein html §§§", URL_FIXTURE)).toEqual({});
    expect(extractFromHtml("", URL_FIXTURE)).toEqual({});
    expect(
      extractFromHtml(
        '<script type="application/ld+json">{kaputtes json</script>',
        URL_FIXTURE
      )
    ).toEqual({});
  });
});

describe("looksBlocked", () => {
  it("erkennt HTTP-Fehlerstatus", () => {
    expect(looksBlocked("<html></html>", 403)).toBe(true);
    expect(looksBlocked("<html></html>", 500)).toBe(true);
  });

  it("erkennt Captcha-/Bot-Marker case-insensitive", () => {
    expect(looksBlocked("<html>Bitte CAPTCHA lösen</html>", 200)).toBe(true);
    expect(looksBlocked("<html>Pardon Our Interruption</html>", 200)).toBe(true);
    expect(looksBlocked("<html>Are you a robot?</html>", 200)).toBe(true);
    expect(looksBlocked("<html>Access Denied</html>", 200)).toBe(true);
    expect(looksBlocked("<html>akamai bot manager</html>", 200)).toBe(true);
  });

  it("lässt normale Seiten durch", () => {
    expect(looksBlocked("<html><body>Schöne Wohnung</body></html>", 200)).toBe(false);
  });
});
