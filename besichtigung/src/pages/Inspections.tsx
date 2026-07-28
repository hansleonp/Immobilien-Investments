import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppBar, RecommendationBadge, ScoreRing } from "../components/ui";
import { computeScore, formatDate, formatEUR, grossYield, pricePerSqm } from "../lib/scoring";
import { newInspection, useStore, STATUS_ORDER } from "../lib/store";
import { STATUS_LABELS, type Status } from "../lib/types";

type Sort = "datum" | "score" | "preis" | "rendite" | "risiko";

const SORT_LABELS: Record<Sort, string> = {
  datum: "Datum",
  score: "Score",
  preis: "Preis",
  rendite: "Rendite",
  risiko: "Risiko",
};

export default function Inspections() {
  const { inspections, settings, upsert } = useStore();
  const nav = useNavigate();
  const [filter, setFilter] = useState<Status | "alle">("alle");
  const [sort, setSort] = useState<Sort>("datum");

  const rows = inspections
    .map((i) => ({ insp: i, score: computeScore(i, settings) }))
    .filter((r) => filter === "alle" || r.insp.status === filter)
    .sort((a, b) => {
      switch (sort) {
        case "score":
          return (b.score.total ?? -1) - (a.score.total ?? -1);
        case "preis":
          return (Number(a.insp.objekt.kaufpreis) || Infinity) - (Number(b.insp.objekt.kaufpreis) || Infinity);
        case "rendite":
          return (grossYield(b.insp) ?? -1) - (grossYield(a.insp) ?? -1);
        case "risiko": {
          const risk = (r: typeof a) =>
            r.score.redFlags.filter((f) => f.severity === "critical").length * 10 + r.score.redFlags.length;
          return risk(b) - risk(a);
        }
        default:
          return String(b.insp.objekt.datum ?? "").localeCompare(String(a.insp.objekt.datum ?? ""));
      }
    });

  const createNew = () => {
    const insp = newInspection();
    upsert(insp);
    nav(`/besichtigung/${insp.id}/objekt`);
  };

  return (
    <>
      <AppBar
        title="Besichtigungen"
        action={
          <button className="action" onClick={createNew}>
            ＋
          </button>
        }
      />
      <main className="content">
        <div className="chips">
          <button className={`chip ${filter === "alle" ? "on" : ""}`} onClick={() => setFilter("alle")}>
            Alle
          </button>
          {STATUS_ORDER.map((s) => (
            <button key={s} className={`chip ${filter === s ? "on" : ""}`} onClick={() => setFilter(s)}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <div className="chips">
          {(Object.keys(SORT_LABELS) as Sort[]).map((s) => (
            <button key={s} className={`chip ${sort === s ? "on" : ""}`} onClick={() => setSort(s)}>
              ↕ {SORT_LABELS[s]}
            </button>
          ))}
        </div>

        {rows.map(({ insp, score }) => {
          const sqm = pricePerSqm(insp);
          const y = grossYield(insp);
          return (
            <Link key={insp.id} to={`/besichtigung/${insp.id}`} className="card card-tappable icard">
              <div className="row1">
                <ScoreRing value={score.total} />
                <div className="titleblock">
                  <div className="t">{insp.title || (insp.objekt.bezeichnung as string) || "Ohne Titel"}</div>
                  <div className="s">{(insp.objekt.adresse as string) || "Keine Adresse"}</div>
                </div>
                <RecommendationBadge rec={score.recommendation} />
              </div>
              <div className="meta">
                <span className="badge neutral">{STATUS_LABELS[insp.status]}</span>
                <span>
                  <b>{formatEUR(Number(insp.objekt.kaufpreis) || null)}</b>
                </span>
                {Number(insp.objekt.flaeche) > 0 && <span>{insp.objekt.flaeche} m²</span>}
                {sqm != null && <span>{formatEUR(sqm)} / m²</span>}
                {y != null && <span>{y.toFixed(1)} % Rendite</span>}
                <span>{formatDate(insp.objekt.datum as string)}</span>
              </div>
              <div className="meta">
                {score.openQuestions > 0 && <span>{score.openQuestions} offene Fragen</span>}
                {score.redFlags.length > 0 && (
                  <span style={{ color: "var(--verybad)" }}>⚑ {score.redFlags.length} Red Flags</span>
                )}
              </div>
            </Link>
          );
        })}

        {rows.length === 0 && (
          <div className="empty">
            <div className="big">📋</div>
            Keine Besichtigungen in dieser Ansicht.
          </div>
        )}
      </main>
    </>
  );
}
