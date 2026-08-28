-- Beethovenstr. 50 (Bonn-Weststadt): Kaufangebot 155.000 EUR am 28.08.2026 per Mail an Hrn. Titze (PlanetHome) abgegeben.
-- Befristet bis 10.09.2026; Vorbehalte: (1) Mietkonto-Nachweis Kaltmiete, (2) ETV-Protokoll 03.08.2026,
-- (3) Zweitbesichtigung mit Handwerker inkl. Kennenlernen des Mieters. Wiedervorlage auf die Frist gesetzt.

update public.search_properties
set
  data = data || jsonb_build_object(
    'datum', '2026-08-28',
    'wiedervorlage', '2026-09-10',
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'history',
      coalesce(data->'history', '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object(
          'id', '1d7c3e92-5f48-4a06-b8d1-67e2a94f0c35',
          'ts', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
          'text', 'ANGEBOT ABGEGEBEN: 155.000 EUR per Mail an Hrn. Titze, befristet bis 10.09.2026. Vorbehalte: Mietkonto-Nachweis, ETV-Protokoll 03.08., Handwerker-Zweitbesichtigung inkl. Mieter-Kennenlernen.'
        )
      ),
    'notizen',
      (data->>'notizen')
      || E'\n\n' || 'ANGEBOT ABGEGEBEN 28.08.2026: 155.000 EUR (zzgl. Kaeuferprovision) per Mail an Hrn. Titze, BEFRISTET BIS 10.09.2026. Drei Vorbehalte: (1) Mietkonto-Nachweis der Kaltmiete (700 kalt vs. Gesamtmiete-Formulierung im Erhoehungsschreiben), (2) vollstaendiges ETV-Protokoll vom 03.08.2026 (bisher nur Anhang), (3) Zweitbesichtigung mit Handwerker zur Renovierungseinschaetzung, dabei Kennenlernen des Mieters. Begruendung in der Mail: Zustand (alte Elektrik/Heizkoerper, Tapeten von der Decke), Indexmiete ohne 558-Spielraum, Hausgeld ~437 EUR lt. WP 2026, duenne Ruecklage. Signalisiert: Finanzierung steht, kurzfristig Notar moeglich. Verhandlungsrahmen intern: hartes Limit 165.000. Naechster Schritt: Antwort abwarten (Entscheidungskette Titze -> Sohn Torjan -> Eigentuemerin Stavanger), bei Frist-Ablauf 10.09. nachfassen.'
  ),
  updated_at = now()
where data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/vermietete-2-zimmer-eigentumswohnung-mit-garage-im-musikerviertel-der-bonner-weststadt/3470543584-196-23685';

update public.inspections
set
  status = 'verhandeln',
  report = report || jsonb_build_object(
    'naechsteSchritte', 'Angebot 155.000 € am 28.08.2026 abgegeben (befristet 10.09.2026, Vorbehalte: Mietkonto, ETV-Protokoll 03.08., Handwerker-Zweitbesichtigung inkl. Mieter-Kennenlernen). Antwort abwarten, am 10.09. nachfassen. Hartes Limit 165.000 €.'
  ),
  updated_at = now()
where id = 'b7f3c2a1-9d4e-4f6b-8a21-3c5d9e7f0a12';
