-- Neubewertung 14.08.2026: Bad Honnef, Linzer Str. 62 EG rechts — Unterlagen vollstaendig ausgewertet
-- (Besichtigung 13.08. + komplettes Zip: Mietvertrag, Mieterhoehungsvereinbarung, Teilungserklaerung,
-- Grundbuch, Formblatt Wohnflaeche, Energieausweis). Urteil bestaetigt: Kaufen NUR deutlich unter Inserat.
-- Ziel unveraendert 145.000 (Erstgebot 135.000, hartes Limit 150.000). Garage-Frage geklaert: KEINE Garage
-- (gehoert zu Einheit Nr. 1). Nachfass-Mail an Fr. Boehler entworfen (Wirtschaftsplan, NK-Abrechnung,
-- Oeltank, Verwalter) inkl. Ankuendigung eines konkreten Angebots nach Erhalt des Wirtschaftsplans.
-- Match ueber data->>'link'; updated_at im JSON und in der Spalte fuer den Local-first-Sync.

update public.search_properties
set
  data = data || jsonb_build_object(
    'wohnflaeche', 79.25,
    'cashflow', -7,
    'wunschpreis', 145000,
    'wunschmiete', 680,
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      'Analyse 14.08.2026 (NEUBEWERTUNG, Unterlagen vollstaendig): KAUFEN WENN PREIS PASST - aber nur deutlich unter Inserat. Erstgebot 135.000, Ziel ~145.000, hartes Limit 150.000. Zum Inseratspreis 179.000 (+3,57 % Provision = effektiv ~185.400) Finger weg: Faktor 21,9, App-CF -7, konservativ ~-142.'
      || E'\n' || 'MIETE (Kernpunkt): Haus&Grund-Mietvertrag ab 01.07.2021, Par. 5 Ziffer 1b = INDEXMIETE, Par.-558-Erhoehung auf Vergleichsmiete vertraglich AUSGESCHLOSSEN. Mieterhoehungsvereinbarung 08.05.2025: 560 -> 680 kalt ab 01.07.2025 (+21,4 %) mit BESTANDSGARANTIE bis 31.12.2027. Mietpfad: 680 eingefroren bis Ende 2027, ab 2028 Index (Basis VPI 07/2025, bei ~2 %/J ~714 Anfang 2028), danach ~Inflation. Marktmiete 925-990 (79,25 m2 x 11,7-12,5) im Bestand UNERREICHBAR; Upside nur bei Mieterwechsel (aelteres Paerchen seit 2021, zufrieden - nicht planbar). Kaution 1.300. Inserat-Angabe "680 seit 2021" irrefuehrend.'
      || E'\n' || 'Zahlen (Ist-Kalt 680; konservativ -135 n. uml. inkl. Ruecklage, da Wirtschaftsplan aussteht): App-CF 0 bei 177.300; konservativ CF 0 bei ~142.000; mit Index-714 ab 2028 konservativ CF 0 bei ~151.000. Bei Ziel 145.000: Faktor 17,8, Brutto 5,6 %, 1.830 EUR/m2, App-CF +124, konservativ ~-11 (ab 2028 mit 714: ~+23). 6 % Brutto erst bei 136.000.'
      || E'\n' || 'OBJEKT/RECHT: Sondereigentum Nr. 2 (EG rechts), MEA 160/1.000, Wohnflaeche lt. Formblatt 79,25 m2, Bj. 1966/67, 6 Parteien. Dach komplett erneuert+gedaemmt 2008, Fenster 1998/2003 (GE, nur Glasschaeden beim Eigentuemer), Haustuer 2021, WW-Speicher 2022, Oel-Zentralheizung 2010 (GEG-Tauschrisiko per Sonderumlage), Energieklasse D bis 15.10.2033. Kueche gehoert den Mietern. KEINE Garage - gehoert zu Einheit Nr. 1. Grundbuch Blatt 16524 (12.02.2026): Abt. II leer, Abt. III Grundschuld 750.000 Volksbank Hochsauerland in Gesamthaft auf allen 6 Blaettern - Lastenfreistellung im Kaufvertrag zwingend. Neu-WEG: Ruecklage 0, keine ETV-Protokolle. Hausgeld unklar: Inserat 293, muendlich ~350 inkl. Ruecklage - finaler Wirtschaftsplan steht aus. Mieter-Vorkaufsrecht Par. 577: Verzicht muendlich avisiert, formal erst nach Notartermin, 2-Monats-Frist einplanen.'
      || E'\n' || 'VERHANDLUNG: Verkaeuferin-GmbH gesellschaftsrechtlich mit VivaRheni (Makler) verbunden - die 3,57 % Provision (~6.400) fliesst an dieselbe Gruppe = Verhandlungsmasse ("X provisionsfrei" anbieten). Aufteiler hat Verkaufsdruck (750k-Finanzierung laeuft). Vergleich 1. OG selbes Haus (159.000, Index 571,94): dort Ziel ~115.000 - EG ist wegen hoeherer Mietbasis und vollstaendiger Unterlagen der realistischere Kandidat.'
      || E'\n' || 'OFFEN: finaler Wirtschaftsplan mit Hausgeld-Split; letzte NK-Abrechnung (fehlte im Zip); Oeltank-Pruefprotokoll + Dach-Rechnungen (Rueckmeldung Anfang KW ab 17.08. zugesagt); kuenftiger WEG-Verwalter. Nachfass-Mail an Fr. Boehler ENTWORFEN (Dank fuer Unterlagen, offene Punkte, Angebot nach Wirtschaftsplan angekuendigt, Mietkonstellation als Preisanker genannt - ohne Zahl).'
      || E'\n' || 'Ansprechpartnerin: Maite Boehler, 02224 9769758, m.boehler@vivarheni.de. Unterlagen lokal: Ordner "Linzer Str 62 - Unterlagen"; Auswertung: docs/besichtigung-2026-08-13-bad-honnef-linzer.md.'
  ),
  updated_at = now()
where data->>'link' = 'https://vivarheni.landingpage.immobilien/public/a/einheit/hBpvf6euH2YKrXjxKSa7hBE4/dCR4EdE3FpEwtb4kDFEbftJ5';
