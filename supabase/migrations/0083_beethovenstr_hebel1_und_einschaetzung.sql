-- 28.08.2026: (1) Beethovenstr. 50 — Hebel-1-Rechnung (Indexzug + Garagenanpassung) und kaufmaennische
-- Gesamteinschaetzung zum laufenden 155er-Gebot dokumentiert. (2) August-Bier-Str. 4 — Wiedervorlage zum
-- Nachfassen gesetzt (Gebot 100 T liegt seit 11.08. unbeantwortet, Aktion bis 31.12.2026; bester Deal der Pipeline).

update public.search_properties
set
  data = data || jsonb_build_object(
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      (data->>'notizen')
      || E'\n\n' || 'HEBEL-1-RECHNUNG 28.08.2026 (Index Wohnung 620 -> ~655 sofort nach Umschreibung, Textform-Erklaerung, keine Mieterzustimmung noetig; Garage per Aenderungskuendigung 80 -> ~100; Mietpfad danach +2 %/J): Bei 145.000 voll gehebelt: Liquiditaet -70/M (Last normalisiert), EK-Rendite 5,1 % (1,5 % Wert) bzw. 6,1 % (2 % Wert) - KRITERIUM ERREICHT unter zwei Bedingungen (Instandhaltung normalisiert sich, 2 % Wert). 6-%-Zielpreis voll gehebelt: ~134 T (1,5 % Wert) bis ~147 T (2 %). Bei 155.000 voll gehebelt: nur 4,3-5,4 %, Liquiditaet -110/M - 6 % auch mit Hebel NICHT erreichbar; traegt nur ueber Auszug (~7,5 %) oder Wertaufholung (~9 %).'
      || E'\n' || 'GESAMTEINSCHAETZUNG zum laufenden 155er-Gebot: Als Investment nach 6-%-Kriterium NICHT gut (4,3-5,4 % voll gehebelt), als Einkauf unter Substanzwert okay (2.646 EUR/m2 bei Lage-Schnitt ~4.580; fairer Wert trotz Zustand/EG/Index-Mieter eher 180-200 T = Sicherheitsnetz nach unten). Drei Ausgaenge: (1) Frist 10.09. laeuft ab = BESTES Szenario -> neue Runde bei 145 (dort funktioniert das Objekt) oder weiterziehen; (2) Annahme zu 155 = dokumentierte A-Lage-Wette unter Substanzwert, wird gehalten, Index-Hebel sofort ziehen; (3) Gegenangebot ueber 155 = Absage, Limit ist Limit. Pipeline-Rang: Nr. 2 hinter August-Bier-Str. 4 (dort 8,9-10 % EK-Rendite mit halbem Kapitaleinsatz dank KNK-Erstattungs-Aktion und intaktem 558-Hebel) - Energie gehoert auf August-Bier-Nachfassen.'
  ),
  updated_at = now()
where data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/vermietete-2-zimmer-eigentumswohnung-mit-garage-im-musikerviertel-der-bonner-weststadt/3470543584-196-23685';

update public.search_properties
set
  data = data || jsonb_build_object(
    'wiedervorlage', '2026-08-31',
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'history',
      coalesce(data->'history', '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object(
          'id', 'b4e82f17-9c50-4d3a-8761-e5a90c2d4f38',
          'ts', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
          'text', 'Wiedervorlage gesetzt: Bei Fr. Rechin nachfassen - Gebot 100.000 EUR liegt seit 11.08. unbeantwortet. Pipeline-Vergleich 28.08.: nach EK-Rendite-Kriterium aktuell BESTER Deal (8,9-10 % dank KNK-Erstattungs-Aktion, halber Kapitaleinsatz vs. Beethovenstr.); Aktion nur bis 31.12.2026, Stand 10.08. bereits 11/26 Einheiten verkauft.'
        )
      ),
    'notizen',
      (data->>'notizen')
      || E'\n\n' || 'PIPELINE-VERGLEICH 28.08.2026: Nach dem EK-Rendite-Kriterium aktuell der BESTE Deal im Log - bei 100.000 mit Aktion (KNK erstattet, provisionsfrei): EK-Einsatz nur ~20.000, EK-Rendite 8,9 % (1,5 % Wert) / 10,0 % (2 %) / 5,0 % sogar im 0-%-Stressfall; 558-Hebel intakt (374,65 -> ~430 via Kappung), WEG sauber, Hausgeld sinkt 2027. Schlaegt Beethovenstr. (dort 4,7-5,8 % bei 145 T) in jedem Szenario. NACHFASSEN bei Fr. Rechin: Gebot 100 T liegt seit 11.08. unbeantwortet, Aktion endet 31.12.2026, Abverkauf laeuft (11/26 per 10.08.).'
  ),
  updated_at = now()
where data->>'link' = 'https://www.immowelt.de/expose/cdb436a2-a416-4812-9672-e5087a70cf70';
