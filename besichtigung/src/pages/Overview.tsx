import { Link, useNavigate } from "react-router-dom";
import { AppBar, RecommendationBadge, ScoreRing } from "../components/ui";
import { computeScore, formatEUR, formatDate } from "../lib/scoring";
import { newInspection, useStore } from "../lib/store";
import { STATUS_LABELS } from "../lib/types";

export default function Overview() {
  const { inspections, settings, upsert } = useStore();
  const nav = useNavigate();

  const scored = inspections.map((i) => ({ insp: i, score: computeScore(i, settings) }));
  const open = scored.filter((s) => ["geplant", "in_bearbeitung"].includes(s.insp.status));
  const withScore = scored.filter((s) => s.score.total != null);
  const avg =
    withScore.length > 0
      ? Math.round(withScore.reduce((a, s) => a + (s.score.total ?? 0), 0) / withScore.length)
      : null;
  const flagged = scored.filter((s) => s.score.redFlags.some((f) => f.severity === "critical"));
  const best = [...withScore]
    .filter((s) => s.insp.status !== "verworfen")
    .sort((a, b) => (b.score.total ?? 0) - (a.score.total ?? 0))[0];
  const recent = [...scored]
    .sort((a, b) => (a.insp.updated_at < b.insp.updated_at ? 1 : -1))
    .slice(0, 5);

  const createNew = () => {
    const insp = newInspection();
    upsert(insp);
    nav(`/besichtigung/${insp.id}/objekt`);
  };

  return (
    <>
      <AppBar title="Übersicht" />
      <main className="content">
        <div className="hero">
          <h1>Besichtigungen</h1>
          <p>Erfassen. Bewerten. Entscheiden.</p>
        </div>

        <div className="statgrid">
          <div className="stat">
            <div className="num">{open.length}</div>
            <div className="lbl">Offene Besichtigungen</div>
          </div>
          <div className="stat">
            <div className="num">{avg ?? "–"}</div>
            <div className="lbl">Ø Score</div>
          </div>
          <div className="stat">
            <div className="num" style={{ color: flagged.length ? "var(--verybad)" : undefined }}>
              {flagged.length}
            </div>
            <div className="lbl">Objekte mit Red Flags</div>
          </div>
          <div className="stat">
            <div className="num">{best?.score.total ?? "–"}</div>
            <div className="lbl">
              {best ? `Beste: ${best.insp.title || best.insp.objekt.bezeichnung || "Ohne Titel"}` : "Beste Wohnung"}
            </div>
          </div>
        </div>

        <div className="spacer" />
        <button className="btn block large" onClick={createNew}>
          ＋ Neue Besichtigung
        </button>

        {recent.length > 0 && (
          <>
            <h2 className="section-title">Zuletzt bearbeitet</h2>
            {recent.map(({ insp, score }) => (
              <Link key={insp.id} to={`/besichtigung/${insp.id}`} className="card card-tappable icard">
                <div className="row1">
                  <ScoreRing value={score.total} />
                  <div className="titleblock">
                    <div className="t">{insp.title || (insp.objekt.bezeichnung as string) || "Ohne Titel"}</div>
                    <div className="s">
                      {(insp.objekt.adresse as string) || "Keine Adresse"} · {formatDate(insp.objekt.datum as string)}
                    </div>
                  </div>
                  <RecommendationBadge rec={score.recommendation} />
                </div>
                <div className="meta">
                  <span className="badge neutral">{STATUS_LABELS[insp.status]}</span>
                  <span>
                    <b>{formatEUR(Number(insp.objekt.kaufpreis) || null)}</b>
                  </span>
                  {score.redFlags.length > 0 && (
                    <span style={{ color: "var(--verybad)" }}>
                      ⚑ {score.redFlags.length} Red Flag{score.redFlags.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </>
        )}

        {inspections.length === 0 && (
          <div className="empty">
            <div className="big">🏠</div>
            Noch keine Besichtigungen.
            <br />
            Lege deine erste Besichtigung an.
          </div>
        )}
      </main>
    </>
  );
}
