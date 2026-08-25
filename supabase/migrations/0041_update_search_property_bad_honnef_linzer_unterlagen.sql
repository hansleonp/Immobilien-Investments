-- Update: Bad Honnef, Linzer Str. 62 EG rechts + 1. OG — Unterlagen-Auswertung 14.08.2026 (Zip von VivaRheni/Boehler).
-- Kernfund EG: INDEXMIETE (Par. 5 1b Mietvertrag) = Erhoehung auf Vergleichsmiete nach Par. 558 vertraglich ausgeschlossen;
-- dazu Bestandsgarantie bis 31.12.2027 (Mieterhoehungsvereinbarung 08.05.2025: 560 -> 680 kalt zum 01.07.2025).
-- Der "30-35 % unter Markt"-Hebel ist damit tot; Zielpreis deutlich gesenkt. Notizen komplett erneuert.
-- Match ueber data->>'link'; updated_at im JSON und in der Spalte, damit der Local-first-Sync die Aenderung uebernimmt.

update public.search_properties
set
  data = data || jsonb_build_object(
    'datum', '2026-08-14',
    'wunschpreis', 145000,
    'wunschmiete', 680,
    'ansprechpartner', 'Maite Boehler (VivaRheni Immobilien GmbH)',
    'telefon', '02224 9769758',
    'email', 'm.boehler@vivarheni.de',
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      'Analyse 14.08.2026 (Unterlagen-Auswertung nach Besichtigung 13.08.): URTEIL GEDREHT - kaufbar nur noch deutlich unter Inseratspreis. KERNFUND: Der Mietvertrag (Haus&Grund-Formular, Beginn 01.07.2021) hat in Par. 5 Ziffer 1b die INDEXMIETE angekreuzt - damit ist eine Erhoehung auf die ortsuebliche Vergleichsmiete (Par. 558) vertraglich AUSGESCHLOSSEN. Der gesamte Kaufgrund "Miete 30-35 % unter Markt via Kappungsgrenze heben" existiert nicht. Zusaetzlich Mieterhoehungsvereinbarung vom 08.05.2025: Nettokalt 560 -> 680 EUR zum 01.07.2025 (+21,4 %), mit BESTANDSGARANTIE keine weitere Erhoehung bis 31.12.2027. Inserat-Angabe "vermietet seit 01.07.2021 fuer 680" war irrefuehrend - 680 gilt erst seit 07/2025.'
      || E'\n' || 'Mietpfad ab jetzt: eingefroren 680 kalt bis 31.12.2027; ab 2028 nur Index-Anpassung (VPI seit letzter Anpassung 07/2025, bei ~2 %/J ergibt das Anfang 2028 ~714 EUR), danach ~Inflation. Marktmiete (925-990) ist im Bestand UNERREICHBAR; einziger Upside ist Mieterwechsel (Neuvermietung frei, aber aelteres Paerchen seit 2021, nicht planbar). BK-Vorauszahlung 200 EUR, Gesamtzahlung 880. Kaution 1.300 EUR (Uebertragung beim Kauf pruefen).'
      || E'\n' || 'Zahlen (Ist-Kalt 680, Hausgeld 350 inkl. Ruecklage lt. Boehler nur muendlich, finaler Wirtschaftsplan folgt; konservativ ~135 n. uml.): bei 179.000 App-CF -7, konservativ ~-142. App-CF 0 bei 177.300. Konservativ CF 0 bei ~142.000; mit Index-Miete ~714 (ab 2028) bei ~151.000. NEUES ZIEL: Erstgebot 135.000, Zielpreis ~145.000, hartes Limit 150.000 (vorher 148/158/165 - Praemisse "816 EUR sofort" ist mit Indexmiete hinfaellig).'
      || E'\n' || 'Grundbuch Blatt 16524 (Wohnungsgrundbuch, angelegt 12.02.2026 aus Teilung 29.01.2026, AG Koenigswinter): Abt. II LEER; Abt. III Grundschuld 750.000 EUR Volksbank Hochsauerland in GESAMTHAFT auf allen 6 Blaettern 16523-16528 = Aufteiler-Finanzierung, Lastenfreistellung im Kaufvertrag zwingend. MEA 160/1.000, Sondereigentum Nr. 2 (EG rechts) + Vorratsraum KG. Wohnflaeche lt. Formblatt 27.01.2025: 79,25 m2. Objektdaten: Grundstueck 676 m2, 6 Whg. a 78,42 m2, Bj. 1966/67, Dach KOMPLETT erneuert+gedaemmt 2008 (bestaetigt, besser als muendliche Aussage bei Besichtigung), Garage auf dem Grundstueck (Zuordnung klaeren!).'
      || E'\n' || 'Vorkaufsrecht Mieter Par. 577 bestaetigt (Umwandlung 29.01.2026 nach Einzug 2021): Mieter wollen lt. Boehler muendlich verzichten; formale Verzichtserklaerung erst nach Notartermin moeglich, 2-Monats-Frist ab Mitteilung einplanen. Fenster = Gemeinschaftseigentum (Glasschaeden traegt Eigentuemer); Balkon konstruktiv GE, Belag/Unterkonstruktion SE.'
      || E'\n' || 'Offen: finaler Wirtschaftsplan mit Hausgeld-Split (350 vs. 293 im Inserat!); Nebenkostenabrechnung (fehlte im Zip trotz Ankuendigung); Oeltank-Pruefprotokoll + Dach-Rechnungen (Eigentuemer prueft, Rueckmeldung Anfang KW nach 17.08.); wer wird WEG-Verwalter. Risiken unveraendert: Ruecklage = 0 (Neu-WEG), Oelheizung 2010 = GEG-Tauschrisiko per Sonderumlage.'
      || E'\n' || 'Ansprechpartnerin: Maite Boehler, 02224 9769758, m.boehler@vivarheni.de (Besichtigung + Unterlagen). Unterlagen lokal: Ordner "Linzer Str 62 - Unterlagen".'
  ),
  updated_at = now()
where data->>'link' = 'https://vivarheni.landingpage.immobilien/public/a/einheit/hBpvf6euH2YKrXjxKSa7hBE4/dCR4EdE3FpEwtb4kDFEbftJ5';

-- 1. OG im selben Haus: Indexmiete-Verdacht + Flaechenzweifel nachtragen (Erstbewertung 13.08. bleibt dokumentiert).
update public.search_properties
set
  data = data || jsonb_build_object(
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      (data->>'notizen')
      || E'\n' || 'Nachtrag 14.08.2026 (aus EG-Unterlagen): VOR Bewertung Mietvertragstyp klaeren - EG rechts hat INDEXMIETE (Par. 558 ausgeschlossen); die krumme Kaltmiete 571,94 EUR riecht stark nach Index-Anpassung, dann gilt auch hier: kein Vergleichsmieten-Hebel. Ausserdem Flaeche pruefen: Objektdaten des Aufteilers nennen 6 Whg. a 78,42 m2 - die inserierten 82 m2 sind fraglich (Wohnflaechenberechnung anfordern). Grundschuld 750.000 EUR Gesamthaft (Blaetter 16523-16528) betrifft auch diese Einheit. Direkter Kontakt: Maite Boehler, 02224 9769758, m.boehler@vivarheni.de.'
  ),
  updated_at = now()
where data->>'link' = 'https://vivarheni.de/immobilie/rhein-naehe-trifft-zukunftssicherheit-vermietete-3-zimmer-wohnung-in-bad-honnef/';
