import { describe, expect, it } from "vitest";
import { extractFromPlainText } from "./text-extract";

const IS24_PASTE = `
Merken
Teilen
Drucken

Gepflegte 2-Zimmer-Wohnung mit Balkon in Bad Honnef

Hauptstraße 45, 53604 Bad Honnef, Zentrum

Kaufpreis: 198.000 €
Wohnfläche ca.: 58 m²
Zimmer: 2
Etage: 2. OG
Baujahr: 1994
Hausgeld: 220 €
Energieausweis: Verbrauchsausweis

Die Wohnung ist vermietet, Kaltmiete: 630 €.
Provision: 3,57 % inkl. MwSt.
`;

describe("extractFromPlainText", () => {
  const r = extractFromPlainText(IS24_PASTE);

  it("findet Titel, Preis, Fläche, Zimmer", () => {
    expect(r.title).toContain("2-Zimmer-Wohnung");
    expect(r.price).toBe(198000);
    expect(r.livingArea).toBe(58);
    expect(r.rooms).toBe(2);
  });

  it("findet Adresse, Etage, Baujahr", () => {
    expect(r.zip).toBe("53604");
    expect(r.city).toContain("Bad Honnef");
    expect(r.street).toBe("Hauptstraße 45");
    expect(r.floor).toBe("2. OG");
    expect(r.constructionYear).toBe(1994);
  });

  it("findet Hausgeld und Kaltmiete", () => {
    expect(r.hausgeld).toBe(220);
    expect(r.currentRentCold).toBe(630);
  });

  it("nimmt bei mehreren €-Beträgen ohne Label den größten als Kaufpreis", () => {
    const r2 = extractFromPlainText("Whg. toll\n Miete 650 € \n 185.000 € VB \n Rücklage 4.000 €");
    expect(r2.price).toBe(185000);
  });

  it("wirft bei Müll nicht und liefert leeres Objekt", () => {
    expect(extractFromPlainText("hallo welt")).not.toHaveProperty("price");
  });
});
