-- Beethovenstr. 50, EG links (Bonn-Weststadt): Telefonat mit Makler Hrn. Titze am 21.08.2026 + Besichtigungstermin.
-- (1) search_properties: Status Kontaktiert+Besichtigung, Telefonat-Notiz, History-Eintrag, Wiedervorlage 27.08.
-- (2) inspections: neue geplante Besichtigung Do 27.08.2026, 17:00 Uhr (Termin liegt in objekt.datum/objekt.uhrzeit).
-- Match ueber data->>'link'; updated_at im JSON und in der Spalte fuer den Local-first-Sync.

update public.search_properties
set
  data = data || jsonb_build_object(
    'neu', false,
    'status', '["Kontaktiert","Besichtigung"]'::jsonb,
    'datum', '2026-08-21',
    'wiedervorlage', '2026-08-27',
    'ansprechpartner', 'Patrick Titze (PlanetHome)',
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'history',
      coalesce(data->'history', '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object(
          'id', 'a3f6d2c8-1b7e-4e0a-9c44-5d8b2f71e930',
          'ts', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
          'text', 'Telefonat mit Hrn. Titze: Preisvorstellung ~160 T genannt; war auch sein Zielpreis-Vorschlag an den Verkaeufer (noch nicht akzeptiert). Besichtigung vereinbart: Do 27.08.2026, 17:00 Uhr.'
        )
      ),
    'notizen',
      (data->>'notizen')
      || E'\n\n' || 'Telefonat 21.08.2026 mit Hrn. Titze (PlanetHome): Eigene Preisvorstellung offen kommuniziert - rund 160.000 EUR, also 20-25 % unter Inseratspreis. Titze: 160.000 EUR war auch SEIN Zielpreis-Vorschlag an den Verkaeufer; der Verkaeufer hat dem bisher nicht zugestimmt (O-Ton Titze: muss erst "durchs Tal der Traenen" gehen und verstehen, dass die Wohnung nicht so viel wert ist). Es gab bereits zwei Interessenten, die nach Besichtigung KEIN Angebot abgegeben haben - moegliches Warnsignal: Zustand der Wohnung und Mieter bei der Besichtigung genau pruefen. Aktuell 5-6 weitere Besichtigungen angemeldet. Titze bietet einen Sicherungstermin an und raet, das Angebot trotzdem schon abzugeben; er wuerde sich beim Verkaeufer dafuer einsetzen. Einordnung: Makler-Zielpreis = unsere Preistreppe (160 T) ist ein starkes Verhandlungssignal, aber Vorsicht - Makler koennte auch nur Abschlussdruck aufbauen. BESICHTIGUNG VEREINBART: Donnerstag, 27.08.2026, 17:00 Uhr (im Besichtigungs-Reiter angelegt). Vorher klaeren/mitnehmen: offene Restfragen aus der Volldoku-Analyse (ETV-Protokoll 03.08., Mietkonto-Nachweis 700 kalt?, Therme-Rechnung, Bleigutachten, NK-Abrechnungen).'
  ),
  updated_at = now()
where data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/vermietete-2-zimmer-eigentumswohnung-mit-garage-im-musikerviertel-der-bonner-weststadt/3470543584-196-23685';

insert into public.inspections (id, user_id, title, status, objekt, questions)
select
  'b7f3c2a1-9d4e-4f6b-8a21-3c5d9e7f0a12',
  sp.user_id,
  'Beethovenstr. 50, EG links (Bonn-Weststadt)',
  'geplant',
  jsonb_build_object(
    'bezeichnung', '2-Zi-ETW EG links, Bj. 1937, vermietet (700 EUR + Garage 90 EUR)',
    'adresse', 'Beethovenstr. 50, 53115 Bonn',
    'flaeche', 58.57,
    'kaufpreis', 210000,
    'wunschpreis', 160000,
    'vermietet', true,
    'datum', '2026-08-27',
    'uhrzeit', '17:00'
  ),
  '{}'::jsonb
from public.search_properties sp
where sp.data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/vermietete-2-zimmer-eigentumswohnung-mit-garage-im-musikerviertel-der-bonner-weststadt/3470543584-196-23685'
  and not exists (
    select 1 from public.inspections where id = 'b7f3c2a1-9d4e-4f6b-8a21-3c5d9e7f0a12'
  );
