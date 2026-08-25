-- Update: Kessenich-DG (Kleinanzeigen 3438579091 / Becker-2397) — Nachprüfung Original-Maklerseite 05.08.2026.
-- Kontaktdaten Nico Kalf ergänzt, Notizen um Erkenntnisse der Maklerseite erweitert. Urteil unverändert bestätigt.
-- Match über data->>'link'; updated_at im JSON und in der Spalte, damit der Local-first-Sync die Änderung übernimmt.

update public.search_properties
set
  data = data || jsonb_build_object(
    'telefon', '0228 967696 13',
    'email', 'n.kalf@beckerimmobilien.info',
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      'Analyse 05.08.2026: Kaufen wenn Preis passt. Zielpreis ~210.000 EUR (konservativ CF 0 bei ~206.500 EUR; App-Logik CF 0 bei 233.300 EUR), max. ~220.000 EUR. Bei 238.000 EUR: CF -18 (App-Logik), konservativ ca. -121 EUR/Monat (inkl. n. uml. Hausgeld ~50 EUR geschaetzt + Ruecklage 0,80 EUR/m2), Faktor 22,2, Brutto 4,5 %.'
      || E'\n' || 'Nachpruefung 05.08.2026 (Original-Maklerseite beckerimmobilien.info, Becker-2397): Urteil bestaetigt, keine neuen Wirtschaftszahlen. Neu: Kontakt Nico Kalf direkt (0228 967696 13, n.kalf@beckerimmobilien.info); Grundstueck 436 m2 Volleigentum (kein Erbbaurecht); Kelleranteil ~10 m2 Nutzflaeche; weisse Kunststofffenster doppelt isolierverglast; Laminat; 1 Bad, 2 Schlafzimmer; bezugsfrei sofort; Verbrauchsausweis C (80,7 kWh, mit Warmwasser) gueltig bis 02.11.2031 bestaetigt. Widerspruch Etage: Eckdaten "2. OG" vs. Beschreibung "3. OG" - vor Ort klaeren. Adresse weiter nicht genannt (Karte nur nach Login).'
      || E'\n' || 'Mietansatz (bezugsfrei): Vergleichsmiete konservativ 12,50 EUR/m2 = 825 EUR + Garage ~70 EUR = 895 EUR kalt. Kessenich-Spanne lt. Portalen 12,44-17,28 EUR/m2 (Schnitt ~14,26) - Luft nach oben.'
      || E'\n' || 'Pluspunkte: 3.606 EUR/m2 inkl. Einzelgarage deutlich unter Kessenich-Schnitt (~4.400-5.100 EUR/m2); Klasse C fuer Bj. 1959 gut; kleines 6-Parteien-Haus, Gartenmitbenutzung, EBK + Teilmobiliar inklusive; A-Mikrolage Kessenich (Puetzstrasse, Linien 62/66, Uniklinik/Venusberg, UN-/Bundesviertel).'
      || E'\n' || 'Risiken / weiter offen: Gas-Etagenheizung ausdruecklich veraltet (Kachelofenmodell, Baujahr unbekannt) - Austausch ~8-12 TEUR zulasten Sondereigentum; Dachzustand (DG, Bj. 1959); Ruecklage + Protokolle der 6-Parteien-WEG (Hausgeld 150 EUR deutet auf duenne Ruecklage); n. uml. Hausgeld-Anteil; Garage-Teileigentum; vermutlich ohne Aufzug.'
      || E'\n' || 'Status: Besichtigungs-Mail an Hrn. Kalf entworfen (Terminwunsch werktags nach 17 Uhr, gerne kurzfristig, Makler soll Termin vorschlagen), noch nicht versendet.'
  ),
  updated_at = now()
where data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/gepflegte-3-zimmer-dg-wohnung-mit-sonnenbalkon-und-pkw-garage-in-beliebter-lage-von-bonn-kessenich/3438579091-196-23696';
