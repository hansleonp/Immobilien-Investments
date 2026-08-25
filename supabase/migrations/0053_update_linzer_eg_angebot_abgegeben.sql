-- Update 18.08.2026: EG rechts Linzer Str. 62 — KAUFANGEBOT ABGEGEBEN.
-- VivaRheni-Formular "Abgabe eines Kaufangebotes", unterschrieben Bad Honnef 18.08.2026: 128.000 EUR,
-- Vorbehalt "2. Besichtigung und Oeltank-Pruefung", "Eigenkapital vorhanden" angekreuzt.
-- Status auf "Angebot abgegeben"; Match ueber data->>'link'.

update public.search_properties
set
  data = data || jsonb_build_object(
    'status', jsonb_build_array('Angebot abgegeben'),
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      (data->>'notizen')
      || E'\n' || 'ANGEBOT ABGEGEBEN 18.08.2026: 128.000 EUR via VivaRheni-Formular (unterschrieben, PDF im Unterlagen-Ordner als "Kaufangebot EG 128000 - 18.08.2026.pdf"). Vorbehalte im Formular: 2. Besichtigung + Oeltank-Pruefung; "Eigenkapital vorhanden" angekreuzt. Gueltigkeit bis 01.09.2026 stand NICHT im Formular - muss in der Begleit-Mail kommuniziert werden. Verhandlungstreppe: Ziel 134.000, hartes Limit 136.000 (mit Provision) bzw. 140.000 provisionsfrei als Schlusspunkt (gesamtkostenneutral zu 136k+Provision); Provisions-Joker und Paket-Option (~235.000, Grenze ~240.000) zurueckgehalten. Naechster Meilenstein: Antwort der Verkaeuferseite bzw. Nachfassen am 02.09.2026.'
  ),
  updated_at = now()
where data->>'link' = 'https://vivarheni.landingpage.immobilien/public/a/einheit/hBpvf6euH2YKrXjxKSa7hBE4/dCR4EdE3FpEwtb4kDFEbftJ5';
