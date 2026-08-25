-- Update: Bad Honnef, Linzer Str. 62, 1. OG (159.000 EUR) — Neubewertung 14.08.2026 nach Auswertung der EG-Unterlagen.
-- Basisfall jetzt INDEXMIETE-Verdacht (EG hat nachweislich Indexmiete, krumme 571,94 EUR sieht nach Index-Anpassung aus)
-- + Flaechenzweifel (Objektdaten: alle 6 Whg. 78,42 m2, inseriert 82 m2). Zielpreis deutlich gesenkt: 145.000 -> 115.000.
-- Notizen komplett erneuert; Ansprechpartnerin auf Boehler umgestellt. Match ueber data->>'link';
-- updated_at im JSON und in der Spalte, damit der Local-first-Sync der App die Aenderung uebernimmt.

update public.search_properties
set
  data = data || jsonb_build_object(
    'wunschpreis', 115000,
    'wunschmiete', 571.94,
    'cashflow', -38,
    'ansprechpartner', 'Maite Boehler (VivaRheni Immobilien GmbH)',
    'telefon', '02224 9769758',
    'email', 'm.boehler@vivarheni.de',
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      'Analyse 14.08.2026 (Neubewertung nach Auswertung der EG-Unterlagen im selben Haus): BEOBACHTEN - zum Inseratspreis Finger weg; kaufbar nur nach Klaerung des Mietvertragstyps und mit grossem Nachlass. KERNPUNKT: Die EG-Wohnung (Linzer Str. 62 rechts) hat nachweislich INDEXMIETE (Haus&Grund-Vertrag Par. 5 Ziffer 1b) - die krumme Ist-Miete 571,94 EUR dieser Einheit sieht stark nach Index-Anpassung aus. BASISFALL daher Indexmiete: Par.-558-Erhoehung auf Vergleichsmiete vertraglich ausgeschlossen, Mietpfad nur Inflation (~2 %/J), Marktmiete (78,42 m2 x 11,7-12,5 = ~920-980 EUR, Ist nur 7,29 EUR/m2 = ~40 % unter Markt) im Bestand UNERREICHBAR. Nur falls Standardmiete belegt: Kappungsgrenze 20 %/3 J (Bad Honnef kein angespannter Markt) -> sofort 571,94 -> max. ~686 EUR.'
      || E'\n' || 'FLAECHENZWEIFEL: Inserat sagt 82 m2, die Objektdaten des Aufteilers nennen alle 6 Wohnungen mit 78,42 m2 - konservativ mit ~78,4 m2 rechnen (dann 2.028 EUR/m2 statt 1.939). Wohnflaechenberechnung angefordert.'
      || E'\n' || 'Zahlen Basisfall Index (Ist 571,94; Hausgeld 304 lt. Inserat, aber EG-Hausgeld war real 350 statt 293 - Angaben unzuverlaessig; konservativ ~135 n. uml. inkl. Ruecklagenzufuehrung analog EG): bei 159.000 Faktor 23,2, Brutto 4,32 %, App-CF -38, konservativ -173. App-CF 0 bei ~149.100; konservativ CF 0 erst bei ~113.900. Szenario Standardmiete mit Erhoehung auf 686: App-CF 0 bei ~178.900, konservativ CF 0 bei ~143.700.'
      || E'\n' || 'ZIEL: Basisfall Index -> Erstgebot ~105.000, Zielpreis ~115.000, hartes Limit 125.000. NUR falls Standardmiete belegt: Ziel ~140.000, Limit 145.000. Zum Vergleich: Die EG-Wohnung (680 EUR kalt, Ziel 145.000, Faktor 17,8) ist bei den jeweiligen Zielpreisen das strikt bessere Objekt - 1. OG nur als Alternative/Zweitkauf bei entsprechend tieferem Preis interessant.'
      || E'\n' || 'Risiken wie EG: Aufteilungsprojekt (Teilung 29.01.2026), Neu-WEG ohne Ruecklage und ohne Protokolle, Grundschuld 750.000 EUR Volksbank in GESAMTHAFT auf allen 6 Blaettern 16523-16528 (Lastenfreistellung im Kaufvertrag zwingend), Oel-Zentralheizung 2010 = GEG-Tauschrisiko per Sonderumlage, Mieter-Vorkaufsrecht Par. 577 (Einzug 2017 vor Umwandlung, 2-Monats-Frist), Kueche gehoert der Mieterin, Wirtschaftsplan/Hausgeld-Split offen. Verkaeuferin und VivaRheni gesellschaftsrechtlich verbunden (im Inserat offengelegt) -> Kaeuferprovision 3,57 % ist wirtschaftlich Kaufpreisbestandteil und Verhandlungsmasse ("provisionsfrei" anbieten).'
      || E'\n' || 'Gebaeudeunterlagen (TE, Grundbuch-Muster, Energieausweis Klasse D bis 15.10.2033, Objektdaten) liegen vom EG-Kauf bereits vor. Am 14.08.2026 per Mail bei Frau Boehler angefordert (Entwurf): Mietvertrag (Vertragstyp!), Mieterhoehungshistorie seit 2017, Wohnflaechenberechnung, letzte NK-Abrechnung, Hausgeld-Split/Wirtschaftsplan dieser Einheit.'
      || E'\n' || 'Ansprechpartnerin: Maite Boehler, 02224 9769758, m.boehler@vivarheni.de (kennt uns von der EG-Besichtigung 13.08.). EG-Unterlagen lokal: Ordner "Linzer Str 62 - Unterlagen".'
  ),
  updated_at = now()
where data->>'link' = 'https://vivarheni.de/immobilie/rhein-naehe-trifft-zukunftssicherheit-vermietete-3-zimmer-wohnung-in-bad-honnef/';
