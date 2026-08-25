-- Update 20.08.2026: Linzer Str. 62 — Verhandlung geparkt. Eigentuemer-"Untergrenzen" (1. OG 150k = -5,7 %,
-- Paket 320k = -5,3 % vom Inserat) liegen 35-75k ueber unseren Decken -> kein Deal-Korridor.
-- Marker gesetzt (Paket ~240k), Besichtigung zurueckgestellt, EG-Angebot laeuft 01.09. aus.
-- Beide Datensaetze auf Beobachten + Wiedervorlage 15.10.2026. Match ueber data->>'link'.

update public.search_properties
set
  data = data || jsonb_build_object(
    'status', jsonb_build_array('Beobachten - geparkt'),
    'wiedervorlage', '2026-10-15',
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      (data->>'notizen')
      || E'\n' || 'GEPARKT 20.08.2026: Eigentuemer nennt "Untergrenzen" 150.000 (1. OG links, -5,7 %) und 320.000 (Paket, -5,3 %) - praktisch keine Bewegung, Luecke zu unseren Decken 35k (1. OG) bzw. 75k (Paket, CF konservativ dort -377/Mon). Entscheidung: NICHT weiterjagen. Mail 20.08.: transparent ausgestiegen, Marker "Paket um 240.000" gesetzt, Besichtigung 1. OG zurueckgestellt, EG-Angebot laeuft 01.09. aus, Tuer offen ("durchfinanziert, kurzfristig abschlussfaehig"). WIEDERVORLAGE 15.10.2026: Sind die vermieteten Index-Einheiten dann noch inseriert (Zinslast ~2.500-3.000/Mon auf 750k-Gesamthaft laeuft), anrufen - dann ist der Preis weich. Treppen bleiben gueltig: EG 128->136 (140 o. Prov.), 1. OG 100->115 (nur mit Bad-Deal), Paket 238->245 (250-255 o. Prov.).'
  ),
  updated_at = now()
where data->>'link' in (
  'https://vivarheni.landingpage.immobilien/public/a/einheit/hBpvf6euH2YKrXjxKSa7hBE4/dCR4EdE3FpEwtb4kDFEbftJ5',
  'https://vivarheni.de/immobilie/rhein-naehe-trifft-zukunftssicherheit-vermietete-3-zimmer-wohnung-in-bad-honnef/'
);
