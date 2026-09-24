-- 24.09.2026
-- 1) Magdalenenstr. 52: laut Nutzer VERKAUFT -> Verworfen.
update public.search_properties sp
set data = sp.data || jsonb_build_object(
      'status', jsonb_build_array('Verworfen'),
      'wiedervorlage', '',
      'notizen', 'VERKAUFT 24.09.2026 (Info Nutzer; IS24-Inserat deaktiviert). Kein Gebot abgegeben - der Anfrage-Entwurf an von Briskorn wird nicht versendet.' || E'\n' || coalesce(sp.data->>'notizen',''),
      'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
    updated_at = now()
where sp.data->>'adresse' = 'Magdalenenstr. 52' and not (sp.data->'status' ? 'Verworfen');

-- 2) Oberkassel 1-Zi (IS24 167698174): Inserat fuehrt jetzt WE 2 / EG rechts (375 EUR + 115 NK) statt WE 1 / EG links (370 + 140).
--    Nachfass-Mail vorbereitet: Mail vom 29.07. blieb unbeantwortet, weil Enders nur Mails MIT postalischer Anschrift bearbeitet
--    und einen Finanzierungsnachweis verlangt.
update public.search_properties sp
set data = sp.data || jsonb_build_object(
      'titel', 'BONN OBERKASSEL 1 Zimmer-Appartement im EG rechts (WE 2) zu verkaufen in toller Wohnlage mit ca. 34 m² Wfl.',
      'miete', 375,
      'ansprechpartner', 'Herr Volker Enders (ENDERS IMMOBILIEN Vermietung & Verkauf, Doppelmakler)',
      'email', 'info@enders-immobilien.de',
      'telefon', '02241 39820 / 0178 9836936',
      'wiedervorlage', '2026-10-01',
      'notizen', 'STAND 24.09.2026: Inserat aktiv, 105.000 EUR, jetzt WE 2 / EG rechts (33,91 m2, 375 EUR + 115 NK; WE 1 EG links 370 + 140 ebenfalls 105k). Mail vom 29.07. unbeantwortet - Enders bearbeitet nur Mails mit Name, postalischer Anschrift, Telefon, E-Mail + Finanzierungsnachweis. Nachfass-Entwurf an info@enders-immobilien.de angelegt (Anschrift ergaenzen, Referenzschreiben Sparkasse anhaengen). Marken unveraendert: Obergrenze 92.000 EUR (nur mit Mieterhoehung Richtung 450 EUR), 6-%-Preis auf Ist-Miete ~72.000 EUR.' || E'\n' || coalesce(sp.data->>'notizen',''),
      'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
    updated_at = now()
where sp.data->>'link' = 'https://www.immobilienscout24.de/expose/167698174' and sp.data->>'notizen' not like 'STAND 24.09.2026%';
