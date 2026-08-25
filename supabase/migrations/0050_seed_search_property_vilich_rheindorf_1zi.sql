-- Daten-Seed: Immowelt-Inserat 675b142e (Bonn Vilich-Rheindorf/Beuel, 1-Zi-DG-Whg ca. 41 m2, Bj. 1979,
-- 3. OG, Balkon, Keller, Stellplatz, vermietet 450 EUR + 30 EUR Stellplatz, 169.000 EUR, provisionsfrei)
-- Erstbewertung 17.08.2026. Idempotent: Insert nur, falls weder id noch Link bereits existieren.

insert into public.search_properties (id, user_id, data, updated_at)
select
  'f10fab82-c322-49b8-aafe-770c9a92c5ee',
  coalesce(
    (select user_id from public.search_properties order by updated_at desc limit 1),
    (select id from auth.users order by created_at limit 1)
  ),
  '{"id": "f10fab82-c322-49b8-aafe-770c9a92c5ee", "created_at": "2026-08-17T09:00:00.000Z", "updated_at": "2026-08-17T09:00:00.000Z", "fav": false, "neu": true, "status": ["Neu"], "quelle": "Immowelt", "link": "https://www.immowelt.de/expose/675b142e-8051-41b6-b193-098da2859629", "titel": "Provisionsfreie Kapitalanlage - Vermietete 1-Zimmerwohnung in Bonn-Beuel inkl. Stellplatz", "ort": "Bonn Vilich-Rheindorf (Beuel)", "adresse": "", "lat": null, "lng": null, "zimmer": 1, "wohnflaeche": 41, "baujahr": 1979, "preis": 169000, "miete": 480, "roiSoll": null, "marktwert": null, "cashflow": -196, "wunschpreis": 99000, "wunschmiete": 480, "datum": "2026-07-23", "notizen": "Erstbewertung 17.08.2026: FINGER WEG. 1-Zi-Dachgeschosswohnung 41 m2 + Stellplatz, Bonn Vilich-Rheindorf (Beuel, 53225), 3. OG, Bj. 1979, gepflegt, Balkon, Keller, Gas-Zentralheizung, Energieklasse D. 169.000 EUR = 4.122 EUR/m2 (Stadtteilschnitt ~4.680 EUR/m2 - optisch guenstig, aber der Stellplatz steckt im Preis). Vermietet: 450 EUR Grundmiete + 30 EUR Stellplatz = 480 EUR kalt gesamt (10,98 EUR/m2 fuer die Wohnung; Stadtteil-Mietspiegel ~12,1-12,3 EUR/m2 Schnitt, Kleinwohnungen eher darueber -> Potenzial nur ca. +50-70 EUR, Kappungsgrenze Bonn 15 %/3 J.). Faktor 29,3, Brutto 3,41 %, App-CF -196 EUR/M; konservativ -280 EUR/M (n. uml. Betriebskosten inkl. Ruecklage lt. Inserat 83,58 EUR). CF 0 erst bei 120.000 EUR, konservativ bei 99.000 EUR -> 29-41 % Nachlass noetig; Inserat erst seit 23.07.2026 online (~25 Tage), provisionsfrei, keine Preisreduktion erkennbar -> unrealistisch. Risiken: Widerspruch Tiefgaragen-Stellplatz (Beschreibungstext) vs. Aussen-Stellplatz (Merkmalsliste) - eigenes Teileigentum, eigener Mietvertrag, im Kaufpreis enthalten? Mietvertragstyp unbekannt (Index-/Staffel-Check zwingend, sonst faellt der Mieterhoehungshebel weg); Bj. 1979 mit Gas-Zentralheizung -> GEG-Tausch und energetische Sanierung stehen aus, Rueckstellung der WEG unbekannt; Lagetext des Maklers beschreibt Beuel-Mitte-Infrastruktur (REWE Center, Aerztehaus Beuel, St. Josef-Hospital), die real 2-3 km entfernt liegt - Vilich-Rheindorf ist doerflich, Stadtbahn 62/66 nicht fusslaeufig, nur Bus. Pluspunkte (provisionsfrei -> KNK nur ~8,5 %, n. uml. Anteil konkret beziffert, Stellplatz und Balkon, laufende Vermietung) aendern an der Rechnung nichts. Anbieter: deinimmo GmbH / deinimmoberater, Hr. Daniel Gebhardt, Bornheimer Str. 127, 53119 Bonn, Tel. 0228 24956300, info@deinimmoberater.de, interne Objektnummer 55513. Mail-Entwurf 17.08.2026 erstellt (nicht versendet).", "ansprechpartner": "Daniel Gebhardt (deinimmo GmbH / deinimmoberater)", "telefon": "0228 24956300", "email": "info@deinimmoberater.de", "wiedervorlage": "", "history": [], "docs": []}'::jsonb,
  now()
where not exists (
  select 1 from public.search_properties
  where id = 'f10fab82-c322-49b8-aafe-770c9a92c5ee'
     or data->>'link' = 'https://www.immowelt.de/expose/675b142e-8051-41b6-b193-098da2859629'
);
