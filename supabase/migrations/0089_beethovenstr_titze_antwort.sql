-- Beethovenstr. 50: Antwort von Hrn. Titze auf das 155er-Gebot, Mail 28.08.2026 14:01.
-- Sohn des Eigentuemers steht dem Angebot "sehr offen" gegenueber, Besprechung mit Vater am Wochenende,
-- konkrete Rueckmeldung Anfang naechster Woche. Offizielles ETV-Protokoll 03.08. nachgereicht (Anhang),
-- Mietnachweis von Titze selbst angefordert (er bestaetigt die 700 kalt ausdruecklich NICHT),
-- Zweitbesichtigung mit Handwerker zugesagt nach Mietnachweis + Eigentuemer-Zustimmung.

update public.search_properties
set
  data = data || jsonb_build_object(
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'wiedervorlage', '2026-09-02',
    'history',
      coalesce(data->'history', '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object(
          'id', '5f1c8d72-a943-4e06-b2d8-71e4c90a3f65',
          'ts', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
          'text', 'Titze-Antwort auf 155er-Gebot: Sohn "sehr offen", Besprechung mit Vater am WE, Rueckmeldung Anfang naechster Woche. ETV-Protokoll offiziell nachgereicht, Mietnachweis von Titze angefordert (700 kalt NICHT bestaetigt!), Zweitbesichtigung zugesagt. Wiedervorlage 02.09.'
        )
      ),
    'notizen',
      (data->>'notizen')
      || E'\n\n' || 'TITZE-ANTWORT 28.08.2026, 14:01 (auf das 155er-Gebot): (1) Sohn des Eigentuemers steht dem Angebot "sehr offen" gegenueber, bespricht es am Wochenende mit dem Vater, konkrete Rueckmeldung Anfang naechster Woche - starkes Signal bei -26 % zum Inseratspreis, passt zu Titzes eigener 160er-Empfehlung. (2) Offizielles ETV-Protokoll 03.08. als Anhang nachgereicht ("Versehen") - MIT UNSERER 9-SEITEN-VERSION ABGLEICHEN (die lag falsch benannt schon vor). (3) WICHTIG: Titze bestaetigt die 700 kalt ausdruecklich NICHT ("laesst sich erst nach Pruefung verbindlich bestaetigen") und hat den Mietnachweis selbst angefordert - er hat den Zweifel damit AKTENKUNDIG gemacht; zeigt der Nachweis 620 kalt, ist eine Preisanpassung seine eigene Steilvorlage. (4) Zweitbesichtigung mit Handwerker zugesagt, aber erst nach Mietnachweis + Eigentuemer-Zustimmung - okay, solange klar bleibt: Zustimmung = Zustimmung zum Angebot MIT den drei Vorbehalten. SPIELZUG bei Zusage + 620er-Nachweis: HALTEN zu 155 (Entscheid 28.08., in Kenntnis der echten Miete getroffen; Nachverhandeln nach "sehr offen"-Signal kostet Vertrauen), danach sofort Index ziehen. Wiedervorlage 02.09. (Rueckmeldung faellig).'
  ),
  updated_at = now()
where data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/vermietete-2-zimmer-eigentumswohnung-mit-garage-im-musikerviertel-der-bonner-weststadt/3470543584-196-23685';
