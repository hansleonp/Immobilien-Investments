-- Update: Koenigswinter-Oberdollendorf, Immowelt c292f010 (DOERING-IMMOBILIEN, Ref. DOA39) — erneute Pruefung 13.08.2026.
-- Inserat unveraendert: 129.000 EUR, 2 Zi, 37,3 m2, vermietet 356 EUR + 35 EUR TG. Keine Preisbewegung seit
-- Erstbewertung 30.07.2026 (Standzeit >= 14 Tage). Urteil "Finger weg zum Inseratspreis" bestaetigt, Zielpreis ~102.000 EUR.
-- Match ueber data->>'link'; updated_at im JSON und in der Spalte, damit der Local-first-Sync die Aenderung uebernimmt.

update public.search_properties
set
  data = data || jsonb_build_object(
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      (data->>'notizen')
      || E'\n\n' || 'Erneut geprueft 13.08.2026: Inserat unveraendert bei 129.000 EUR — seit Erstbewertung (30.07.) keine Preisbewegung, Standzeit mind. 2 Wochen (exaktes Einstelldatum zeigt Immowelt nicht). Zahlenwerk bestaetigt: Faktor 27,5 auf Ist-Miete 391 EUR (356 + 35 TG), CF −104 EUR (App-Logik), konservativ inkl. n. uml. 73 EUR + Instandhaltung ~30 EUR: −207 EUR. Preistreppe: CF-0 bei ~101.900 EUR, CF+100 bei ~75.900 EUR, 6 % brutto bei 78.200 EUR; konservativ traegt es erst bei ~75.000-83.000 EUR. Miete 9,54 EUR/m2 ~18 % unter Markt (Koenigswinter-Schnitt ~11,7 EUR/m2), aber nur schrittweise via Kappungsgrenze hebbar; Gasheizung Bj. 1992 = Tauschrisiko. Urteil Finger weg bestaetigt — noetiger Nachlass 21-35 % unrealistisch, aber wachsende Standzeit ohne Preissenkung ist ein Hebel: Wiedervorlage bei Preisrutsch Richtung 105.000 EUR. Keine neue Mail noetig (provisionsfrei, Fr. Bennerscheid, DOERING-IMMOBILIEN).'
  ),
  updated_at = now()
where data->>'link' = 'https://www.immowelt.de/expose/c292f010-d80f-4478-b0b0-84e6e7d4d845';
