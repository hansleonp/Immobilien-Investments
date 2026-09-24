-- Erstbewertung 24.09.2026 (Objekt lag unbewertet in der App, Status Verworfen):
-- IS24 168494877 (Becker Immobilien, Objekt-ID Becker-2368), Bonn-Kuedinghoven/Ramersdorf 53227,
-- 2 Zi., 63 m2 (Loggia zu 50 %), EG, Bj. 1973, 23 WE, 2 TG-Stellplaetze im Preis,
-- vermietet seit 07/2017 fuer 536,01 EUR netto kalt, Hausgeld 516 EUR (452 Whg + 2 x 32 TG).
-- Kaufpreis 178.000 EUR unveraendert (datePosted 12.06.2026, App-Import 28.07.2026 mit 178k,
-- lastModificationDate 08.09.2026 ohne Preisaenderung), 104 Tage online.
-- Urteil FINGER WEG: 6-%-Preis 94.000 EUR (Last 180) / 102.500 EUR (Last 150) = 47 % bzw. 42 % Nachlass.
-- Status bleibt ["Verworfen"]. Update per Link-Match.

update public.search_properties
set data = data
      || jsonb_build_object(
        'notizen', 'Analyse 24.09.2026: **FINGER WEG** - noetiger Nachlass 42-47 %, weit ueber der 30-%-Verfolgungsgrenze.
ZIELPREIS (6 % EK-Rendite) 94.000 EUR bei Eigentuemerlast 180 EUR/M (Faktor 14,7); mit 150 EUR Last 102.500 EUR (Faktor 15,9). Selbst bei Miete auf Mietspiegel-Niveau (~620 EUR) nur 117.000 EUR = -34 %.
BEI INSERATSPREIS 178.000 EUR (2.825 EUR/m2, Faktor 27,7, brutto 3,61 %): Rate 725 EUR/M, App-Cashflow -189 EUR/M, LIQUIDITAET -369 EUR/M (reisst die 250-EUR-Schranke deutlich; auch mit 150 EUR Last -339). EK-Rendite 10 J. 0,45 % (ohne Wertsteigerung -4,08 %). Grenzpreis Liquiditaetsschranke 148.800 EUR, CF +/-0 131.600 EUR. Ohne Kredit: (536 - 180) x 12 / (178.000 x 1,1207) = 2,14 % - unter der 3-%-Schwelle.
MIETE: 536,01 EUR netto (8,51 EUR/m2), vermietet seit 07/2017, letzte Erhoehung 08/2025. Krummer Betrag = Indexmiete-Indiz; ob die 2 TG-Plaetze in der Miete stecken, ist offen (dann Wohnungsmiete nur ~470 EUR). Amtl. Mietspiegel grob 9,2-9,8 EUR/m2 (Basis 63 m2 ~7,77, Lage +0,5..+1,2, EBK +0,52, x1,044) = 580-620 EUR -> etwas Potenzial, aber Kappung 15 % inkl. Erhoehung 08/2025 bzw. bei Index nur VPI.
RISIKEN: Hausgeld 452 EUR = 7,17 EUR/m2 fuer die Wohnung + 64 EUR TG (Split unbekannt, Last konservativ 180 EUR angesetzt); Gas-Zentralheizung von 1991 (35 J.) in Bonn mit beschlossenem Waermeplan = GEG-65-%-Tausch steht an -> Sonderumlage; Endenergie 208,1 kWh = Klasse G (Feld im Inserat leer); Bj. 1973 mit Aufzug UND Tiefgarage = teuerste Instandhaltungsklasse; EG-Lage. Niedriger EUR/m2 (vs. Kuedinghoven ~4.400 EUR/m2) ist der eingepreiste Gegenwert des hohen Hausgelds, kein Schnaeppchen.
LAGE: Liku-Ra (Limperich/Kuedinghoven/Ramersdorf), solide B-Lage rechtsrheinisch, Bonner Bogen/Telekom als Arbeitgeber, Bus 606/607; Laermquellen A59/A562/B42 am Ramersdorfer Knoten. IS24-Koordinate verweist auf Kessenich 53129 = unbrauchbar, Mikrolage nicht pruefbar.
INSERAT: online seit 12.06.2026 (104 Tage, Bonner Schnitt ~65), Preis seit Einstellung unveraendert, zuletzt bearbeitet 08.09.2026; "Preis vorschlagen" nicht aktiv. Provision 3,57 %.
ANBIETER: Becker Immobilien Bonn Rhein-Sieg GmbH, Herr Nico Kalf, Lennestr. 56, 53113 Bonn. Objekt-ID Becker-2368.
MAIL: Nachfrage-Entwurf (Preisbewegung + Unterlagen) erstellt, NICHT versendet - Versand nur sinnvoll, wenn eine Preisbewegung Richtung ~125.000 EUR denkbar ist.',
        'wunschpreis', 94000,
        'wunschmiete', 536,
        'miete', 536,
        'cashflow', -189,
        'nichtUmlagefaehig', 180,
        'ort', 'Bonn-Küdinghoven',
        'adresse', coalesce(data->>'adresse', ''),
        'ansprechpartner', 'Herr Nico Kalf (Becker Immobilien Bonn Rhein-Sieg GmbH)',
        'telefon', coalesce(data->>'telefon', ''),
        'email', coalesce(data->>'email', ''),
        'datum', '2026-06-12',
        'history', coalesce(data->'history', '[]'::jsonb),
        'docs', coalesce(data->'docs', '[]'::jsonb),
        'status', '["Verworfen"]'::jsonb,
        'updated_at', '2026-09-24T12:00:00.000Z'
      ),
    updated_at = now()
where data->>'link' = 'https://www.immobilienscout24.de/expose/168494877';
