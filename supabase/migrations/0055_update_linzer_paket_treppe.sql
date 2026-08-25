-- Update 20.08.2026: Beschlossene Paket-Verhandlungstreppe (EG + 1. OG links) in beide Datensaetze.
-- Gebot erst NACH Besichtigung 1. OG. Match ueber data->>'link'.

update public.search_properties
set
  data = data || jsonb_build_object(
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      (data->>'notizen')
      || E'\n' || 'PAKET-TREPPE beschlossen 20.08.2026 (EG + 1. OG links zusammen, Gebot erst nach 1.-OG-Besichtigung): 1) Erstgebot 238.000 (-29,6 % vom Gesamt-Inserat 338k) -> 2) 245.000 (Decke mit Provision; CF konservativ mit Bad-Deal +-0) -> 3) Joker "250.000 ohne Provision" (all-in 271.300, guenstiger als 245+Prov.) -> 4) aeusserstes Ende "255.000 ohne Provision" (all-in 276.700, minimaler Limitbruch) - danach nichts mehr. Voraussetzungen: Bad-Zustand gesehen + Bad-gegen-650-Angebot an Mieterin steht; Zahlungsnachweis 571,94; KV: Lastenfreistellung, Oeltank-Pruefung, 80 % Gebaeudeanteil, Kautionen.'
  ),
  updated_at = now()
where data->>'link' in (
  'https://vivarheni.landingpage.immobilien/public/a/einheit/hBpvf6euH2YKrXjxKSa7hBE4/dCR4EdE3FpEwtb4kDFEbftJ5',
  'https://vivarheni.de/immobilie/rhein-naehe-trifft-zukunftssicherheit-vermietete-3-zimmer-wohnung-in-bad-honnef/'
);
