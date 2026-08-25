-- Beethovenstr. 50 (Bonn-Weststadt): Neubewertung nach EK-Rendite-Kriterium (seit 23.08.) + dokumentierter Kompromiss 25.08.2026.
-- Formal verfehlt das Objekt bei 160 T die 6-%-Schwelle (3,1-5,1 % je Szenario); Entscheidung: 160 T als bewusster
-- Kompromiss wegen Wertaufholungs-Potenzial (Einkauf ~2.732 EUR/m2) und WG-Option bei Auszug (2 getrennte Zimmer).
-- Marken unveraendert: Ziel 160.000, Erstgebot 155.000, hartes Limit 165.000.

update public.search_properties
set
  data = data || jsonb_build_object(
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'history',
      coalesce(data->'history', '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object(
          'id', 'e5b82d19-4c73-4a6f-b3e8-92d7f0c145a7',
          'ts', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
          'text', 'EK-Rendite-Check: 6 % formal verfehlt (3,1-5,1 % bei 160 T). Entscheidung: 160 T als dokumentierter Kompromiss (Wertaufholung + WG-Option), Erstgebot bleibt 155 T.'
        )
      ),
    'notizen',
      (data->>'notizen')
      || E'\n\n' || 'EK-Rendite-Pruefung 25.08.2026 (neues Kaufkriterium seit 23.08.: Lage-Veto -> Liquiditaetsschranke -250 -> EK-Rendite >= 6 % IRR/10 J): Lage-Veto nein (A-Lage). Liquiditaetsschranke: zum INSERATSPREIS 210 T GERISSEN (-358 EUR/M mit WP-2026-Last) -> 210 T nach neuer Logik per se raus; ab ~165 T eingehalten. EK-Rendite bei 160 T: nur 3,1 % (Ist-Miete 790, WP-Last 308) bis 5,1 % (Index gezogen 827, Last normalisiert 245); 6-%-Zielpreis laege je Szenario bei ~122-148 T. FORMAL VERFEHLT.'
      || E'\n' || 'ENTSCHEIDUNG (dokumentierter Kompromiss): Zielpreis bleibt 160.000, Erstgebot 155.000, hartes Limit 165.000 - Abweichung vom 6-%-Kriterium bewusst akzeptiert wegen zweier Upsides, die die Standard-IRR (nur 1,5 %/J Wert ab Kaufpreis) nicht abbildet: (1) WERTAUFHOLUNG: Einkauf bei 160 T = 2.732 EUR/m2, ~40 % unter Weststadt-Schnitt (~4.580); Rueckkehr auf nur konservative 4.000 EUR/m2 in 10 J (= +3,9 %/J) hebt die EK-Rendite auf ~9,3 % mit Ist-Miete bzw. ~9,9 % mit gezogenem Index. (2) WG-OPTION BEI AUSZUG: 2 getrennte Zimmer, Uni-Naehe - als 2er-WG ~900 EUR kalt + 90 Garage erzielbar; dann EK-Rendite ~8,3 % (selbst mit nur 1,5 % Wert), Stress 0 % Wert immer noch 5,2 %, Liquiditaet dreht auf +105 EUR/M. EHRLICHE EINSCHRAENKUNG: Beide Upsides sind nicht kontrollierbar - Wertaufholung ist eine Marktwette (EG, kein Balkon, Renovierungsstau druecken den fairen m2-Wert unter den Stadtteil-Schnitt), die WG-Option braucht den Auszug des Index-Mieters (seit 2017, guenstiger Vertrag -> bleibt evtl. lange) plus vorab Renovierung Bad/Kueche. Basis-Szenario ohne beide Upsides bleibt 3-5 % EK-Rendite.'
  ),
  updated_at = now()
where data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/vermietete-2-zimmer-eigentumswohnung-mit-garage-im-musikerviertel-der-bonner-weststadt/3470543584-196-23685';
