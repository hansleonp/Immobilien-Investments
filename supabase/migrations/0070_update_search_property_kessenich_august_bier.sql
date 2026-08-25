-- Update: Kessenich August-Bier-Str. 4 (Immowelt cdb436a2) — Maklerantwort 24.08.2026 (Fr. Rechin, RW GmbH).
-- Gebot 100.000 EUR bei Verkaeuferin angesprochen, aber zurueckgewiesen als "ohne Besichtigung wenig fundiert" und
-- Differenz zu gross; Aktion (8,5 % NK-Erstattung) wird als Ersatz fuer Preisnachlass gerahmt. Blockade-Grund:
-- angekuendigter Finanzierungsnachweis wurde nie gesendet - Maklerin wartete. Naechster Schritt: Nachweis + Besichtigung.
-- Match ueber data->>'link'; updated_at im JSON und in der Spalte fuer den Local-first-Sync.

update public.search_properties
set
  data = data || jsonb_build_object(
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      (data->>'notizen')
      || E'\n\n' || 'Maklerantwort 24.08.2026 (auf Erinnerung): Gebot 100.000 EUR wurde bei der Verkaeuferin angesprochen, aber: Gebote ohne Besichtigung "wenig fundiert", Differenz zum Angebotspreis zu gross, Nachfrage bestehe weiterhin; die Aktion (NK-Erstattung ~8,5 %) mache eine signifikante Kaufpreisreduzierung nicht moeglich. KEIN endgueltiges Nein - Tuer fuer fundiertes Gebot nach Besichtigung bleibt offen.'
      || E'\n' || 'Grund fuer 2 Wochen Funkstille: der am 11.08. angekuendigte Finanzierungsnachweis wurde nie gesendet, Maklerin wartete darauf. Naechster Schritt: Finanzierungsnachweis senden + Besichtigungstermin (werktags spaeter Nachmittag), vorab Mietvertrag + Vermoegensbericht anfordern. Gebot 100.000 EUR NICHT vor der Besichtigung erhoehen, Schmerzgrenze 105.000 EUR unveraendert. Realistische Einordnung: Vonovia-Gegenzone vermutlich 115-120k nominal = ueber Schmerzgrenze; Besichtigung liefert Argumente (Therme-Alter, Bad, Zustand), danach finale Zahl max. 105k oder Ausstieg.'
  ),
  updated_at = now()
where data->>'link' = 'https://www.immowelt.de/expose/cdb436a2-a416-4812-9672-e5087a70cf70';
