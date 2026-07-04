import { describe, expect, it } from "vitest";
import { parseCsv, parseImmoMetricaCsv } from "./immometrica";

const HEADER =
  "﻿Neu;Favorit;Ausgeblendet;Gesehen;Details;PLZ;Ort;Adresse;Titel;Zi;Trend;Datum;Privat;Zustand;Hausgeld;ROI (s);ROI (i);Aktiv;Tage online;Bj;Wohnungstyp;Preis;Preis/m²;Miete;Miete/m²;Wfl.;Cash-<br>flow;Währung;Link ImmoScout;Link Kleinanzeigen;Link immonet;Link immowelt";

function row(overrides: Partial<Record<string, string>> = {}): string {
  const base: Record<string, string> = {
    Neu: "Nein",
    Favorit: "Nein",
    Ausgeblendet: "Nein",
    Gesehen: "Ja",
    Details: "https://www.immometrica.com/de/offer/26154597",
    PLZ: "53604",
    Ort: "Bad Honnef",
    Adresse: "Am Honnefer Kreuz 45A, 53604 Bad Honnef",
    Titel: "Ihr Projekt in Bad Honnef; mit Semikolon",
    Zi: "2,5",
    Trend: "",
    Datum: "09.02.2026",
    Privat: "Nein",
    Zustand: "Renovierungsbedürftig",
    Hausgeld: "157,92",
    "ROI (s)": "5,5",
    "ROI (i)": "0",
    Aktiv: "Ja",
    "Tage online": "144",
    Bj: "1993",
    Wohnungstyp: "Maisonette",
    Preis: "115000",
    "Preis/m²": "822,6",
    Miete: "0",
    "Miete/m²": "",
    "Wfl.": "139,8",
    "Cash-<br>flow": "12,3",
    Währung: "EUR",
    "Link ImmoScout": "",
    "Link Kleinanzeigen": "https://www.kleinanzeigen.de/s-anzeige/anzeige/3322692595-196-1629",
    "Link immonet": "",
    "Link immowelt": "",
    ...overrides,
  };
  const cols = HEADER.replace(/^﻿/, "").split(";");
  return cols
    .map((c) => {
      const v = base[c] ?? "";
      return /[";\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
    })
    .join(";");
}

describe("parseCsv", () => {
  it("parst Quotes mit Semikolons und doppelte Anführungszeichen", () => {
    const rows = parseCsv('a;"b;c";"sagt ""hi"""\nx;y;z');
    expect(rows).toEqual([
      ["a", "b;c", 'sagt "hi"'],
      ["x", "y", "z"],
    ]);
  });
});

describe("parseImmoMetricaCsv", () => {
  it("mappt eine echte Zeile vollständig", () => {
    const { rows, skipped } = parseImmoMetricaCsv(HEADER + "\n" + row());
    expect(skipped).toBe(0);
    expect(rows).toHaveLength(1);
    const r = rows[0];
    expect(r.city).toBe("Bad Honnef");
    expect(r.zip).toBe("53604");
    expect(r.street).toBe("Am Honnefer Kreuz 45A");
    expect(r.listedAt).toBe("2026-02-09");
    expect(r.price).toBe(115000);
    expect(r.livingArea).toBeCloseTo(139.8);
    expect(r.rooms).toBe(2.5);
    expect(r.constructionYear).toBe(1993);
    expect(r.hausgeld).toBeCloseTo(157.92);
    expect(r.currentRentCold).toBeNull(); // "0" = unbekannt
    expect(r.condition).toBe("renovierungsbeduerftig");
    // Portal-Link gewinnt gegen Details-URL
    expect(r.source).toBe("kleinanzeigen");
    expect(r.externalId).toBe("3322692595");
  });

  it("fällt ohne Portal-Link auf die Details-URL zurück (source sonstige)", () => {
    const { rows } = parseImmoMetricaCsv(
      HEADER + "\n" + row({ "Link Kleinanzeigen": "" })
    );
    expect(rows[0].source).toBe("sonstige");
    expect(rows[0].sourceUrl).toContain("immometrica.com/de/offer/");
  });

  it("überspringt Zeilen ohne Ort oder ohne Link", () => {
    const { rows, skipped } = parseImmoMetricaCsv(
      HEADER + "\n" + row({ Ort: "" }) + "\n" + row({ Details: "", "Link Kleinanzeigen": "" })
    );
    expect(rows).toHaveLength(0);
    expect(skipped).toBe(2);
  });

  it("bevorzugt ImmoScout vor Kleinanzeigen", () => {
    const { rows } = parseImmoMetricaCsv(
      HEADER +
        "\n" +
        row({ "Link ImmoScout": "https://www.immobilienscout24.de/expose/167591199" })
    );
    expect(rows[0].source).toBe("immoscout24");
    expect(rows[0].externalId).toBe("167591199");
  });
});
