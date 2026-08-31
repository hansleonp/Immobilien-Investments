-- Beethovenstr. 50: Titze-Mail 31.08.2026 (Montag frueh) — VORBEHALT 1 AUFGELOEST:
-- Verkaeuferseite bestaetigt selbst: 700 EUR Wohnung INKL. NK + 90 EUR Garage inkl. NK -> Kaltmiete 620 EUR
-- (exakt der eigene Dokumentenbefund). Titze bittet AKTIV um ein angepasstes Angebot.
-- Empfehlung: neues Angebot 140.000 (konservativer Anker, Korrektur nur nach oben moeglich),
-- Ziel-Abschluss 145.000, hartes Limit 148.000. Entscheidung des Nutzers zum Betrag ausstehend.

update public.search_properties
set
  data = data || jsonb_build_object(
    'miete', 700,
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'wiedervorlage', '2026-09-03',
    'history',
      coalesce(data->'history', '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object(
          'id', '4a8f2c61-7d95-4b30-a6e8-19c5d3f7b028',
          'ts', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
          'text', 'VORBEHALT 1 AUFGELOEST: Titze bestaetigt per Mail (Quelle: Sohn/Vater-Konto) 700 inkl. NK Wohnung + 90 inkl. NK Garage -> Kaltmiete 620. Er bittet AKTIV um angepasstes Angebot. Empfehlung: neues Gebot 140.000, Ziel 145.000, Limit 148.000.'
        )
      ),
    'notizen',
      (data->>'notizen')
      || E'\n\n' || 'TITZE-MAIL 31.08.2026 (Montag frueh): VORBEHALT 1 AUFGELOEST - die Verkaeuferseite bestaetigt selbst, dass auf dem Konto des Eigentuemers 700 EUR fuer die Wohnung und 90 EUR fuer die Garage eingehen, JEWEILS INKLUSIVE NEBENKOSTEN. Titzes eigene Herleitung: Gesamtmiete 680 -> 700, NK unveraendert -> KALTMIETE 620 EUR. Deckt sich exakt mit dem eigenen Dokumentenbefund (620 + 80). Titze bittet ausdruecklich um ein ANGEPASSTES ANGEBOT bei fortbestehendem Interesse - die Preisanpassung ist damit seine Initiative, kein eigener Rueckzieher. Alle Kalkulationen auf 620er-Basis gelten unveraendert (All-in-EK-Rendite: 6 % nur bei ~145 T im Auszug-Szenario; ETF-Vergleich: Patt erst ab <=145). EMPFEHLUNG neues Angebot: 140.000 EUR als konservativer Anker (strenge Kapitalisierung der Mietdifferenz ergaebe sogar ~139: 80 EUR/M x 12 x Faktor ~17 = ~16 T unter dem alten 155er-Gebot), ZIEL-ABSCHLUSS 145.000, HARTES LIMIT 148.000. Verbleibende Vorbehalte im neuen Angebot: Zweitbesichtigung mit Handwerker inkl. Mieter-Kennenlernen; ETV-Protokoll erledigt, Mietnachweis durch Titze-Bestaetigung erledigt (beim Notar noch einen Kontoauszug zur Akte nehmen). Wiedervorlage 03.09.'
  ),
  updated_at = now()
where data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/vermietete-2-zimmer-eigentumswohnung-mit-garage-im-musikerviertel-der-bonner-weststadt/3470543584-196-23685';
