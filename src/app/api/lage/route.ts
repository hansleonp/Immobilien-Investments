// POST /api/lage — Lage-Analyse für ein Objekt (à la GEOSCI, auf OSM-Basis).
// Geocodiert die Adresse (Nominatim), zählt POIs je Kategorie (Overpass),
// berechnet Scores 0–5 und cached das Ergebnis in properties.location_scores.
// Auth über die Nutzer-Session (RLS beschränkt auf eigene Objekte).

import { z } from "zod";

import { geocode, countPois } from "@/lib/lage/osm";
import { computeLageScores, type LocationScoresData } from "@/lib/lage/score";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({ propertyId: z.string().min(1) });

export async function POST(request: Request) {
  let propertyId: string;
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json({ error: "propertyId fehlt" }, { status: 400 });
    }
    propertyId = parsed.data.propertyId;
  } catch {
    return Response.json({ error: "Ungültiger Request-Body" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: property, error } = await supabase
    .from("properties")
    .select("id, street, zip, city")
    .eq("id", propertyId)
    .single();
  if (error || !property) {
    return Response.json({ error: "Objekt nicht gefunden" }, { status: 404 });
  }
  if (!property.city || property.city === "Unbekannt") {
    return Response.json(
      { error: "Für die Lage-Analyse wird mindestens ein Ort benötigt." },
      { status: 422 }
    );
  }

  const geo = await geocode({
    street: property.street,
    zip: property.zip,
    city: property.city,
  });
  if (!geo) {
    return Response.json(
      { error: "Adresse konnte nicht geocodiert werden." },
      { status: 502 }
    );
  }

  const counts = await countPois(geo.lat, geo.lon);
  if (!counts) {
    return Response.json(
      { error: "POI-Abfrage (Overpass) fehlgeschlagen — bitte später erneut versuchen." },
      { status: 502 }
    );
  }

  const result: LocationScoresData = {
    computedAt: new Date().toISOString(),
    lat: geo.lat,
    lon: geo.lon,
    precision: geo.precision,
    scores: computeLageScores(counts),
    counts,
  };

  const { error: updateError } = await supabase
    .from("properties")
    .update({ location_scores: result as unknown as Json })
    .eq("id", propertyId);
  if (updateError) {
    return Response.json({ error: "Speichern fehlgeschlagen" }, { status: 500 });
  }

  return Response.json({ ok: true, data: result });
}
