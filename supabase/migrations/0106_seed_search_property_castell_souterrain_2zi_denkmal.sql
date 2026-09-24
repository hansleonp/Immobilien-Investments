-- Daten-Seed: IS24-Exposé 169802821 (Bonn-Castell, 53111, 2-Zi-SOUTERRAIN, 63,56 m2, Bj. 1882,
-- Denkmal-Fassade, renovierungsbeduerftig, einfache Ausstattung, Feuchte in 2 von 3 Einheiten laut Exposé,
-- 3 ETW im Paket oder einzeln). Kaufpreis 172.000 EUR, Provision 3,57 % (6.140,40 EUR).
-- BEZUGSFREI (obj_rented = "n") - Mietansatz = Mietpreisbremsen-Deckel (580 EUR).
-- Anbieter: KR Immobilien, Frau Kinga Zartmann. Veroeffentlicht 05.08.2026 (JSON-LD). Erstbewertung 24.09.2026.
-- Idempotent: Insert nur, falls weder id noch Link existieren.

insert into public.search_properties (id, user_id, data, updated_at)
select
  'c8a25aed-c1b2-45f8-bbd5-6b92eda19275',
  coalesce(
    (select user_id from public.search_properties order by updated_at desc limit 1),
    (select id from auth.users order by created_at limit 1)
  ),
  '{"id": "c8a25aed-c1b2-45f8-bbd5-6b92eda19275", "created_at": "2026-09-24T12:00:00.000Z", "updated_at": "2026-09-24T12:00:00.000Z", "fav": false, "neu": true, "status": ["Neu"], "quelle": "ImmoScout24", "link": "https://www.immobilienscout24.de/expose/169802821", "titel": "2-Zi-Souterrainwohnung 63,56 qm, Altbau 1882 (Denkmal-Fassade), renovierungsbeduerftig, leer, 3 ETW Paket/einzeln, Bonn-Castell", "ort": "Bonn-Castell (53111)", "adresse": "", "lat": null, "lng": null, "zimmer": 2, "wohnflaeche": 63.56, "baujahr": 1882, "preis": 172000, "miete": 580, "roiSoll": null, "marktwert": null, "cashflow": -121, "nichtUmlagefaehig": null, "wunschpreis": 92000, "wunschmiete": 580, "datum": "2026-08-05", "notizen": "Analyse 2026-09-24: **FINGER WEG** zum Angebotspreis 172.000 EUR. Zielpreis 92.000 EUR (6 %-EK-Rendite-Preis 112 T - ~20 T Capex), Decke 100.000 EUR nur bei Hausgeld <= 160 EUR nicht umlagef., geklaerter Feuchte und Capex <= 15 T. Faktor 24,7 (Mietansatz 580 EUR), Cashflow App-Logik -121 EUR/M, Liquiditaet inkl. 159 EUR Eigentuemerlast -280 EUR/M (reisst die 250-EUR-Schranke). EK-Rendite bei 172 T: 1,8 % p. a. (ohne Wertsteigerung -2,4 %).\nDealbreaker/Risiken: SOUTERRAIN in Altbau Bj. 1882, Fassade Denkmal; Exposé nennt Feuchtigkeit in 2 von 3 Einheiten (A29, B2), Fenster mittelfristig faellig, kein Massnahmenplan, Sonderumlagen ausdruecklich angekuendigt; Renovierungsbedarf, einfache Ausstattung; kein Hausgeld, keine Ruecklage im Inserat; bezugsfrei (obj_rented=n) -> Mietpreisbremsen-Deckel, voller Hausgeldanteil in Leerstands-/Renovierungsphase. IS24-Koordinate (50.7403/7.06) loest auf Dransdorf 53121 auf - Widerspruch zur PLZ 53111 Castell, Adresse klaeren (Dransdorf = Lage-Veto!).\nPlus: Castell zentral/Innenstadt-nah, 2.706 EUR/qm vs. Castell-Schnitt ~3.735 (Abschlag erklaert sich durch Souterrain+Feuchte); Paket moeglich; Denkmal-AfA (§ 7i) nur nach Steuern relevant.\nMietansatz: Bonner Mietspiegel 2026 Basis ~7,76 EUR/qm (64 qm), Lage +0,3-1,0, Souterrain-Abschlag geschaetzt, nach leichter Renovierung (Boden/Sanitaer) Deckel ~9,10 EUR/qm = 580 EUR (Spanne 560-620).\nVeroeffentlicht 05.08.2026 (50 Tage), lastModification 20.09.2026, Preis vorschlagen deaktiviert. Provision 3,57 % (6.140,40 EUR). Anbieter: KR Immobilien, Hensstr. 20, 53173 Bonn, Frau Kinga Zartmann. Mail entworfen, nicht versendet.", "ansprechpartner": "Frau Kinga Zartmann (KR Immobilien)", "telefon": "", "email": "", "wiedervorlage": "", "history": [], "docs": []}'::jsonb,
  now()
where not exists (select 1 from public.search_properties where id = 'c8a25aed-c1b2-45f8-bbd5-6b92eda19275')
  and not exists (select 1 from public.search_properties where data->>'link' = 'https://www.immobilienscout24.de/expose/169802821');
