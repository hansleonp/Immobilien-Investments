-- Update: Bonn-Endenich, Von-Weichs-Str. 22 (Kleinanzeigen 3415113981, Limbach-ID 23774) — Nachbewertung 07.08.2026.
-- Quelle: interaktives Expose (CloudFront, exposeId 0452f57f-c3f1-4cbb-8666-d9dabb9c5222).
-- Neu: Adresse Von-Weichs-Str. 22, n. uml. Hausgeld ~65 EUR/Mon (Wirtschaftsplan 2026), MEA 240/10000,
-- Ansprechpartnerin Nina Adolph. Urteil bestaetigt (Finger weg), konservative Rechnung verschlechtert (CF ~-189).
-- Match ueber data->>'link'; updated_at im JSON und in der Spalte, damit der Local-first-Sync die Aenderung uebernimmt.

update public.search_properties
set
  data = data || jsonb_build_object(
    'datum', '2026-08-07',
    'adresse', 'Von-Weichs-Str. 22',
    'ansprechpartner', 'Nina Adolph (R. Dieter Limbach Immobilien KG)',
    'telefon', '+49 228 98160-67',
    'email', 'n.adolph@limbach-online.com',
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      'Analyse 07.08.2026 (Nachbewertung, interaktives Expose Limbach): Finger weg - Urteil bestaetigt und konservativ sogar verschaerft. Preis unveraendert 129.000 EUR (5.355 EUR/m2). Zielpreis CF 0 (App-Logik) ~101.700 EUR; konservativ jetzt mit ECHTEM n. uml. Hausgeld 65 EUR/Mon (Wirtschaftsplan 2026, statt 50-EUR-Schaetzung) + Ruecklage ~19 EUR nur noch ~79.700 EUR (vorher ~83.700). Bei 129.000 EUR: CF -105 (App-Logik), konservativ ~-189 EUR/Mon; Faktor 27,6; Brutto 3,6 %. Noetiger Nachlass 21-38 % - unrealistisch.'
      || E'\n' || 'Neu aus dem Expose: Adresse Von-Weichs-Str. 22, 53121 Bonn; Hausgeld 207 EUR bestaetigt, davon ~65 EUR nicht umlagefaehig (Wirtschaftsplan 2026) = fuer 24 m2 sehr hoch (8,6 EUR/m2 gesamt); MEA 240/10000 (bei ~147.530 EUR WEG-Ruecklage per 31.12.2024 rechnerisch ~3.540 EUR Anteil); Wohnflaechenberechnung 1000hands 08.05.2026 bestaetigt 24,09 m2; TG-Stellplatz zur Wohnung gehoerig, vermietet 40 EUR, kurzfristig kuendbar; Verbrauchsausweis Klasse F (162,2 kWh) vom 31.08.2018, gueltig bis 31.08.2028.'
      || E'\n' || 'Dealbreaker unveraendert: Klasse F mit Gaszentralheizung UND Fenstern von 1990 (Tausch-/Sonderumlagenrisiko), keine Kueche (nur Pantry-Platz in der Diele), Preis ~15 % ueber Endenich-Schnitt (~4.658 EUR/m2), hohes Hausgeld. Pluspunkte (leer = sofort Marktmiete, TG inkl., dicke WEG-Ruecklage, Studenten-Mikrolage Uni-Institute/Aldi/Netto/Denns) retten die Rechnung nicht.'
      || E'\n' || 'Mietansatz unveraendert: Vergleichsmiete ~350 EUR kalt (konservativ ~14,50 EUR/m2, Abschlag fuer fehlende Kueche + Klasse F) + 40 EUR TG = 390 EUR.'
      || E'\n' || 'Weiter offen: Anzahl WEG-Einheiten, Protokolle der letzten ETVs, geplante Sanierungen (Heizung/Fenster 1990!), Wirtschaftsplan 2026 im Detail, Grund des Verkaufs.'
      || E'\n' || 'Ansprechpartnerin: Frau Nina Adolph, R. Dieter Limbach Immobilien KG, +49 228 98160-67 / +49 160 96817802, n.adolph@limbach-online.com. Kein Kontakt aufgenommen - bei diesem Preisniveau kein Handlungsbedarf.'
  ),
  updated_at = now()
where data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/bezugsbereites-1-zimmer-apartment-in-beliebter-lage-von-bonn-endenich-inkl-tg-stellplatz-/3415113981-196-23694';
