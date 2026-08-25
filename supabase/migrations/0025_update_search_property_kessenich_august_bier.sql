-- Update: Kessenich August-Bier-Str. 4 (Immowelt cdb436a2) — Maklerantwort 08.08.2026 (Fr. Rechin, RW GmbH).
-- Unterlagen erhalten, Verkaeuferin schliesst signifikante Nachlaesse aus, kein Eigenbedarf moeglich,
-- Finanzierungsnachweis vor Besichtigung verlangt. Status auf Kontaktiert, neue Kontaktdaten, Notizen ergaenzt.
-- Match ueber data->>'link'; updated_at im JSON und in der Spalte fuer den Local-first-Sync.

update public.search_properties
set
  data = data || jsonb_build_object(
    'status', jsonb_build_array('Kontaktiert'),
    'neu', false,
    'telefon', '0160 95940106',
    'email', 'vertrieb@rw-immo.org',
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      (data->>'notizen')
      || E'\n\n' || 'Maklerantwort 08.08.2026 (Fr. Rechin, neue Kontaktdaten: vertrieb@rw-immo.org, 0160 95940106): Unterlagen erhalten (Expose, Grundbuchauszug, Energieausweis, letzte Hausgeldabrechnung, aktueller Wirtschaftsplan, ETV-Protokolle 2024 + 2026) - Nachbewertung mit Unterlagen steht aus.'
      || E'\n' || 'Verkaeuferin (Vonovia) laesst ausrichten: signifikante Kaufpreisreduzierungen NICHT vorgesehen; Wohnung eignet sich nicht fuer Eigenbedarf (vermutlich verlaengerter Kuendigungsschutz aus der Privatisierung - schraenkt auch den spaeteren Exit an Selbstnutzer ein). Besichtigung erst nach individuellem Finanzierungs-/Machbarkeitsnachweis.'
      || E'\n' || 'Konsequenz: Zielpreis ~105.000 EUR nominal erfordert ~15 % Nachlass = genau das, was ausgeschlossen wird. Zum Angebotspreis bleibt die Rechnung negativ (CF -97 App-Logik / ca. -171 konservativ). Plan: Preisvorstellung offen kommunizieren, Finanzierungsnachweis + Besichtigung nur bei realistischer Chance auf die Groessenordnung.'
  ),
  updated_at = now()
where data->>'link' = 'https://www.immowelt.de/expose/cdb436a2-a416-4812-9672-e5087a70cf70';
