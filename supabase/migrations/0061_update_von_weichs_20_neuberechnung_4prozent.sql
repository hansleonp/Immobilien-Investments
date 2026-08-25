-- Update 21.08.2026: Bonn-Endenich, Von-Weichs-Str. 20 (Kleinanzeigen 3424883857, privat)
-- Neuberechnung unter der Finanzierungsannahme vom 17.08.2026 (4 % Zins + 2 % Tilgung,
-- Darlehen = 80 % des Preises, KNK aus Eigenkapital; hier provisionsfrei -> KNK 8,5 %).
-- Die alten Marken (Ziel 99.000 / konservativ 82.000 EUR, Stand 05.08.) sind OBSOLET und
-- werden ersetzt: Ziel 76.000 EUR, Schmerzgrenze 85.000 EUR (Basisfall Miete 380 EUR / Last 75 EUR).
-- notizen werden komplett neu geschrieben (kein Anhaengen), damit keine veralteten Marken stehen bleiben.
-- Ausserdem: 'datum' wird auf 2026-04-01 korrigiert (= Naeherung fuer "online seit 04/2026", exakter
-- Tag nicht ermittelbar). Migration 0059 hatte dort faelschlich den Besichtigungstermin eingetragen;
-- 'datum' ist laut Property-Typ das Veroeffentlichungsdatum des Inserats.
-- Match ueber data->>'link'; updated_at im JSON und in der Spalte fuer den Local-first-Sync.

