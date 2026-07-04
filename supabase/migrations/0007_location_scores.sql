-- Lage-Analyse (à la GEOSCI, aber auf OpenStreetMap-Basis): gecachte Scores
-- { computedAt, lat, lon, precision, scores: { shopping: 0–5, … }, counts }.
-- Berechnung on demand über /api/lage (Nominatim + Overpass), einmal je Objekt.
alter table properties add column if not exists location_scores jsonb;
