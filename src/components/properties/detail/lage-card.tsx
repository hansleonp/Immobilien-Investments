"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MapPin, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LAGE_CATEGORIES,
  LAGE_CATEGORY_META,
  overallLageScore,
  type LocationScoresData,
} from "@/lib/lage/score";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PropertyRow } from "@/types/database";

/** jsonb defensiv parsen */
function parseScores(raw: unknown): LocationScoresData | null {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return null;
  const data = raw as LocationScoresData;
  return data.scores && typeof data.scores === "object" ? data : null;
}

/** Ampelfarbe je Score (0–5) */
function ringColor(score: number): string {
  if (score >= 3.5) return "text-green-600";
  if (score >= 2) return "text-amber-500";
  return "text-red-500";
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const pct = Math.max(0, Math.min(1, score / 5));
  const r = 17;
  const circumference = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative size-12">
        <svg viewBox="0 0 40 40" className="size-12 -rotate-90">
          <circle cx="20" cy="20" r={r} fill="none" strokeWidth="4" className="stroke-neutral-200" />
          <circle
            cx="20"
            cy="20"
            r={r}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${circumference * pct} ${circumference}`}
            className={cn("stroke-current", ringColor(score))}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold tabular-nums">
          {score.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
        </span>
      </div>
      <span className="text-center text-[11px] leading-tight text-neutral-500">{label}</span>
    </div>
  );
}

const PRECISION_HINT: Record<LocationScoresData["precision"], string | null> = {
  adresse: null,
  strasse: "Standort auf Straßenebene geocodiert — Werte können leicht abweichen.",
  ort: "Nur der Ort ist bekannt (Ortsmitte) — Werte können deutlich abweichen.",
};

export function LageCard({ property }: { property: PropertyRow }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const data = parseScores(property.location_scores);

  async function analyze() {
    setLoading(true);
    try {
      const res = await fetch("/api/lage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: property.id }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "Lage-Analyse fehlgeschlagen");
        return;
      }
      toast.success("Lage analysiert");
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    } catch {
      toast.error("Lage-Analyse fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">
          Lage{" "}
          <span className="font-normal text-neutral-400">(OpenStreetMap)</span>
        </CardTitle>
        {data && (
          <Button size="sm" variant="ghost" onClick={analyze} disabled={loading} title="Neu analysieren">
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!data ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <MapPin className="size-6 text-neutral-300" />
            <p className="text-sm text-neutral-500">
              Umgebung analysieren: Einkaufen, ÖPNV, Ärzte, Natur u. v. m. im Umkreis.
            </p>
            <Button
              size="sm"
              className="bg-green-700 hover:bg-green-800"
              onClick={analyze}
              disabled={loading}
            >
              {loading ? "Analysiere…" : "Lage analysieren"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-neutral-500">Gesamt</span>
              <span className={cn("text-lg font-semibold tabular-nums", ringColor(overallLageScore(data.scores)))}>
                {overallLageScore(data.scores).toLocaleString("de-DE", { minimumFractionDigits: 1 })}
                <span className="text-xs font-normal text-neutral-400"> / 5</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-x-2 gap-y-3">
              {LAGE_CATEGORIES.map((cat) => (
                <ScoreRing key={cat} score={data.scores[cat]} label={LAGE_CATEGORY_META[cat].label} />
              ))}
            </div>
            {PRECISION_HINT[data.precision] && (
              <p className="text-xs text-amber-700">⚠ {PRECISION_HINT[data.precision]}</p>
            )}
            <p className="text-right text-[11px] text-neutral-400">
              Stand {formatDate(data.computedAt)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
