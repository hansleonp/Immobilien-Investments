-- Update: Kessenich August-Bier-Str. 4 (Immowelt cdb436a2) — Nachbewertung 11.08.2026 mit Original-Unterlagen.
-- Urteil hochgestuft auf "Kaufen wenn Preis passt (max. 105.000 EUR nominal mit Aktion)".
-- Nachtrag: die zugehoerige Migration war am 11.08. an einem API-Abbruch gescheitert, daher erst jetzt eingespielt.
-- Match ueber data->>'link'; updated_at im JSON und in der Spalte fuer den Local-first-Sync.

update public.search_properties
set
  data = data || jsonb_build_object(
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      (data->>'notizen')
      || E'\n\n' || 'Nachbewertung 11.08.2026 mit Original-Unterlagen (Expose, Grundbuchauszug, Bedarfsausweis, HG-Abrechnung 2025, WP 2027, ETV-Protokolle 2024 + 2026): Urteil hochgestuft auf KAUFEN WENN PREIS PASST (max. 105.000 EUR nominal mit Aktion).'
      || E'\n' || 'Echte Zahlen: n. uml. Hausgeld real ~82 EUR/M (49 EUR Bewirtschaftung + 33 EUR Ruecklagenzufuehrung; umlagefaehig ~75 EUR), Nachzahlung 2025 nur 13,24 EUR; Hausgeld sinkt lt. beschlossenem WP ab 01.01.2027 von 171 auf 147 EUR/M.'
      || E'\n' || 'Risiken abgeraeumt: Grundbuch Abt. II + III leer (Konzern-Grundschuld 2018 geloescht), Sondernutzungsrecht Keller; keine Sonderumlagen, keine Sanierungsbeschluesse, keine Hausgeldrueckstaende (beide ETVs einstimmig, Verwalter entlastet); Waermeerzeuger Haus 4 Bj. 2011; Bedarfsausweis Klasse D (111,8 kWh/m2a, Huelle HT-Strich 0,62 = gut, gueltig bis 16.04.2034).'
      || E'\n' || 'Wichtig: Teilung nach par. 8 WEG bereits am 20.01.2003 eingetragen (nicht erst 2021) - Mieter zog 2019 NACH Begruendung des Wohnungseigentums ein, daher kein Vorkaufsrecht par. 577 BGB und keine Kuendigungssperrfrist par. 577a BGB. Eigenbedarf grundsaetzlich moeglich = Exit an Selbstnutzer flexibel; Maklerin-Aussage "kein Kuendigungsschutz" stimmt.'
      || E'\n' || 'Rechnung: Gebot 100.000 EUR mit Aktion = Faktor 22,2, App-CF +20 EUR/M; konservativ auf reiner Ist-Miete -62 EUR, mit markt- und kappungsgedeckter Mieterhoehung auf ~430 EUR ca. +/-0 - der Case haengt an der Mieterhoehung. Konservativ CF 0 mit echten Zahlen bei ~76.000 EUR (mit Mieterhoehung ~91.000 EUR). Schmerzgrenze 105.000 EUR haelt, darueber nicht kaufen.'
      || E'\n' || 'Gegenwind: Ruecklage bleibt duenn (40.000 EUR per 31.12.2025 nur als SOLL ausgewiesen, Zufuehrung sinkt 2027 von 30.000 auf 20.000 EUR/J.), GEG-Entscheidung der WEG zur Etagenheizung steht aus, Therme-Baujahr der WE 13 unklar (Haus-Wert 2011 nicht zwingend uebertragbar).'
      || E'\n' || 'Weiter offen (vor Notartermin klaeren): Mietvertrag + Kautionsnachweis, Vermoegensbericht (Ist-Ruecklage), TE/GO-Neufassung 2023-2025 + Aufteilungsplan, WP 2026, Balkon ja/nein (Expose-Widerspruch), Wohnflaechenberechnung (29,5 vs. ca. 30 m2), Kaufvertragsentwurf mit Aktionsklausel. Fragenliste fuer Besichtigung: docs/besichtigung-august-bier-fragenliste.md.'
  ),
  updated_at = now()
where data->>'link' = 'https://www.immowelt.de/expose/cdb436a2-a416-4812-9672-e5087a70cf70';
