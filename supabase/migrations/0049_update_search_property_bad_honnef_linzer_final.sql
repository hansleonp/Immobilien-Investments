-- Update 17.08.2026: EG rechts Linzer Str. 62 — FINALE Neubewertung mit vollstaendigen Unterlagen
-- (Wirtschaftsplan Whg 2 WJ 2026 liegt vor) UND neuen Finanzierungsannahmen (4 % Zins + 2 % Tilgung,
-- KNK 12,07 % aus EK, Rate = Preis x 0,004, P_max = 250 x Kaltmiete).
-- Ersetzt die alten Gebotsmarken (135/145/150 bei 3,5 % bzw. "140k provisionsfrei" aus 0048) durch die
-- neu beschlossenen Marken: Erstgebot 128.000, Ziel 134.000, hartes Limit 136.000.
-- Notizen werden komplett neu gesetzt (altes Fazit ersetzt), wunschpreis = 134000, cashflow = -36.
-- Match ueber data->>'link'; updated_at im JSON und in der Spalte fuer den Local-first-Sync.

update public.search_properties
set
  data = data || jsonb_build_object(
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'wunschpreis', 134000,
    'cashflow', -36,
    'notizen',
      'Analyse 17.08.2026 (FINAL, alle Unterlagen + neue 4%-Finanzierung): KAUFEN WENN PREIS PASST - zum Inseratspreis Finger weg. Gebotsmarken: ERSTGEBOT 128.000, ZIEL 134.000, HARTES LIMIT 136.000 (jeweils plus Zusatzforderung provisionsfrei - nicht sicher, Basisrechnung MIT Provision). Bei 179.000: Faktor 21,9, App-CF -36, konservativ -207. Bei Ziel 134.000: Faktor 16,4 (1.691 EUR/m2), App-CF +144, konservativ -27 (ab Indexanpassung 2028 positiv). Konservativer Break-even heute 127.208 (= 250 x (680 - 171,17)), mit Index ~714 ab 2028: 135.708.'
      || E'\n' || 'EIGENTUEMERLAST FINAL belegt (Wirtschaftsplan Whg 2, WJ 2026, Verwaltung Schneider & Wegener Bonn): Hausgeld gesamt 392,91/Mon = umlagefaehig 221,74 + nicht umlagefaehig 104,50 + Erhaltungsruecklage 66,67 -> konservativer Abzug exakt 171,17/Mon. (Inserat 293, muendlich 350 - beides falsch.)'
      || E'\n' || 'MIETE: 680 kalt, INDEXMIETE (Haus&Grund Par. 5 1b, Par. 558 ausgeschlossen), Erhoehungsvereinbarung 08.05.2025 (560 -> 680, +21,4 %) mit BESTANDSGARANTIE bis 31.12.2027; Mietpfad: 680 fix bis Ende 2027, ab Fruehjahr 2028 Index ~714 (VPI-Basis 05/2025, ~2 %/J), danach ~+2 %/J. Marktmiete 925-990 nur bei Mieterwechsel (aelteres Paar seit 2021, nicht planbar). BK-VZ 200, Kaution 1.300.'
      || E'\n' || 'FINANZIERUNG am Ziel 134.000: EK 26.800 + KNK 16.174 (12,07 %) = Cash 42.974 (~32,07 %); Darlehen 107.200, Rate 536 (Zins 357/Tilgung 179 anfangs). Restschuld nach 5 J: 95.354 (Tilgung 11.846), nach 10 J: 80.890 (Tilgung 26.310, Zinskosten 38.010). Kum. konservativer CF 10 J (Indexpfad) ~+6.900. Vermoegenszuwachs 10 J: +17.000 bei 0 % Wertentwicklung (~3,4 % EK-Rendite p.a.) / +38.500 bei 1,5 % (~6,6 % p.a.). Provisionsfrei spart zusaetzlich ~4.800 Cash.'
      || E'\n' || 'RISIKEN/RECHT: Aufteiler (Teilung 29.01.2026), Verkaeuferin Libona Projektentwicklung GmbH (Rolandsecker Weg 29 Rheinbreitbach = VivaRheni-Adresse, HRB 28645 Montabaur - verbunden -> Provision ~6.400 ist Verhandlungsmasse); Grundbuch 16524: Abt. II leer, Abt. III 750.000 Gesamthaft-Grundschuld Volksbank -> LASTENFREISTELLUNG zwingend (zeigt Verkaufsdruck); Neu-WEG Ruecklage startet bei 0 (Zufuehrung 5.000/J + Erhaltungsbudget 5.000/J); Mieter-Vorkaufsrecht Par. 577 (muendlicher Verzicht avisiert, +2 Mon nach Notartermin); Oel-Zentralheizung 2010 = GEG-Sonderumlagerisiko 2030er (~5-8k Anteil). Im KV: Kaufpreisaufteilung 80 % Gebaeudeanteil + Lastenfreistellung.'
      || E'\n' || 'SUBSTANZ: Dach komplett + Daemmung 2008, Fenster 1998/2003 (GE), Heizung 2010, Haustuer 2021, WW-Speicher 2022, Klasse D bis 10/2033; Balkon zum Garten, Laerm Linzer Str. lt. Besichtigung 13.08. aushaltbar, Kueche gehoert Mietern, Keller-Vorratsraum, keine Garage. Bestes Objekt im Haus.'
      || E'\n' || 'STATUS: Besichtigung 13.08.2026 erfolgt; Antwort-Mail an Fr. Boehler (m.boehler@vivarheni.de, 02224 9769758) entworfen: Dank fuer Wirtschaftsplan Whg 2 + 360-Grad-Tour, Besichtigung 1. OG sobald Mieterin kann, ANGEBOT ZUR EG-WOHNUNG IN DEN NAECHSTEN TAGEN ANGEKUENDIGT (ohne Zahl).'
  ),
  updated_at = now()
where data->>'link' = 'https://vivarheni.landingpage.immobilien/public/a/einheit/hBpvf6euH2YKrXjxKSa7hBE4/dCR4EdE3FpEwtb4kDFEbftJ5';
