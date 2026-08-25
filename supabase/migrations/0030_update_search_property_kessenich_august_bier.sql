-- Update: Kessenich August-Bier-Str. 4 (Immowelt cdb436a2) — Maklerantwort 10.08.2026 (Fr. Rechin, RW GmbH).
-- Tuer fuer Preisvorschlag offen, kein Kuendigungsschutz, 11/26 verkauft + 2 reserviert. Status auf Verhandlung.
-- Match ueber data->>'link'; updated_at im JSON und in der Spalte fuer den Local-first-Sync.

update public.search_properties
set
  data = data || jsonb_build_object(
    'status', jsonb_build_array('Verhandlung'),
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      (data->>'notizen')
      || E'\n\n' || 'Maklerantwort 10.08.2026: Tuer fuer Preisvorschlag offen - "Bitte lassen Sie mich wissen, wie Ihre Vorstellungen sind. Nach Ruecksprache kann ich dazu bestimmt etwas sagen." Signifikante Reduzierungen laut Verkaeuferin weiterhin nicht geplant (Begruendung: qm-Preis fuer die Lage gut).'
      || E'\n' || 'Neu: KEIN Kuendigungsschutz bei dieser Wohnung (Widerspruch zur ersten Mail "eignet sich nicht fuer Eigenbedarf"; gesetzliche Sperrfrist par. 577a BGB von mind. 3 Jahren nach Erwerb umgewandelter vermieteter Wohnung gilt unabhaengig davon). Exit an Selbstnutzer nach Sperrfrist damit wieder denkbar.'
      || E'\n' || 'Absatzstand: 11 von 26 Wohnungen verkauft + 2 reserviert = Haelfte weg. These "Vonovia wird zum Aktionsende 31.12.2026 weich" dadurch geschwaecht - Verkauf laeuft. Wenn verhandeln, dann jetzt.'
      || E'\n' || 'Plan: Gebot 100.000 EUR nominal (Anker), Schmerzgrenze 105.000 EUR (= App-Logik CF 0 inkl. Aktion). Darueber aussteigen. Gegenleistung anbieten: Finanzierungsnachweis sofort, kurzfristige Besichtigung, Beurkundung im Aktionszeitraum.'
  ),
  updated_at = now()
where data->>'link' = 'https://www.immowelt.de/expose/cdb436a2-a416-4812-9672-e5087a70cf70';
