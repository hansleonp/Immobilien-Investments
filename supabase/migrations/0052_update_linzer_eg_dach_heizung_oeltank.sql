-- Update 18.08.2026: EG rechts Linzer Str. 62 — Rechnungen Dach 2008 + Heizung 2010 ausgewertet (Mail Boehler 17.08.).
-- Kernpunkte: FLACHDACH (Abdichtung 2008, 18 J. alt), Oel-BRENNWERT Viessmann 2010 (gut), aber OELTANK aelter
-- (nicht Teil der 2010er-Erneuerung) und KEIN Pruefprotokoll vorhanden -> neues Verhandlungs-/KV-Thema.
-- Match ueber data->>'link'; updated_at im JSON und in der Spalte fuer den Local-first-Sync.

update public.search_properties
set
  data = data || jsonb_build_object(
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      (data->>'notizen')
      || E'\n' || 'NACHTRAG 18.08.2026 (Rechnungen liegen vor): DACH = FLACHDACH, "Sanierung der Flachdachflaeche" 11-12/2008 durch Jacobi Daecher (Koenigswinter), Pauschal 33.000 EUR brutto, bezahlt 05.12.2008 - Daemmumfang aus Rechnung nicht ersichtbar (Pauschalposition), Abdichtung ist 2026 bereits 18 Jahre alt -> naechste Flachdachsanierung in den 2030ern realistisch = ZWEITE absehbare Grossmassnahme neben Heizung, bei Ruecklage 0. HEIZUNG = Viessmann Vitoladens 300-T 42,8 kW OEL-BRENNWERT + Reflex WW-Speicher 300 l + Neutralisationsanlage + neue Abgasanlage + HYDRAULISCHER ABGLEICH (18 Thermostatventile, Strangregulierung, Berechnung) - Auftragsbestaetigung Rechmann (Unkel) 02.10.2010, Festpreis 16.065 EUR brutto. Anlage technisch gut und effizient. ABER: OELTANK war NICHT Teil der Erneuerung (nur Oelfilter/Entlueftung) -> Tank vermutlich deutlich aelter (ggf. Original 1966/67), und lt. Boehler 17.08. existiert KEIN Pruefprotokoll. Risiko: AwSV-Pruefpflicht je nach Tanktyp/Groesse, Tankalter unbekannt, Erneuerung 5-10 T EUR, Haftung bei Leckage. -> Ins Angebot als Argument aufnehmen; im KV: Tankpruefung vor Beurkundung oder expliziter Preisabschlag. Argumente-Set fuers 128k-Angebot damit komplett: Indexmiete+Bestandsgarantie, Hausgeld 393 real, Ruecklage 0, Flachdach 18 J., Oeltank ungeprueft, 4 % Zins.'
  ),
  updated_at = now()
where data->>'link' = 'https://vivarheni.landingpage.immobilien/public/a/einheit/hBpvf6euH2YKrXjxKSa7hBE4/dCR4EdE3FpEwtb4kDFEbftJ5';
