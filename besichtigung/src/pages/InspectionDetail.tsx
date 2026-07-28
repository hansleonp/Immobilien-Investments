import { Link, useNavigate, useParams } from "react-router-dom";
import { AppBar, RecommendationBadge, ScoreRing } from "../components/ui";
import { QUESTIONS, SECTION_META, WIZARD_ORDER } from "../lib/catalog";
import { computeScore, effectiveCriteria, formatEUR, grossYield, pricePerSqm } from "../lib/scoring";
import { useStore, STATUS_ORDER } from "../lib/store";
import { CATEGORY_LABELS, CATEGORY_WEIGHTS, STATUS_LABELS, type Category, type SectionId, type Status } from "../lib/types";

export default function InspectionDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { inspections, settings, patch, remove } = useStore();
  const insp = inspections.find((i) => i.id === id);

  if (!insp) {
    return (
      <>
        <AppBar title="Besichtigung" back="/besichtigungen" />
        <main className="content">
          <div className="empty">Besichtigung nicht gefunden.</div>
        </main>
      </>
    );
  }

  const score = computeScore(insp, settings);
  const criteria = effectiveCriteria(settings);
  const vermietet = !!insp.objekt.vermietet;
  const sqm = pricePerSqm(insp);
  const y = grossYield(insp);

  // Fortschritt pro Sektion
  const sectionProgress = (section: SectionId): { done: number; total: number } => {
    if (section === "objekt") {
      const required = ["bezeichnung", "adresse", "kaufpreis", "flaeche"];
      const done = required.filter((f) => insp.objekt[f] !== undefined && insp.objekt[f] !== "").length;
      return { done, total: required.length };
    }
    if (section === "fragen") {
      const qs = QUESTIONS.filter((q) => vermietet || q.group !== "Vermietung");
      return { done: qs.filter((q) => insp.questions[q.id]?.checked).length, total: qs.length };
    }
    if (section === "bericht") return { done: 0, total: 0 };
    const crits = criteria.filter((c) => c.section === section);
    const done = crits.filter((c) => insp.answers[c.id]?.v !== undefined).length;
    return { done, total: crits.length };
  };

  const deleteInsp = () => {
    if (confirm("Diese Besichtigung wirklich löschen?")) {
      remove(insp.id);
      nav("/besichtigungen");
    }
  };

  const title = insp.title || (insp.objekt.bezeichnung as string) || "Ohne Titel";

  return (
    <>
      <AppBar title={title} back="/besichtigungen" />
      <main className="content">
        {/* Kopf: Score + Eckdaten */}
        <div className="card icard">
          <div className="row1">
            <ScoreRing value={score.total} size={64} />
            <div className="titleblock">
              <div className="t">{title}</div>
              <div className="s">{(insp.objekt.adresse as string) || "Keine Adresse"}</div>
              <div style={{ marginTop: 6 }}>
                <RecommendationBadge rec={score.recommendation} label={score.recommendationLabel} />
              </div>
            </div>
          </div>
          <div className="meta">
            <span>
              <b>{formatEUR(Number(insp.objekt.kaufpreis) || null)}</b>
            </span>
            {Number(insp.objekt.flaeche) > 0 && <span>{insp.objekt.flaeche} m²</span>}
            {sqm != null && <span>{formatEUR(sqm)} / m²</span>}
            {y != null && <span>{y.toFixed(1)} % Bruttorendite</span>}
          </div>
          <div className="rowflex">
            <label className="fineprint" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              value={insp.status}
              onChange={(e) => patch(insp.id, { status: e.target.value as Status })}
              style={{
                flex: 1,
                border: "1px solid var(--hairline)",
                borderRadius: "var(--r-pill)",
                padding: "8px 14px",
                background: "var(--pearl)",
                WebkitAppearance: "none",
                appearance: "none",
              }}
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Red Flags */}
        {score.redFlags.length > 0 && (
          <div className="card" style={{ borderColor: "var(--verybad)" }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>⚑ Red Flags</div>
            {score.redFlags.map((f) => (
              <div key={f.label} className={`flagrow ${f.severity}`}>
                <span className="dot" />
                <span>
                  {f.label}
                  {f.severity === "warn" && <span className="fineprint"> (Warnhinweis)</span>}
                </span>
              </div>
            ))}
            {score.redFlags.some((f) => f.severity === "critical") && (
              <p className="fineprint" style={{ marginTop: 8 }}>
                Kritische Red Flags verhindern eine grüne Empfehlung — unabhängig vom Score.
              </p>
            )}
          </div>
        )}

        {/* Sektionen */}
        <h2 className="section-title">Bewertung</h2>
        <div className="card form-list">
          {WIZARD_ORDER.filter((s) => s !== "mieter" || vermietet).map((s) => {
            const meta = SECTION_META[s];
            const prog = sectionProgress(s);
            return (
              <Link key={s} to={`/besichtigung/${insp.id}/${s}`} className="sectionrow card-tappable">
                <span className="ico">{meta.icon}</span>
                <span className="tx">
                  <div className="t">{meta.title}</div>
                  <div className="s">{meta.subtitle}</div>
                  {prog.total > 0 && (
                    <div className="progressbar" style={{ marginTop: 6 }}>
                      <div style={{ width: `${(prog.done / prog.total) * 100}%` }} />
                    </div>
                  )}
                </span>
                {prog.total > 0 && (
                  <span className="done">
                    {prog.done}/{prog.total}
                  </span>
                )}
                <span className="chev">›</span>
              </Link>
            );
          })}
        </div>

        {/* Kategorie-Scores */}
        {score.total != null && (
          <>
            <h2 className="section-title">Score nach Kategorie</h2>
            <div className="card form-list">
              {(Object.keys(CATEGORY_WEIGHTS) as Category[]).map((cat) => {
                const v = score.perCategory[cat];
                return (
                  <div key={cat} className="frow">
                    <label>
                      {CATEGORY_LABELS[cat]}{" "}
                      <span className="fineprint">({CATEGORY_WEIGHTS[cat]} %)</span>
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1.2 }}>
                      <div className="progressbar" style={{ flex: 1 }}>
                        <div
                          style={{
                            width: `${v ?? 0}%`,
                            background:
                              v == null
                                ? "var(--hairline)"
                                : v >= 75
                                ? "var(--good)"
                                : v >= 55
                                ? "var(--ok)"
                                : "var(--verybad)",
                          }}
                        />
                      </div>
                      <b style={{ minWidth: 30, textAlign: "right", fontSize: 15 }}>{v ?? "–"}</b>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="spacer" />
        <button className="btn danger block" onClick={deleteInsp}>
          Besichtigung löschen
        </button>
      </main>
    </>
  );
}
