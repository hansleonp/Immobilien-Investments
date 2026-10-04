-- Update: Kessenich August-Bier-Str. 4, WE 13 (Immowelt cdb436a2) — Neubewertung 02.10.2026.
-- Anlass: Mail Rechin (RW GmbH i. A. Vonovia) vom 26.09.2026: Festpreis 109.000 EUR, nicht verhandelbar,
-- Kauf OHNE Besichtigung (Mieter verweigert Zugang), KNK-Erstattung durch Vonovia "im Nachgang".
-- Match ueber data->>'link'; updated_at im JSON und in der Spalte fuer den Local-first-Sync.
-- ACHTUNG: Nummer vor dem Einspielen gegen Remote pruefen (supabase migration list --linked);
-- db push ist seit 22.09. blockiert -> supabase db query --linked -f <datei> + Historie-Insert.

update public.search_properties
set
  data = data || jsonb_build_object(
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'preis', 109000,
    'miete', 374.65,
    'wunschmiete', 374.65,
    'nichtUmlagefaehig', 82,
    'wunschpreis', 109000,
    'cashflow', -151,
    'wiedervorlage', '2026-10-05',
    'notizen',
      'Analyse 02.10.2026: **BEDINGTE ZUSAGE zu 109.000 EUR Festpreis - ohne erfuellte Bedingungen FINGER WEG.** Angebot Rechin 26.09.: 109.000 EUR nicht verhandelbar (Inserat 123.000), Kauf OHNE Besichtigung (Mieter verweigert Zugang, Vorgang lag bei Vonovia-Rechtsabteilung), Mietzahlungen lt. Maklerin "regelmaessig" (unbelegt), KNK-Erstattung durch Vonovia "im Nachgang" (= Exposé-Aktion: GrESt + Notar KV + Grundbuch-Umschreibung, nur bei Beurkundung bis 31.12.2026, nach Massgabe des notariellen KV; NICHT: Grundschuld/Finanzierung/Beratung; Provision faellt ohnehin nicht an).'
      || E'\n' || 'Zahlen bei 109k (4,11 %/2 %, Last 82 EUR/M, Ist-Miete 374,65): Rate 444 EUR/M, Liquiditaet J1 -151 EUR/M (Schranke ok), App-CF -69, Faktor 24,2, brutto 4,1 %. EK-Rendite 10 J (1,5 % Wert / 0 % Wert): A ohne Erstattung (KNK 9 %) 2,9 / -1,3 %; B mit Erstattung (KNK 0,5 %) 5,8 / 1,4 %; A + 6k Blindkauf-Reserve 1,4 / -2,6 %; B + Reserve 3,8 / -0,4 %. Upside Par.-558 auf 430,85 ab J2: B 7,5 %, B+Reserve 5,4 %. 6-%-Preis: A 80.200, B 106.800, B+Reserve 83.400, B+Reserve+Hebel 101.500. 15 J (4,42 %): B 5,1 %, Liq -174.'
      || E'\n' || 'Urteil: Auf belegten Zahlen (ohne Erstattung) klar unter Kriterium. Auch mit Erstattung knapp darunter, mit realistischer Reserve deutlich darunter - 6 % nur mit Mieterhoehung, und genau dieser Mieter blockiert. 109k liegt unter dem dokumentierten Kompromiss-Limit 120k (mit Aktion), daher vertretbar NUR wenn: (1) Erstattung als Klausel im KV-Entwurf (Umfang, Faelligkeit, ggf. Verrechnung), (2) Mietvertrag ohne Index/Staffel + Mietkonto 12 M ohne Rueckstaende/Minderung, (3) schriftliche Auskunft zum Rechtsabteilungs-Vorgang (kein laufendes Verfahren, keine Maengelanzeigen), (4) Uebergabeprotokoll 2019/Fotos + Bj. Therme WE 13, (5) Sparkasse bewertet ohne Innenbesichtigung, (6) Beurkundung sicher vor 31.12. Fehlt eins davon: absagen. Kein Gebot ueber 109k, keine Zusage vor Unterlagen.'
      || E'\n' || '02.10.: Mail an Rechin VERSENDET (Interesse bekundet, Bitte um Telefonat zu KNK-Erstattung, Mietverhaeltnis, Ablauf bis Beurkundung; Unterlagenliste fuers Telefonat vorbereitet, danach schriftlich bestaetigen lassen). Autoreply: Umzugsurlaub, keine Mails bis 12.10.2026. ERINNERUNG: Mo 05.10.2026 Rechin ANRUFEN (0160 95100949) - Themen: KNK-Erstattung als KV-Klausel, Mietvertrag/Mietkonto, Rechtsabteilungs-Vorgang, Fotos/Therme-Bj., Beurkundung vor 31.12. Nicht erreicht -> erneut ab 12.10. Kontakt: Danielle Rechin, RW GmbH, 0160 95100949 / vertrieb@rw-immo.org.'
      || E'\n\n' || coalesce(data->>'notizen', '')
  ),
  updated_at = now()
where data->>'link' = 'https://www.immowelt.de/expose/cdb436a2-a416-4812-9672-e5087a70cf70';
