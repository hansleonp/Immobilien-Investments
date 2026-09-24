-- Aufraeumen 24.09.2026: Objekte mit dokumentiertem Urteil "Finger weg" bzw. Dubletten -> Status Verworfen.
-- Daten bleiben erhalten (Dubletten-Schutz fuer kuenftige Abgleiche). Aktive Pipeline und "Beobachten"-Objekte bleiben unberuehrt.
-- Eingespielt 24.09.2026 nach ausdruecklicher Freigabe durch den Nutzer.
with fw(id, grund) as (values
  ('6dd5167a-4e60-497e-98b7-ebccd0c09123','Finger weg'),  -- Castell, 2-Raum-Buero An der Esche 6
  ('359cb0ef-4f78-4d2e-840c-3fc122a6ad37','Finger weg'),  -- Beuel-Mitte 2-Zi 53 m2
  ('24374657-d515-4557-8d87-ef0957578cb3','Finger weg'),  -- Poppelsdorf 1-Zi 169k
  ('2b2bdc8d-5a6d-40a6-8f39-ab36220640b5','Finger weg'),  -- Vilich-Rheindorf 4-Zi 215k
  ('9606de5b-5f54-422c-a296-4172bd97d20e','Finger weg'),  -- Oberdollendorf 37 m2
  ('f2b9b3ea-de35-42bc-b7d2-42f543ec4105','Finger weg'),  -- Von-Weichs-Str. 22
  ('5b70b69f-cf88-40b4-a824-c868615c5061','Finger weg'),  -- Karthaeuserstr. 13
  ('e86869e3-88f0-48f5-84dd-a6f1498cba83','Finger weg'),  -- Graurheindorf DG
  ('09caff6b-37d5-4a86-a73b-8ea08385c21b','Finger weg'),  -- Beuel-Mitte Appartement 175k
  ('0cb629c2-6689-4847-b002-68ad049f9181','Finger weg'),  -- Ramersdorf 1-Zi
  ('790bda76-413c-423d-ac73-ea961ba0ecb2','Finger weg'),  -- Gronau/Hochkreuz 254k
  ('b3ca1166-0875-4ba3-a21e-45ac89fea5c7','Finger weg'),  -- Endenich DG 65 m2
  ('9472a403-40ab-44e0-8d9e-15b36d3280d5','Finger weg'),  -- Bad Honnef 3-Zi 79 m2 (Baumann)
  ('25ec3a32-d578-42f3-aa5d-c8977230012e','Finger weg'),  -- Hausdorffstr. 166
  ('eb7dabdf-121e-4167-b740-3c4a3e1c88b7','Finger weg'),  -- Bad Honnef 3-Zi DG Klasse H
  ('f6182552-1569-4b89-bf50-63f42d8d484f','Finger weg'),  -- Oberkassel 2-Zi freiwerdend 165k
  ('f9e40bd4-7ea9-4269-8545-bae73dd1dcfc','Finger weg'),  -- Castell 3-Parteienhaus
  ('78b09197-569c-438c-a593-9a96e2735877','Finger weg'),  -- Bad Honnef Kurviertel
  ('d8b79cb6-36bb-45cb-8316-768dd485d212','Finger weg'),  -- Limperich 1-Zi 30 m2
  ('6dc6f682-a794-4082-afa3-b478d79a5b04','Finger weg'),  -- Dottendorf 33 m2
  ('82390097-a6a4-437b-8b55-05ac72ea30ed','Finger weg'),  -- Limperich 2-Zi 48 m2
  ('f10fab82-c322-49b8-aafe-770c9a92c5ee','Finger weg'),  -- Vilich-Rheindorf 1-Zi 166k
  ('b3db15e0-28ed-4495-b19b-f4c04d10a275','Finger weg'),  -- Von-Weichs-Str. 20
  ('c0a0a943-ddaa-43d1-ba42-535cb355d9e6','Finger weg'),  -- Bad Honnef Hauptstr. 11 (Betreutes Wohnen)
  ('a80fa3a8-d9c4-4cf2-9ce0-812d068e4296','Finger weg'),  -- Niederdollendorf 2-Zi 72 m2
  ('3798b6ee-6789-47a9-9427-6a83462c98c4','Finger weg'),  -- Beuel 1-Zi 28 m2
  ('db41d975-1361-4819-8fcb-873f50f01b31','Finger weg'),  -- Rhoendorf 64 m2 (reserviert)
  ('a3298541-d4e3-4c92-9ac4-e8e35be5714d','Finger weg'),  -- Bad Honnef Mitte 2-Zi 66 m2
  ('c8a25aed-c1b2-45f8-bbd5-6b92eda19275','Finger weg'),  -- Castell Souterrain
  ('384219b1-b6a7-47a9-b3cb-a6152df12b7e','Finger weg'),  -- Kesselgasse 2
  ('6f933a19-9d16-4cd7-beac-5e38ab75b815','Finger weg'),  -- Trierer Str. 55
  ('cb6c673b-acd9-4c5a-81cb-3a8d2fc8cddd','Finger weg'),  -- Oberkassel WE 8
  ('59325565-3c7b-4846-899b-de2bcf6fff22','Finger weg'),  -- Kessenich "Schmuckstueck" 199k
  ('9d1df447-cbaa-406e-8218-60f7ced3d40a','Finger weg'),  -- Kessenich Maisonette 28 m2
  ('d33a8bbb-bd90-4e9c-a2d3-f53fdbf74675','Finger weg'),  -- Friesdorf 3-Zi EG
  ('b194e133-ae1c-4766-9ea2-4b0091b1442b','Finger weg (Nachbewertung 07.08.)'),  -- Von-Weichs-Str. 11
  ('c109c102-146c-443d-85f5-d59526a00509','Dublette von Beethovenstr. 50 (Kleinanzeigen-Eintrag fuehrend)'),
  ('e1382f7f-275e-43c4-a086-0f97b2e059b5','Dublette von Mechenstr. 55 (Immowelt-Eintrag fuehrend)'),
  ('e16e2499-15c3-4f92-9d44-054d7d3754ff','Dublette von Ramersdorf 1-Zi (Kleinanzeigen-Langlink)')
)
update public.search_properties sp
set data = sp.data || jsonb_build_object(
      'status', jsonb_build_array('Verworfen'),
      'notizen', 'AUFGERAEUMT 24.09.2026: Status -> Verworfen (' || fw.grund || '). Eintrag bleibt als Dubletten-Schutz.' || E'\n' || coalesce(sp.data->>'notizen',''),
      'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
    updated_at = now()
from fw
where sp.id::text = fw.id and not (sp.data->'status' ? 'Verworfen');
