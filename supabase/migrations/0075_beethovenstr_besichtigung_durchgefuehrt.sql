-- Beethovenstr. 50 (Bonn-Weststadt): Besichtigung durchgefuehrt 27.08.2026, 17:00 (mit Hrn. Titze).
-- Befund: Zustand eher schlecht (alte Heizkoerper, alte Elektrik, Tapeten loesen sich von der Decke; Therme/Kueche/
-- Waschbecken erneuert), Mieter bleibt, Makler laedt explizit zu Gebot 20-25 % unter Inseratspreis ein.
-- Inspection auf "weiterverfolgen" + Report; Objekt-Status + Verlauf aktualisiert.

update public.search_properties
set
  data = data || jsonb_build_object(
    'datum', '2026-08-27',
    'status', '["Besichtigung","Verhandlung"]'::jsonb,
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'history',
      coalesce(data->'history', '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object(
          'id', 'f2a91c46-8d15-4b7a-9e63-04c7d2b8a519',
          'ts', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
          'text', 'Besichtigung 27.08. 17:00: Zustand eher schlecht (alte Heizkoerper/Elektrik, Tapeten von der Decke; Therme/Kueche/Waschbecken neu). Mieter bleibt. Titze laedt explizit zu Gebot 20-25 % unter Preis ein. Naechster Schritt: schriftliches Gebot 155 T mit Vorbehalten.'
        )
      ),
    'notizen',
      (data->>'notizen')
      || E'\n\n' || 'BESICHTIGUNG DURCHGEFUEHRT 27.08.2026, 17:00 (mit Hrn. Titze): Zustand eher schlecht - alte Heizkoerper, alte Elektrik, Tapeten loesen sich teils von der Decke; erneuert sind Therme (bestaetigt), Kueche und Waschbecken. Lage sehr gut bestaetigt, Garage direkt am Haus. Mieter will trotz Zustand wohnen bleiben (findet fuer 700 EUR nichts Vergleichbares); mittelfristig Auszug wahrscheinlich. Miete lt. Besichtigung: 700 EUR netto kalt - die 80/90 EUR Garage koennen darin NICHT enthalten sein, da die Garage per separatem Vertrag an eine andere Person (H. Weber) vermietet ist; Rest-Verifikation weiter per Mietkonto. Kellerraum-Frage geklaert: Das EG ist lt. WoFlV-Aufmass ein normales Vollgeschoss (2,83 m lichte Hoehe, alle Raeume zu 100 % angerechnet), ABER es ist die originale 1937er-Substanz (nur die Obergeschosse wurden 1949 wiederaufgebaut) - aelteste Bausubstanz im Haus, passt zum Eindruck "alter Keller" und zur alten Elektrik; zudem gehoert zum Sondereigentum ein separater alter Kellerraum (nicht mitvermietet). Original-Baubeschreibung 1937 nennt Zentralheizung - erklaert den Energieausweis-Widerspruch endgueltig (spaeter auf Etagenheizungen umgestellt, alte Heizkoerper wohl aus der Altanlage).'
      || E'\n' || 'MAKLER-SIGNAL: Titze laedt ausdruecklich zu einem Gebot 20-25 % unter Inseratspreis ein (= 157.500-168.000). Strategie: schriftliches Gebot 155.000 mit Vorbehalten (1) Mietkonto-Nachweis 700 kalt, (2) ETV-Protokoll 03.08.2026, (3) zweite Besichtigung mit Handwerker zur Einschaetzung des Renovierungsaufwands bei Auszug (grob geschaetzt 25-40 T inkl. Elektrik-Neuverkabelung 8-15 T, Bad, Tapeten/Maler). Renovierung lohnt erst bei Auszug (Indexmiete deckelt Erhoehung beim Bestandsmieter; bei Neuvermietung Mietpreisbremse Bonn beachten: Vergleichsmiete +10 %, es sei denn umfassende Modernisierung). Achtung Vermieterpflichten schon vorher: Decken-Tapeten/Elektrik koennen Instandhaltungs-/Mietminderungsthemen werden - kleines Sofort-Budget einplanen. Hartes Limit bleibt 165.000.'
  ),
  updated_at = now()
where data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/vermietete-2-zimmer-eigentumswohnung-mit-garage-im-musikerviertel-der-bonner-weststadt/3470543584-196-23685';

update public.inspections
set
  status = 'weiterverfolgen',
  report = report || jsonb_build_object(
    'chancen', 'Lage sehr gut bestätigt (Musikerviertel), Garage direkt am Haus. Makler lädt explizit zu Gebot 20–25 % unter Preis ein — deckt sich mit Zielpreis 160 T€. Miete 700 € netto kalt bestätigt (Garage separat vermietet). Bei Auszug: Renovierung + Neuvermietung (Mietanhebung, optional WG) hebt Rendite deutlich.',
    'risiken', 'Zustand eher schlecht: alte Heizkörper, alte Elektrik (EG = originale 1937er-Substanz, nur OGs 1949 wiederaufgebaut), Tapeten lösen sich von der Decke. Renovierung bei Auszug grob 25–40 T€ (inkl. Elektrik 8–15 T€). Decken/Elektrik können schon beim Bestandsmieter Instandhaltungspflicht/Mietminderung auslösen. ETV-Protokoll 03.08. und Mietkonto-Nachweis stehen weiter aus.',
    'sanierungsbedarf', 'Bei Auszug: Elektrik-Neuverkabelung, Bad, Maler/Tapeten komplett, ggf. Heizkörper; Therme, Küche, Waschbecken bereits erneuert. Zweite Besichtigung mit Handwerkern als Gebotsvorbehalt geplant.',
    'naechsteSchritte', 'Schriftliches Gebot 155.000 € an Titze mit Vorbehalten: Mietkonto-Nachweis, ETV-Protokoll 03.08.2026, Handwerker-Besichtigung. Frist setzen (Entscheidungskette Titze → Sohn → Eigentümer Norwegen). Hartes Limit 165.000 €.',
    'notizen', 'Besichtigung 27.08.2026 17:00 mit Hrn. Titze. Mieter bleibt vorerst wohnen (findet für 700 € nichts anderes), mittelfristig Auszug wahrscheinlich.'
  ),
  updated_at = now()
where id = 'b7f3c2a1-9d4e-4f6b-8a21-3c5d9e7f0a12';