update public.search_properties
set
  data = data || jsonb_build_object(
    'wunschpreis', 76000,
    'wunschmiete', 380,
    'cashflow', -130,
    'status', jsonb_build_array('Kontaktiert', 'Besichtigung'),
    'neu', false,
    'ansprechpartner', 'Herr Klein (Verkaeufer, privat)',
    'datum', '2026-04-01',
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      'Analyse 21.08.2026 (Neuberechnung, ersetzt die Erstbewertung vom 05.08.): **FINGER WEG.** '
      || 'Zielpreis **76.000 EUR** (= konservativer Cashflow +-0 UND 6 % Bruttorendite, Kaufpreisfaktor 16,7), '
      || 'Schmerzgrenze **85.000 EUR**, App-Logik CF +-0 erst bei 95.000 EUR. '
      || 'Die alten Marken 99.000 / 82.000 EUR sind obsolet (standen auf der alten Finanzierungsannahme). '
      || 'Bei Inseratspreis 127.500 EUR: Rate 510 EUR, CF App-Logik -130 EUR, konservativ -205 EUR, Faktor 28,0, Bruttorendite 3,58 %. '
      || 'Noetiger Nachlass: 40 % auf das Ziel, 33 % auf die Schmerzgrenze.'
      || E'\n' || 'KILLER-TEST (ohne Kredit): (380 - 75) x 12 / (127.500 + 8,5 % KNK) = 2,65 % unverzinste Nettorendite - unter der 3-%-Schwelle. Selbst im Bestfall (Miete 420 EUR, Eigentuemerlast 55 EUR) nur 3,17 %. '
      || 'RUECKWAERTSRECHNUNG: fuer konservativen CF +-0 zum Inseratspreis braeuchte es 585 EUR kalt = 29,25 EUR/m2. Unerreichbar - Endenicher Mietspiegel 13,42-17,79 EUR/m2; die angesetzten 380 EUR sind 19,00 EUR/m2 und liegen damit schon UEBER der Obergrenze (Marktdatenpunkt: 20 m2 in Endenich = 500 EUR warm, entspricht ca. 350-380 EUR kalt). Das Objekt ist zu keinem realistischen Mietansatz zum Angebotspreis tragfaehig.'
      || E'\n' || 'SENSITIVITAET P_max konservativ bei Eigentuemerlast 75 EUR (Nennt Klein eine Miete -> hier ablesen): 300 EUR -> 56.250 EUR | 330 EUR -> 63.750 EUR | 360 EUR -> 71.250 EUR | 380 EUR -> 76.250 EUR | 420 EUR -> 86.250 EUR. Bei Last 55 EUR jeweils +5.000 EUR, bei Last 100 EUR -6.250 EUR. App-Logik (ohne Hausgeld) = 250 x Monatsmiete: 75.000 / 82.500 / 90.000 / 95.000 / 105.000 EUR. Interessant wird es erst ab Ist-Miete >= 420 EUR UND Eigentuemerlast <= 55 EUR (Ziel dann ~91.000 EUR) oder wenn Klein selbst einen Preis mit 8 oder 9 vorne nennt.'
      || E'\n' || 'VERMOEGENSAUFBAU am Zielpreis 76.000 EUR: Cash-Einsatz 21.660 EUR (15.200 EK + 6.460 KNK = 28,5 %, provisionsfrei), Darlehen 60.800 EUR, Rate 304 EUR (Zins 203 / Tilgung 101). Restschuld nach 5 J. 54.081 EUR (Tilgung 6.719, Zinsen 11.521), nach 10 J. 45.879 EUR (Tilgung 14.921, Zinsen 21.559). Vermoegenszuwachs nach 10 J.: +11.830 EUR bei 0 % Wertentwicklung (~4,5 % p. a. EK-Rendite), +24.030 EUR bei 1,5 %/J. (~7,8 % p. a.). ACHTUNG: der eingerechnete kumulierte CF von +3.400 EUR enthaelt KEINEN Leerstand - bei 20 m2 Studentenapartment ist ein Leermonat alle 2 Jahre realistisch (-1.900 EUR plus Renovierung), real also CF ~0. Die Rendite kommt komplett aus Tilgung und Wertsteigerung. Zum Vergleich beim Inseratspreis: -21.350 EUR Nachschuss ueber 10 J., bei 0 % Wertentwicklung -7.160 EUR VERMOEGENSVERLUST, bei 1,5 %/J. nur ~3,2 % p. a.'
      || E'\n' || 'RISIKEN/DEALBREAKER: (1) Ist-Miete voellig unbekannt - das Inserat nennt keine; die 380 EUR sind eine (optimistische) Mietspiegel-Schaetzung, keine Tatsache. (2) Hausgeld-Split unbekannt, im Inserat fehlt das Hausgeld komplett. Anker Nr. 22 (24,09 m2, gleiche Strasse): 207 EUR, davon ~65 EUR n. uml. - linear auf 20 m2 = 172 / 54 EUR, realistisch aber hoeher, weil die Verwaltervergueting (30-40 EUR/M) PRO EINHEIT anfaellt und die Kleinstflaeche voll trifft. (3) 6.375 EUR/m2 = teuerster EUR/m2-Wert im gesamten Analyse-Log, 8-19 % ueber der eigenen Strasse (Nr. 22: 5.355 EUR/m2, leerstehend und Bj. 1990; 19,47-m2-Objekt Bj. 1983 mit Stellplatz: 5.906 EUR/m2). (4) Vermietet = kein sofortiger Mietanpassungshebel; bei Index- oder Staffelmiete ist der Par.-558-Weg dauerhaft tot. (5) Energieausweis fehlt im Inserat (Pflichtvorlage Par. 80 GEG); Nr. 11 (Bj. 1983) Klasse D mit Kessel evtl. Bj. 1983, Nr. 22 (Bj. 1990) nur Klasse F -> fuer Nr. 20 E/F erwarten. (6) Ist-Ruecklage unbekannt: in derselben Strasse liegen die Werte zwischen 11.160 EUR (Nr. 11, viel zu duenn) und 147.530 EUR (Nr. 22). (7) TG-Stellplatz: bei Nr. 11 war der beworbene Stellplatz laut ETV-Protokoll Gemeinschaftsflaeche OHNE grundbuchliche Zuweisung - bis zum Grundbuchbeleg mit 0 EUR ansetzen. (8) 20 m2 liegen bei vielen Banken unter der Finanzierungsgrenze bzw. mit Bewertungsabschlag - ohne Bankzusage ist jeder Zielpreis akademisch. (9) Provisionsfrei senkt nur die KNK auf 8,5 % (Cash-Einsatz 28,5 % statt 32,07 %) - es senkt NICHT den tragfaehigen Kaufpreis und bedeutet zugleich: kein Provisionspolster, das der Verkaeufer abschmelzen kann.'
      || E'\n' || 'PLUSPUNKTE (aendern das Urteil nicht): TG-Stellplatz im Kaufpreis, provisionsfrei, Bad + Boeden lt. Inserat vor ~4 Jahren erneuert, Endenich ist eine solide Studenten-Vermietungslage (Uni-Institute, Nahversorgung fussl.), Mikro-Apartments erzielen ueberdurchschnittliche EUR/m2-Mieten.'
      || E'\n' || 'HEBEL: online seit 04/2026 (~4,5 Monate Standzeit), eine Senkung ist schon durch (139.000 -> 127.500 EUR, -8,3 %), VB, Privatverkauf mit direktem Draht. Gegenspieler: Eltern, die fuer Studentenkinder kaufen und keine Rendite rechnen (waren bei Nr. 11 die Konkurrenz).'
      || E'\n' || 'BESICHTIGUNG Sa 22.08.2026 mit Herrn Klein - laeuft als DATENBESCHAFFUNG, nicht als Kaufanbahnung. Kein Gebot vor Ort, keine Zahl nennen. Ziele: Ist-Miete + Vertragstyp + Erhoehungshistorie + Zahlungseingaenge, Hausgeld-Split aus dem Wirtschaftsplan, Ist-Ruecklage, gehoeren Nr. 20 und Nr. 22 zur selben WEG?, Stellplatz-Grundbuch, Wohnflaeche nachmessen, FI-Schutz, Waermeerzeuger-Typenschild, Rechnungen zur Bad-/Bodensanierung. Fragenliste + volle Rechnung: docs/besichtigung-2026-08-22-von-weichs-20-endenich.md. Nachfass-Mail an Herrn Klein nach dem Termin entworfen (Unterlagenliste). Wiedervorlage: bei zweiter Senkung Richtung 90 T EUR neu rechnen, nicht nachjagen.'
  ),
  updated_at = now()
where data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/studentenwohnung-1-zi-apartment-eigentumswohnug-bonn-end-/3424883857-196-23694';
