"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  Check,
  Copy,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { propertyAnalysisSchema, type PropertyAnalysis } from "@/lib/ai/schemas";
import { formatDateTime, formatEuro } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EnrichedProperty } from "@/types";

const SEVERITY_META: Record<
  PropertyAnalysis["risiken"][number]["schweregrad"],
  { label: string; badge: string }
> = {
  hoch: { label: "Hoch", badge: "bg-red-100 text-red-800" },
  mittel: { label: "Mittel", badge: "bg-amber-100 text-amber-800" },
  niedrig: { label: "Niedrig", badge: "bg-neutral-200 text-neutral-600" },
};

export function TabKi({ enriched }: { enriched: EnrichedProperty }) {
  const { property: p, finance } = enriched;
  const queryClient = useQueryClient();
  const [analyzing, setAnalyzing] = useState(false);
  const [needsKey, setNeedsKey] = useState(false);

  const parsed = propertyAnalysisSchema.safeParse(p.ai_analysis);
  const analysis = parsed.success ? parsed.data : null;

  async function runAnalysis() {
    if (analyzing) return;
    setAnalyzing(true);
    setNeedsKey(false);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: p.id }),
      });
      if (res.status === 503) {
        setNeedsKey(true);
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      await queryClient.invalidateQueries({ queryKey: ["properties", p.id] });
      toast.success("KI-Analyse erstellt");
    } catch (e) {
      toast.error(
        e instanceof Error && e.message
          ? `Analyse fehlgeschlagen: ${e.message}`
          : "Analyse fehlgeschlagen — bitte erneut versuchen."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  async function copyMessage() {
    if (!analysis) return;
    try {
      await navigator.clipboard.writeText(analysis.anfrage_nachricht);
      toast.success("Nachricht kopiert");
    } catch {
      toast.error("Kopieren fehlgeschlagen");
    }
  }

  if (needsKey) {
    return <SetupHintCard onRetry={runAnalysis} retrying={analyzing} />;
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-green-700" /> KI-Analyse
          </CardTitle>
          <CardDescription>
            Mistral bewertet das Objekt als Kapitalanlage: Stärken, Risiken,
            Miet-Plausibilität, eine Verhandlungsempfehlung auf Basis von
            Break-even- und Max-Kaufpreis sowie ein fertiger Anfrage-Text an den
            Anbieter. Grundlage sind die erfassten Objektdaten, die berechneten
            Kennzahlen und die Marktreferenz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            type="button"
            onClick={runAnalysis}
            disabled={analyzing}
            className="bg-green-700 hover:bg-green-800"
          >
            {analyzing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {analyzing ? "Analyse läuft…" : "Analyse erstellen"}
          </Button>
          {analyzing && (
            <p className="text-xs text-neutral-500">
              Die Analyse kann 30–60 Sekunden dauern — bitte das Fenster geöffnet
              lassen.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Zusammenfassung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-green-700" /> Zusammenfassung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-neutral-700">
            {analysis.zusammenfassung}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Stärken */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stärken</CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.staerken.length === 0 ? (
              <p className="text-sm text-neutral-500">Keine Stärken benannt.</p>
            ) : (
              <ul className="space-y-2">
                {analysis.staerken.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-green-600" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Risiken */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risiken</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.risiken.length === 0 ? (
              <p className="text-sm text-neutral-500">Keine Risiken benannt.</p>
            ) : (
              analysis.risiken.map((r, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{r.titel}</p>
                    <Badge
                      className={cn(
                        "shrink-0 font-normal",
                        SEVERITY_META[r.schweregrad].badge
                      )}
                    >
                      {SEVERITY_META[r.schweregrad].label}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-neutral-600">{r.erlaeuterung}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Miet-Plausibilität */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Miet-Plausibilität</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-neutral-700">
            {analysis.miete_plausibilitaet}
          </p>
        </CardContent>
      </Card>

      {/* Verhandlung */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verhandlungsempfehlung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border bg-green-50 p-3">
              <p className="text-xs text-neutral-500">Empfohlenes Angebot</p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums text-green-800">
                {formatEuro(analysis.verhandlung.empfohlenes_angebot)}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-neutral-500">Max. sinnvoller Kaufpreis</p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums">
                {formatEuro(finance.maxReasonablePrice)}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-neutral-500">Break-even-Kaufpreis</p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums">
                {formatEuro(finance.breakEvenPrice)}
              </p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-neutral-700">
            {analysis.verhandlung.begruendung}
          </p>
        </CardContent>
      </Card>

      {/* Anfrage-Nachricht */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Anfrage an den Anbieter</CardTitle>
            <CardDescription>
              Vorschlag für die Erstanfrage — vor dem Versand prüfen.
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={copyMessage}>
            <Copy className="size-4" /> Kopieren
          </Button>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap rounded-lg border bg-neutral-50 p-4 font-mono text-sm leading-relaxed">
            {analysis.anfrage_nachricht}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-neutral-400">
          Analysiert am {formatDateTime(p.ai_analyzed_at)} · KI-Einschätzung — keine
          Anlage- oder Rechtsberatung.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={runAnalysis}
          disabled={analyzing}
        >
          {analyzing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          {analyzing ? "Analyse läuft… (30–60 s)" : "Neu analysieren"}
        </Button>
      </div>
    </div>
  );
}

function SetupHintCard({
  onRetry,
  retrying,
}: {
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <Card className="border-amber-300 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-amber-900">
          <AlertTriangle className="size-4 text-amber-600" /> Mistral-API-Key
          nicht konfiguriert
        </CardTitle>
        <CardDescription className="text-amber-800">
          Die KI-Analyse benötigt einen Mistral-API-Key. Einrichtung:
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-amber-900">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            Auf{" "}
            <a
              href="https://console.mistral.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline"
            >
              console.mistral.ai
            </a>{" "}
            einen API-Key erstellen (Bereich „API Keys“).
          </li>
          <li>
            Lokal: <code className="rounded bg-amber-100 px-1">MISTRAL_API_KEY=…</code>{" "}
            in <code className="rounded bg-amber-100 px-1">.env.local</code> eintragen
            und den Dev-Server neu starten.
          </li>
          <li>
            Produktion: den Key in den Vercel-Umgebungsvariablen des Projekts
            hinterlegen und neu deployen.
          </li>
        </ol>
        <Button type="button" variant="outline" onClick={onRetry} disabled={retrying}>
          {retrying ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          Erneut versuchen
        </Button>
      </CardContent>
    </Card>
  );
}
