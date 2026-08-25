-- Update 21.08.2026: Bonn-Endenich, Von-Weichs-Str. 20 (Kleinanzeigen 3424883857, privat)
-- Besichtigungstermin Sa 22.08.2026 mit Herrn Klein (Verkaeufer, privat/provisionsfrei) eingetragen.
-- Status Neu -> Kontaktiert + Besichtigung, Ansprechpartner gesetzt, Fragenliste verlinkt.
-- Bewertung unveraendert (Ziel ~99.000 EUR / konservativ ~82.000 EUR, Stand 05.08.) - Neuberechnung
-- erst nach der Besichtigung, sobald Ist-Miete und Hausgeld-Split bekannt sind.
-- Match ueber data->>'link'; updated_at im JSON und in der Spalte fuer den Local-first-Sync.

update public.search_properties
set
  data = data || jsonb_build_object(
    'status', jsonb_build_array('Kontaktiert', 'Besichtigung'),
    'neu', false,
    'ansprechpartner', 'Herr Klein (Verkaeufer, privat)',
    'datum', '2026-08-22',
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      (data->>'notizen')
      || E'\n' || 'BESICHTIGUNG Sa 22.08.2026 mit Herrn Klein (Verkaeufer, privat, provisionsfrei). Kein Gebot vor Ort - Ziel des Termins sind die zwei fehlenden Zahlen: (1) IST-MIETE inkl. Vertragstyp (Standard/Staffel/Index) und Erhoehungshistorie - das Inserat nennt keine Miete, die 380 EUR in dieser Bewertung sind eine Mietspiegel-Schaetzung, keine Tatsache; (2) HAUSGELD-SPLIT (umlagefaehig / nicht umlagefaehig / Ruecklagenzufuehrung). Erst danach Neuberechnung des Zielpreises unter der am 17.08. beschlossenen Finanzierungsannahme (4 % Zins + 2 % Tilgung) - die aktuellen Marken 99.000 / 82.000 EUR stammen vom 05.08. und liegen unter der neuen Annahme niedriger.'
      || E'\n' || 'Verhandlungshebel: online seit 04/2026 (~4,5 Monate Standzeit) UND eine Senkung ist schon durch (139.000 -> 127.500 EUR, -8,3 %). 6.375 EUR/m2 ist der teuerste Quadratmeterpreis im gesamten Analyse-Log - direkte Nachbarschaft liegt bei 5.355 EUR/m2 (Von-Weichs-Str. 22, 24,09 m2 mit TG, 129.000 EUR) bzw. 5.906 EUR/m2 (19,47 m2 Bj. 1983 mit Stellplatz, 115.000 EUR), d. h. Nr. 20 liegt 8-19 % ueber der eigenen Strasse. Provisionsfrei senkt die KNK auf ~8 % - Vorteil des Kaeufers, nicht Argument fuer einen hoeheren Preis.'
      || E'\n' || 'Zwingend vor Ort zu klaeren: TG-Stellplatz = Teileigentum mit Grundbuchblatt oder nur Sondernutzungsrecht? (Bei Von-Weichs-Str. 11 war der Stellplatz laut ETV-Protokoll Gemeinschaftsflaeche OHNE grundbuchliche Zuweisung, obwohl das Expose ihn der Wohnung zuschlug - gleiche Strasse, gleiche Baujahre.) Ausserdem: gehoeren Nr. 20 und Nr. 22 zur selben WEG? Falls ja, sind Hausgeld 207 EUR / n. uml. ~65 EUR / MEA 240-10.000 aus Nr. 22 als Gegenprobe verwendbar (auf 20 m2 skaliert ~172 EUR bzw. ~54 EUR). Weiter offen: Energieausweis (fehlt komplett im Inserat - Pflichtvorlage nach Par. 80 GEG), Waermeerzeuger-Baujahr, Ist-Ruecklage, Sonderumlagen, Abgeschlossenheitsbescheinigung (Pantrykueche in der Diele), Wohnflaechenberechnung (20 m2 nachmessen), Waschmaschinenanschluss in der Wohnung (Inserat nennt nur Muenz-Waschkeller).'
      || E'\n' || 'Eigenstaendig zu klaeren: 20 m2 liegen bei vielen Banken unter der Finanzierungsgrenze bzw. werden mit Bewertungsabschlag belegt - vor jedem Gebot mit der Bank abstimmen. Fragenliste: docs/besichtigung-2026-08-22-von-weichs-20-endenich.md'
  ),
  updated_at = now()
where data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/studentenwohnung-1-zi-apartment-eigentumswohnug-bonn-end-/3424883857-196-23694';
