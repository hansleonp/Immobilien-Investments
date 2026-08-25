-- Nachtrag zur Erstbewertung 24.08.2026 (Bonn-Castell, 3-Parteienhaus, Scout-ID 169169803):
-- Kontaktdaten von Wind Immobilien aus dem Impressum ergaenzt (im IS24-Inserat nur nach Klick sichtbar).

update public.search_properties
set data = jsonb_set(
      jsonb_set(
        jsonb_set(data, '{telefon}', '"+49 2244 9000800"'::jsonb, true),
        '{email}', '"info@wind-immobilien.de"'::jsonb, true),
      '{updated_at}', '"2026-08-24T13:00:00.000Z"'::jsonb, true),
    updated_at = now()
where data->>'link' = 'https://www.immobilienscout24.de/expose/169169803';
