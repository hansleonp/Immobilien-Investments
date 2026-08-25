import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppBar, RecommendationBadge, ScoreRing } from "../components/ui";
import { CalendarAgenda } from "../components/CalendarAgenda";
import { computeScore, formatEUR, grossYield, pricePerSqm } from "../lib/scoring";
import { newInspection, useStore, STATUS_ORDER } from "../lib/store";
import { STATUS_LABELS, type Inspection, type Property, type Status } from "../lib/types";

type Sort = "datum" | "score" | "preis" | "rendite" | "risiko";

const SORT_LABELS: Record<Sort, string> = {
  datum: "Datum",
  score: "Score",
  preis: "Preis",
  rendite: "Rendite",
  risiko: "Risiko",
};

// Objektdaten aus einer Immobilie in die Besichtigungs-Objektfelder übertragen
function objektFromProperty(p: Property): Inspection["objekt"] {
  const o: Inspection["objekt"] = { datum: new Date().toISOString().slice(0, 10) };
  if (p.titel || p.ort) o.bezeichnung = p.titel || p.ort;
  if (p.ort) o.adresse = p.ort;
  if (p.link) o.inserat = p.link;
  if (p.preis != null) o.kaufpreis = p.preis;
  if (p.wohnflaeche != null) o.flaeche = p.wohnflaeche;
  if (p.zimmer != null) o.zimmer = p.zimmer;
  if (p.baujahr != null) o.baujahr = p.baujahr;
  if (p.miete != null) o.miete_geschaetzt = p.miete;
  if (p.wunschpreis != null) o.wunschpreis = p.wunschpreis;
  return o;
}

// Kompaktes „Di, 12.08. · 14:30" (Uhrzeit optional)
function formatTermin(datum?: string, uhrzeit?: string): string | null {
  if (!datum) return uhrzeit || null;
  const d = new Date(datum);
  if (isNaN(d.getTime())) return uhrzeit || null;
  const day = d.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });
  return uhrzeit ? `${day} · ${uhrzeit} Uhr` : day;
}

export default function Inspections() {
  const { inspections, properties, settings, upsert } = useStore();
  const nav = useNavigate();
  const [filter, setFilter] = useState<Status | "alle">("alle");
  const [sort, setSort] = useState<Sort>("datum");
  const [picker, setPicker] = useState(false);
  const [q, setQ] = useState("");
  const [view, setView] = useState<"liste" | "kalender">("liste");

  const propMatches = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = [...properties].sort((a, b) =>
      String(b.updated_at ?? "").localeCompare(String(a.updated_at ?? ""))
    );
    if (!needle) return list;
    return list.filter((p) =>
      [p.ort, p.quelle, p.notizen].filter(Boolean).join(" ").toLowerCase().includes(needle)
    );
  }, [properties, q]);

  const createEmpty = () => {
    const insp = newInspection();
    upsert(insp);
    nav(`/besichtigung/${insp.id}/objekt`);
  };

  const createFromProperty = (p: Property) => {
    const insp = newInspection();
    insp.title = p.titel || p.ort || "Besichtigung";
    insp.propertyId = p.id;
    insp.propertyDocs = p.docs ?? [];
    insp.objekt = objektFromProperty(p);
    upsert(insp);
    nav(`/besichtigung/${insp.id}/objekt`);
  };

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

  return (
    <>
      <AppBar
        title="Besichtigungen"
        action={
          <button className="action" onClick={() => { setQ(""); setPicker(true); }}>
            ＋
          </button>
        }
      />
      <main className="content">
        <div className="chips">
          <button className={`chip ${view === "liste" ? "on" : ""}`} onClick={() => setView("liste")}>
            ☰ Liste
          </button>
          <button className={`chip ${view === "kalender" ? "on" : ""}`} onClick={() => setView("kalender")}>
            📅 Kalender
          </button>
        </div>

        {view === "kalender" && <CalendarAgenda inspections={inspections} properties={properties} />}

        {view === "liste" && (
        <>
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
          const ist = Number(insp.objekt.kaufpreis) || null;
          const wunsch = Number(insp.objekt.wunschpreis) || null;
          const termin = formatTermin(insp.objekt.datum as string, insp.objekt.uhrzeit as string);
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
              {termin && <div className="termin">📅 {termin}</div>}
              <div className="meta">
                <span className="badge neutral">{STATUS_LABELS[insp.status]}</span>
                <span>IST <b>{formatEUR(ist)}</b></span>
                {wunsch != null && (
                  <span style={{ color: "#6B3FA0" }}>Wunsch <b>{formatEUR(wunsch)}</b></span>
                )}
                {Number(insp.objekt.flaeche) > 0 && <span>{insp.objekt.flaeche} m²</span>}
                {sqm != null && <span>{formatEUR(sqm)} / m²</span>}
                {y != null && <span>{y.toFixed(1)} % Rendite</span>}
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
        </>
        )}
      </main>

      {picker && (
        <div className="sheet-overlay" onClick={() => setPicker(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <h2 className="group-title" style={{ marginTop: 0 }}>Neue Besichtigung</h2>
            <button className="btn block" onClick={createEmpty}>
              ＋ Leere Besichtigung anlegen
            </button>

            <div className="sheet-divider"><span>oder aus einer Immobilie übernehmen</span></div>

            <input
              className="sheet-search"
              type="search"
              placeholder="Immobilie suchen (Ort, Quelle …)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <div className="sheet-list">
              {propMatches.length === 0 ? (
                <p className="fineprint" style={{ padding: "8px 2px" }}>
                  {properties.length === 0
                    ? "Noch keine Immobilien im Immobilien-Reiter erfasst."
                    : "Keine Immobilie passt zur Suche."}
                </p>
              ) : (
                propMatches.map((p) => {
                  const docCount = p.docs?.length ?? 0;
                  return (
                    <button key={p.id} className="pick-row" onClick={() => createFromProperty(p)}>
                      <div className="pick-main">
                        <div className="t">{p.ort || "Ohne Ort"}</div>
                        <div className="s">
                          {[p.quelle, p.zimmer ? `${p.zimmer} Zi` : null, p.wohnflaeche ? `${p.wohnflaeche} m²` : null]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </div>
                      </div>
                      <div className="pick-meta">
                        <span><b>{formatEUR(p.preis)}</b></span>
                        {docCount > 0 && <span className="fineprint">📎 {docCount}</span>}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <button className="btn ghost block" onClick={() => setPicker(false)}>Abbrechen</button>
          </div>
        </div>
      )}
    </>
  );
}
