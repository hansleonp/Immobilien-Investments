-- Beethovenstr. 50: ETV-Protokoll 03.08.2026 GEFUNDEN und ausgewertet (28.08.2026).
-- Es lag seit 25.08. falsch benannt als "Protokoll ETV 03.07.2025 ... Kopie" in der Nachlieferung (9 statt 6 Seiten).
-- Gebots-Vorbehalt 2 damit faktisch erfuellt. Kernpunkte: WP 2026 beschlossen, Verwaltung bleibt, Heizung entschaerft,
-- ABER: Brandschutz-Befund ~800 T (Bestandsschutz), Kapitalerhoehung ~80 T angekuendigt, Ruecklage real nur 30,8 T,
-- TE-Fehler bei Garage/Laeden. Empfehlung: hartes Limit von 165 auf 160 senken.

update public.search_properties
set
  data = data || jsonb_build_object(
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'history',
      coalesce(data->'history', '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object(
          'id', '3b60f8d4-7a2e-4c91-b5f3-d8a416e97c02',
          'ts', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
          'text', 'ETV-Protokoll 03.08.2026 entdeckt (lag falsch benannt in Nachlieferung) und ausgewertet: WP 2026 beschlossen, Verwaltung bleibt, ABER Brandschutz ~800 T (Bestandsschutz), Kapitalerhoehung ~80 T angekuendigt, Ruecklage real 30,8 T, TE-Fehler Garage/Laeden. Empfehlung: Limit 165 -> 160.'
        )
      ),
    'notizen',
      (data->>'notizen')
      || E'\n\n' || 'ETV-PROTOKOLL 03.08.2026 AUSGEWERTET 28.08.2026 (lag seit 25.08. in der Nachlieferung, falsch benannt als "Protokoll ETV 03.07.2025 Kopie" - 9 Seiten statt 6; Datei umbenannt; Gebots-Vorbehalt 2 damit faktisch erfuellt, formal weiter auf offizieller Zusendung bestehen). Versammlung 17:00-20:20, 823/1000 MEA vertreten, alle Beschluesse einstimmig, Verwaltung Borchardt/Kugler (BB & Partner).'
      || E'\n' || 'POSITIV: (1) TOP 11: Verwaltung wird NICHT gekuendigt, macht weiter (Chaos-Rueckfall-Risiko vom Tisch). (2) TOP 3: JA 2025 + rueckwirkender WP 2026 einstimmig genehmigt - das 437-EUR-Hausgeld ist beschlossene Lage, keine Ueberraschung mehr. (3) TOP 7.8 Heizung: Gasthermen duerfen bleiben/getauscht werden, keine Energieberater-Neubewertung - GEG-Risiko entschaerft. (4) TOP 7.6 Wandanschluss: "sehr aufwaendig und kostenintensiv, nicht dringend solange Keller trocken" - vertagt. (5) Bleirohre zu 80 % entfernt, Frischwasser-Hauptstrang wird komplett erneuert (TOP 7.7, ~15 T, dringend, per Umlaufbeschluss priorisiert). (6) Priorisierte Sofortmassnahmen nur ~20 T gesamt (Kanal-Kamera 1,6 T + Hauptwasserleitung 15 T + Bodenablauf).'
      || E'\n' || 'NEGATIV: (1) BRANDSCHUTZ-BEFUND: saemtliche Geschossdecken Balkenkonstruktion OHNE Brandschutz, fachgerechte Sanierung ~800.000 EUR; Verwaltung schliesst Haftung im Brandfall aus; wegen Bestandsschutz NICHT zwingend erforderlich - kein Beschluss, aber latentes Substanz-/Exit-Thema (rechnerischer Anteil 51/1000 waere ~41 T). Anmerkung: EG-Wohnung liegt auf der massiven Kellerdecke (Baubeschreibung 1937) - betroffen sind die Holzbalkendecken DARUEBER. (2) KAPITALERHOEHUNG ~80.000 EUR angekuendigt; Entscheidung ueber Sonderumlage/Hausgelderhoehung ERST nach Umsetzung der priorisierten Massnahmen (TOP 8) - kommt also, Hoehe offen (Anteil 51/1000 ~4,1 T). (3) Ruecklage real per 03.08.2026 nur 30.777 EUR (+ Giro 14.436). (4) AXA-Falschabbuchungen ~10.000 EUR aus Hanus-Aera muessen zurueckgeholt werden (Anwalt/Mahnbescheide laufen); Entschaedigung Kuhl 10 T ggf. neuer Beschluss falls AXA nicht zahlt. (5) TAETIGKEITSBERICHT: "Teilungserklaerung auf MEA und m2 geprueft und nicht eindeutig zuzuordnen. Fehler bei Garage/Laeden" - betrifft potenziell UNSERE Garage Nr. 28: vor Notar klaeren! (6) TOP-7-Wunschliste gesamt grob 55-60 T (Hinterhof 25 T, Glasdach 10 T nicht empfohlen, Sandstrahlen 5 T, etc.).'
      || E'\n' || 'KONSEQUENZ: Gebot 155.000 wird durch das Protokoll eher GESTAERKT (Brandschutz + angekuendigte Kapitalerhoehung + Ruecklage 30,8 T = drei dokumentierte neue Preisargumente). EMPFEHLUNG: hartes Limit von 165.000 auf 160.000 senken. Neue Klaerpunkte vor Notar: TE-Fehler Garage/Laeden, Bestandsschutz-Dokumentation Brandschutz (Gebaeudeversicherung informiert?), Hoehe/Zeitplan Kapitalerhoehung.'
  ),
  updated_at = now()
where data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/vermietete-2-zimmer-eigentumswohnung-mit-garage-im-musikerviertel-der-bonner-weststadt/3470543584-196-23685';
