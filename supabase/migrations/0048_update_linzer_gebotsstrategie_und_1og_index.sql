-- Update 17.08.2026: (1) EG rechts — beschlossene Gebotsstrategie "140.000 EUR provisionsfrei" in die Notizen;
-- (2) 1. OG links — Indexerhoehungsschreiben + Mietvertrag liegen vor: Index seit 08/2025 OHNE Bestandsgarantie
-- (jaehrlich ziehbar!), dokumentierte Bad-gegen-650-EUR-Option, Verkaeuferin enttarnt: Libona Projektentwicklung GmbH.
-- Match ueber data->>'link'; updated_at im JSON und in der Spalte fuer den Local-first-Sync.

-- 1) EG rechts (179.000 EUR): Gebotsstrategie
update public.search_properties
set
  data = data || jsonb_build_object(
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      (data->>'notizen')
      || E'\n' || 'GEBOTSSTRATEGIE (beschlossen 17.08.2026): Angebot "140.000 EUR PROVISIONSFREI" statt 138.000 regulaer - all-in 151.900 statt 154.657 (KNK ohne Provision nur ~8,5 %), Verkaeuferseite sieht 2.000 EUR mehr Preis. Szenario durchgerechnet (Uebergang 01/2027, 42 % Grenzsteuersatz, Gebaeudeanteil 80 % im KV festschreiben!): EK 28.000, Darlehen 123.900, Rate 516,25 (Zins 309,75/Tilgung 206,50 anfangs). Indexpfad 680 -> ~714 ab Fruehjahr 2028 -> +2 %/J. 10-Jahres-Bilanz: Tilgung 28.858, CF vor Steuern +7.249, Steuern ~-8.600 (Tilgung > AfA 2.430!), Restschuld Ende 2036: 95.042. Vermoegenszuwachs: +15.600 (0 % Wertentw., ~4,5 % EK-Rendite p.a.) / +38.100 (1,5 %, ~9,0 %) / +46.200 (2 %, ~10,2 %). Effektiv 1.766 EUR/m2 - stille Reserve zum Markt (3.600-4.000) + Mieterwechsel-Upside (+200 EUR/Mon) nicht eingepreist. Risiken: Anschlusszins auf 95k Restschuld, Oelheizungs-Sonderumlage 2030er (~5-8k Anteil).'
      || E'\n' || 'VERKAEUFERIN ENTTARNT (aus Indexerhoehungsschreiben Whg 3): Libona Projektentwicklung GmbH, Rolandsecker Weg 29, Rheinbreitbach (= VivaRheni-Adresse!), HRB 28645 Montabaur, GF Launhardt/Wiesehoefer.'
  ),
  updated_at = now()
where data->>'link' = 'https://vivarheni.landingpage.immobilien/public/a/einheit/hBpvf6euH2YKrXjxKSa7hBE4/dCR4EdE3FpEwtb4kDFEbftJ5';

-- 2) 1. OG links (159.000 EUR): Indexerhoehung + Mietvertrag ausgewertet
update public.search_properties
set
  data = data || jsonb_build_object(
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      (data->>'notizen')
      || E'\n' || 'NACHTRAG 17.08.2026 (Indexerhoehungsschreiben + Mietvertrag liegen vor): Mietvertrag ab/fortgesetzt 01.07.2017, urspruenglich 455 kalt + 152 BK; Indexerhoehung nach Par. 557b (EINSEITIG, KEINE Bestandsgarantie!): VPI 96,9 (07/2017) -> 121,8 (05/2025) = +25,7 % -> 571,94 ab 01.08.2025, BK jetzt 185 (warm 756,94). WICHTIG: Naechste Indexanpassung ab 08/2026 moeglich (1 Jahr unveraendert) = sofort nach Kauf ~+2 % auf ~583 EUR, danach jaehrlich - besser als EG (dort Lock bis Ende 2027). ABER Schreiben datiert 16.08.2026 bei Wirkung 01.08.2025 (vermutl. Neuausdruck) -> tatsaechliche Zahlungseingaenge 571,94 belegen lassen (rueckwirkende Indexerhoehung unzulaessig).'
      || E'\n' || 'BAD-OPTION dokumentiert: Mieterin hat selbst Badsanierung inkl. Dusche erbeten; Vermieter bot an: Bad neu gegen Nettokalt 650 EUR. = einvernehmlicher Weg auf 650 (+78 EUR/Mon) gegen ~10k Invest (~9 % Rendite aufs Bad-Invest + AfA). Konservativ CF 0 dann bei ~123.000 (statt 102.800). Vorsicht: Vermieter bot Mieterin Wohngeld-Pruefung an -> Bonitaet/Zahlungsfaehigkeit der Mieterin im Blick behalten (Kontoauszuege Mietkonto anfordern). Mietvertrag nennt 2 Personen, NK-Abrechnung zeigt 1 Person (365 Personentage).'
      || E'\n' || 'Verkaeuferin: Libona Projektentwicklung GmbH (Rolandsecker Weg 29, Rheinbreitbach = VivaRheni-Adresse, HRB 28645 Montabaur). Ziele unveraendert: Erstgebot ~100.000, Ziel ~105.000, Limit 115.000 (Bad-Option macht das Limit robuster; sofortige Index-Ziehbarkeit +11 EUR/Mon ist eingepreist).'
  ),
  updated_at = now()
where data->>'link' = 'https://vivarheni.de/immobilie/rhein-naehe-trifft-zukunftssicherheit-vermietete-3-zimmer-wohnung-in-bad-honnef/';
