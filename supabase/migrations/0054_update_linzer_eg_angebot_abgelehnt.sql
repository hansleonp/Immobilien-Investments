-- Update 19.08.2026: EG rechts Linzer Str. 62 — 128k-Angebot vom Eigentuemer ABGELEHNT (ohne Gegenzahl).
-- Neue Marktinfo: 1. OG rechts (renoviert, bezugsfrei, Inserat 249k) hat Angebot ueber 235k.
-- Strategie: Hauptpfad Paket (EG + 1. OG links). Match ueber data->>'link'.

update public.search_properties
set
  data = data || jsonb_build_object(
    'status', jsonb_build_array('Angebot abgelehnt - verhandeln'),
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      (data->>'notizen')
      || E'\n' || 'VERHANDLUNG 19.08.2026: Eigentuemer lehnt 128.000 EUR ab - OHNE Gegenzahl ("weicht deutlich ab"). Linie: nicht gegen sich selbst bieten; konkrete Zahl per Mail angefordert, Angebot steht bis 01.09. Kontext: 1. OG rechts (renoviert, BEZUGSFREI, Inserat 249k) hat bereits 235k-Angebot - bezugsfreie Einheiten laufen nahe Inserat, die vermieteten Index-Einheiten (EG + 1. OG links) sind die Ladenhueter -> wir sind dort der realistische Kaeufer, Zeit + Zinslast (~2.500-3.000 EUR/Mon auf 750k) arbeiten fuer uns. HAUPTPFAD JETZT PAKET: EG + 1. OG links zusammen, intern ~235.000, Grenze 240.000 (Bankabloese beider Einheiten 244.500); erneut vorgeschlagen, konkretes Paketangebot nach 1.-OG-Besichtigung avisiert. Fuer 1. OG links bewusst keine Zahl genannt (nur "Logik des EG-Angebots, angepasst an niedrigere Miete"); Boehlers Anker "150k lag mal vor" unverifizierbar.'
  ),
  updated_at = now()
where data->>'link' = 'https://vivarheni.landingpage.immobilien/public/a/einheit/hBpvf6euH2YKrXjxKSa7hBE4/dCR4EdE3FpEwtb4kDFEbftJ5';
