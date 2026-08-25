-- Update 20.08.2026: Linzer Str. 62 — Marker in der Ausstiegs-Mail erweitert:
-- "Paket um 240.000" PLUS offengelegte absolute Decke "aeusserstenfalls 255.000 provisionsfrei
-- mit zuegigem Notartermin" (all-in 276.700). Endgame damit vollstaendig offengelegt - im Oktober
-- muss die Gegenseite nur noch ja sagen. Match ueber data->>'link'.

update public.search_properties
set
  data = data || jsonb_build_object(
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      (data->>'notizen')
      || E'\n' || 'MARKER-UPDATE 20.08.2026 (finale Ausstiegs-Mail): Kommuniziert wurde "Paket um 240.000" UND die absolute Decke "aeusserstenfalls 255.000 EUR provisionsfrei bei zuegigem Notartermin" (all-in 276.700). Endgame offengelegt - Verhandlungstreppe damit obsolet, es gilt nur noch: Annahme zu <=255k provisionsfrei (+ KV-Punkte: Lastenfreistellung, Oeltank-Pruefung, 80 % Gebaeudeanteil, Bad-Deal-Bestaetigung, Zahlungsnachweise) oder kein Deal. Zusaetzlich in der Mail: Standing Order an Boehler fuer weitere Kapitalanlagen in Bonn/Bad Honnef (auch vermietete Einheiten, an denen andere zoegern) - "Sie wissen, wie ich rechne, ich kaufe schnell".'
  ),
  updated_at = now()
where data->>'link' in (
  'https://vivarheni.landingpage.immobilien/public/a/einheit/hBpvf6euH2YKrXjxKSa7hBE4/dCR4EdE3FpEwtb4kDFEbftJ5',
  'https://vivarheni.de/immobilie/rhein-naehe-trifft-zukunftssicherheit-vermietete-3-zimmer-wohnung-in-bad-honnef/'
);
