-- Beethovenstr. 50: Nutzer hat alle Dokumente geprueft (28.08.2026) - MIETE FEST: 620 EUR kalt Wohnung + 80 EUR Garage = 700 EUR gesamt.
-- Das Expose (8.400 p.a. "zzgl." Garage 90) hat die Garage doppelt gezaehlt - Einnahmen ~13 % zu hoch dargestellt.
-- Alle Kennzahlen neu gerechnet; Gebots-/Limit-Entscheidung beim Nutzer (Empfehlung: Gebot auf ~145 T korrigieren).

update public.search_properties
set
  data = data || jsonb_build_object(
    'miete', 700,
    'wunschmiete', 735,
    'cashflow', -140,
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'history',
      coalesce(data->'history', '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object(
          'id', '9c5e7a21-3d84-4f6b-a1c9-e07b52d84f13',
          'ts', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
          'text', 'MIETE FEST GEKLAERT (eigene Dokumentenpruefung): 620 kalt Wohnung + 80 Garage = 700 gesamt. Expose zaehlte Garage doppelt. EK-Rendite bei 155 T faellt auf 4-5 % realistisch; 6-%-Zielpreis ~129-142 T. Empfehlung: Gebot auf ~145 T korrigieren.'
        )
      ),
    'notizen',
      (data->>'notizen')
      || E'\n\n' || 'MIETE FEST GEKLAERT 28.08.2026 (Nutzer hat alle Dokumente selbst geprueft): 700 EUR kalt = 620 EUR Wohnung + 80 EUR Garage. Das Expose hat die Garage DOPPELT gezaehlt ("Mieteinnahmen ca. 8.400 EUR p.a." PLUS "Garage 90 EUR zusaetzlich") - reale Einnahmen ~13 % niedriger als inseriert. Wohnungsmiete 620 = 10,59 EUR/m2 (Marktmiete 13,1-14,7).'
      || E'\n' || 'NEUE KENNZAHLEN (m0 = 700): 6-%-EK-Zielpreise: Ist-Miete/WP-Last 99 T; Ist/Last normalisiert 116 T (Wert 1,5 %) bzw. 127 T (Wert 2 %); Index gezogen (737)/normalisiert: 129 T (1,5 %) bzw. 142 T (2 %). Bei GEBOT 155 T: EK-Rendite realistisch 4,0-5,1 %, Liquiditaet -128 bis -228 EUR/M. Bei LIMIT 160 T: Liquiditaet mit WP-Last -248 EUR/M = LIQUIDITAETSSCHRANKE (-250) HAARSCHARF - 160 ist mit den neuen Zahlen nicht mehr haltbar. Auszug-Szenario bei 155 T (Reno 30 T, Neuvermietung ~850+80): ~7,5 %. Wertaufholungs-Szenario bleibt zusaetzliche Upside.'
      || E'\n' || 'INDEX-MOEGLICHKEITEN: Wohnung 620 EUR Indexmiete, letzte Anpassung 06/2023 -> VPI seit 06/2023 ~+5,5-6 % = Erhoehung auf ~655 EUR SOFORT nach Eigentumsumschreibung moeglich (Textform-Erklaerung mit Indexstaenden, Wirkung uebernaechster Monat, KEINE Zustimmung des Mieters noetig - anders als 558); danach jaehrlich ~VPI (~2 %). Garage (kein Wohnraummietrecht, 3 Monate kuendbar): Aenderungskuendigung auf ~100 EUR marktueblich moeglich. Kurzfristig erreichbar: ~655 + 80/100 = 735-755 EUR gesamt.'
      || E'\n' || 'EMPFEHLUNG (Entscheidung offen): Gebot von 155 T auf ~145.000 korrigieren - Begruendung wasserdicht: Inserats-Mieteinnahmen waren doppelt gezaehlt, genau dafuer war Vorbehalt 1 (Mietkonto-Nachweis) da; kein taktisches Nachverhandeln, sondern Korrektur einer falschen Angabe. Neues Limit dann 150-155. Alternativ 155 als bewussten zweiten Kompromiss halten (A-Lage/Auszug-Wette) - dann muss aber das Limit von 160 auf 155 runter (Gebot = Limit).'
  ),
  updated_at = now()
where data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/vermietete-2-zimmer-eigentumswohnung-mit-garage-im-musikerviertel-der-bonner-weststadt/3470543584-196-23685';
