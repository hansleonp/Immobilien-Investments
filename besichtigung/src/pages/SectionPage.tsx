import { Fragment, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CriterionRow } from "../components/CriterionRow";
import { AppBar, RecommendationBadge, ScoreRing, Toggle } from "../components/ui";
import {
  DOCUMENTS,
  MIETER_FIELDS,
  OBJEKT_FIELDS,
  QUESTIONS,
  SECTION_META,
  TECH_FIELDS,
  WIZARD_ORDER,
} from "../lib/catalog";
import { computeScore, effectiveCriteria, formatEUR, grossYield, pricePerSqm } from "../lib/scoring";
import { useStore } from "../lib/store";
import {
  DOC_STATUS,
  type Answer,
  type Criterion,
  type InfoField,
  type Inspection,
  type SectionId,
} from "../lib/types";

export default function SectionPage() {
  const { id, section } = useParams();
  const nav = useNavigate();
  const { inspections, settings, patch } = useStore();
  const insp = inspections.find((i) => i.id === id);
  const sec = section as SectionId;

  const criteria = useMemo(
    () => effectiveCriteria(settings).filter((c) => c.section === sec),
    [settings, sec]
  );

  if (!insp || !SECTION_META[sec]) {
    return (
      <>
        <AppBar title="Bereich" back={id ? `/besichtigung/${id}` : "/besichtigungen"} />
        <main className="content">
          <div className="empty">Nicht gefunden.</div>
        </main>
      </>
    );
  }

  const meta = SECTION_META[sec];
  const vermietet = !!insp.objekt.vermietet;

  const setAnswer = (critId: string, a: Answer) =>
    patch(insp.id, { answers: { ...insp.answers, [critId]: a } });

  const setObjekt = (fieldId: string, v: string | number | boolean | undefined) =>
    patch(insp.id, { objekt: { ...insp.objekt, [fieldId]: v } });

  // Weiter/Zurück im Wizard
  const order = WIZARD_ORDER.filter((s) => s !== "mieter" || vermietet);
  const idx = order.indexOf(sec);
  const prev = idx > 0 ? order[idx - 1] : null;
  const next = idx < order.length - 1 ? order[idx + 1] : null;

  const groupedCriteria = groupBy(criteria, (c) => c.group ?? "");

  return (
    <>
      <AppBar title={meta.title} back={`/besichtigung/${insp.id}`} />
      <main className="content">
        <p className="fineprint" style={{ padding: "0 4px 12px" }}>
          {meta.subtitle}
          {sec !== "objekt" && sec !== "bericht" && (
            <> — eigene Kriterien kannst du unter Einstellungen ergänzen.</>
          )}
        </p>

        {sec === "objekt" && <ObjektForm insp={insp} setObjekt={setObjekt} />}

        {sec === "technik" && <InfoFields fields={TECH_FIELDS} insp={insp} setObjekt={setObjekt} />}
        {sec === "mieter" && <InfoFields fields={MIETER_FIELDS} insp={insp} setObjekt={setObjekt} />}

        {sec === "weg" && <DocList insp={insp} patch={patch} />}

        {sec === "fragen" && <QuestionList insp={insp} patch={patch} vermietet={vermietet} />}

        {sec === "bericht" && <Report insp={insp} />}

        {/* Bewertete Kriterien in Gruppen */}
        {[...groupedCriteria.entries()].map(([group, crits]) => (
          <Fragment key={group || "std"}>
            {group ? (
              <h2 className="group-title">{group}</h2>
            ) : sec === "technik" || sec === "mieter" ? (
              <h2 className="group-title">Bewertung</h2>
            ) : null}
            <div className="card form-list">
              {crits.map((c) => (
                <CriterionRow
                  key={c.id}
                  crit={c}
                  answer={insp.answers[c.id]}
                  inspectionId={insp.id}
                  onChange={(a) => setAnswer(c.id, a)}
                />
              ))}
            </div>
          </Fragment>
        ))}

        {/* Wizard-Navigation */}
        <div className="spacer" />
        <div className="rowflex">
          {prev && (
            <button className="btn secondary grow" onClick={() => nav(`/besichtigung/${insp.id}/${prev}`)}>
              ‹ {SECTION_META[prev].title}
            </button>
          )}
          {next ? (
            <button className="btn grow" onClick={() => nav(`/besichtigung/${insp.id}/${next}`)}>
              {SECTION_META[next].title} ›
            </button>
          ) : (
            <button className="btn grow" onClick={() => nav(`/besichtigung/${insp.id}`)}>
              Fertig
            </button>
          )}
        </div>
      </main>
    </>
  );
}

// ---------- Objekt-Formular ----------
function ObjektForm({
  insp,
  setObjekt,
}: {
  insp: Inspection;
  setObjekt: (id: string, v: string | number | boolean | undefined) => void;
}) {
  const sqm = pricePerSqm(insp);
  const groups = groupBy(OBJEKT_FIELDS, (f) => f.group ?? "");
  return (
    <>
      {[...groups.entries()].map(([group, fields]) => (
        <Fragment key={group || "main"}>
          {group && <h2 className="group-title">{group}</h2>}
          <div className="card form-list">
            {fields.map((f) => (
              <FieldRow key={f.id} field={f} value={insp.objekt[f.id]} onChange={(v) => setObjekt(f.id, v)} />
            ))}
            {!group && (
              <div className="frow">
                <label>Kaufpreis pro m²</label>
                <b>{sqm != null ? formatEUR(sqm) : "–"}</b>
              </div>
            )}
          </div>
        </Fragment>
      ))}
    </>
  );
}

// ---------- Info-Felder (Technik, Mieter) ----------
function InfoFields({
  fields,
  insp,
  setObjekt,
}: {
  fields: InfoField[];
  insp: Inspection;
  setObjekt: (id: string, v: string | number | boolean | undefined) => void;
}) {
  const groups = groupBy(fields, (f) => f.group ?? "");
  return (
    <>
      {[...groups.entries()].map(([group, fs]) => (
        <Fragment key={group}>
          {group && <h2 className="group-title">{group} — Daten</h2>}
          <div className="card form-list">
            {fs.map((f) => (
              <FieldRow key={f.id} field={f} value={insp.objekt[f.id]} onChange={(v) => setObjekt(f.id, v)} />
            ))}
          </div>
        </Fragment>
      ))}
    </>
  );
}

function FieldRow({
  field,
  value,
  onChange,
}: {
  field: InfoField;
  value: string | number | boolean | undefined;
  onChange: (v: string | number | boolean | undefined) => void;
}) {
  return (
    <div className="frow">
      <label htmlFor={field.id}>{field.label}</label>
      {field.type === "toggle" ? (
        <Toggle on={!!value} onChange={(v) => onChange(v)} />
      ) : field.type === "select" ? (
        <select id={field.id} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value || undefined)}>
          <option value="">–</option>
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea
          id={field.id}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value || undefined)}
        />
      ) : (
        <input
          id={field.id}
          type={field.type}
          inputMode={field.type === "number" ? "decimal" : undefined}
          placeholder={field.placeholder ?? "–"}
          value={value === undefined || value === null ? "" : String(value)}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") return onChange(undefined);
            onChange(field.type === "number" ? Number(raw) : raw);
          }}
        />
      )}
      {field.unit && <span className="unit">{field.unit}</span>}
    </div>
  );
}

// ---------- WEG-Dokumente ----------
function DocList({
  insp,
  patch,
}: {
  insp: Inspection;
  patch: (id: string, p: Partial<Inspection>) => void;
}) {
  return (
    <>
      <h2 className="group-title">Dokumente</h2>
      <div className="card form-list">
        {DOCUMENTS.map((d) => {
          const status = insp.docs[d.id] ?? "nicht angefordert";
          const tone =
            status === "auffällig"
              ? "var(--verybad)"
              : status === "geprüft"
              ? "var(--good)"
              : status === "erhalten"
              ? "var(--primary)"
              : "var(--ink-muted-48)";
          return (
            <div key={d.id} className="frow">
              <label>{d.label}</label>
              <select
                value={status}
                style={{ color: tone, fontWeight: status === "nicht angefordert" ? 400 : 600 }}
                onChange={(e) => patch(insp.id, { docs: { ...insp.docs, [d.id]: e.target.value } })}
              >
                {DOC_STATUS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
      <h2 className="group-title">WEG-Fragen</h2>
    </>
  );
}

// ---------- Fragenliste ----------
function QuestionList({
  insp,
  patch,
  vermietet,
}: {
  insp: Inspection;
  patch: (id: string, p: Partial<Inspection>) => void;
  vermietet: boolean;
}) {
  const groups = groupBy(
    QUESTIONS.filter((q) => vermietet || q.group !== "Vermietung"),
    (q) => q.group
  );
  return (
    <>
      {[...groups.entries()].map(([group, qs]) => (
        <Fragment key={group}>
          <h2 className="group-title">{group}</h2>
          <div className="card form-list">
            {qs.map((q) => {
              const state = insp.questions[q.id] ?? {};
              const setQ = (p: Partial<typeof state>) =>
                patch(insp.id, { questions: { ...insp.questions, [q.id]: { ...state, ...p } } });
              return (
                <div key={q.id} className="crit">
                  <div className="rowflex" style={{ alignItems: "flex-start" }}>
                    <button
                      type="button"
                      onClick={() => setQ({ checked: !state.checked })}
                      aria-label="abhaken"
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        flexShrink: 0,
                        marginTop: 2,
                        border: state.checked ? "none" : "1.5px solid var(--hairline)",
                        background: state.checked ? "var(--good)" : "var(--canvas)",
                        color: "#fff",
                        fontSize: 14,
                        cursor: "pointer",
                      }}
                    >
                      {state.checked ? "✓" : ""}
                    </button>
                    <div className="grow">
                      <div
                        className="label"
                        style={{ color: state.checked ? "var(--ink-muted-48)" : undefined }}
                      >
                        {q.label}
                      </div>
                      <textarea
                        placeholder="Antwort notieren…"
                        value={state.answer ?? ""}
                        onChange={(e) => setQ({ answer: e.target.value })}
                        style={{ marginTop: 6, minHeight: 40 }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Fragment>
      ))}
    </>
  );
}

// ---------- Ergebnisbericht ----------
function Report({ insp }: { insp: Inspection }) {
  const { settings, patch } = useStore();
  const score = computeScore(insp, settings);
  const sqm = pricePerSqm(insp);
  const y = grossYield(insp);
  const missingDocs = DOCUMENTS.filter(
    (d) => !insp.docs[d.id] || insp.docs[d.id] === "nicht angefordert" || insp.docs[d.id] === "angefordert"
  );

  const setReport = (k: keyof Inspection["report"], v: string) =>
    patch(insp.id, { report: { ...insp.report, [k]: v } });

  return (
    <>
      <div className="card icard">
        <div className="row1">
          <ScoreRing value={score.total} size={72} />
          <div className="titleblock">
            <div className="t">{insp.title || (insp.objekt.bezeichnung as string) || "Ohne Titel"}</div>
            <div className="s">{(insp.objekt.adresse as string) || ""}</div>
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
          <span>{score.answered} Kriterien bewertet</span>
          <span>{score.openQuestions} offene Fragen</span>
        </div>
      </div>

      {score.redFlags.length > 0 && (
        <div className="card" style={{ borderColor: "var(--verybad)" }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>⚑ Größte Risiken</div>
          {score.redFlags.map((f) => (
            <div key={f.label} className={`flagrow ${f.severity}`}>
              <span className="dot" />
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      )}

      {missingDocs.length > 0 && (
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 4 }}>📄 Fehlende Dokumente ({missingDocs.length})</div>
          <p className="fineprint">{missingDocs.map((d) => d.label).join(" · ")}</p>
        </div>
      )}

      <h2 className="group-title">Zusammenfassung</h2>
      <div className="card form-list">
        {(
          [
            ["chancen", "Stärkste Chancen"],
            ["risiken", "Größte Risiken"],
            ["naechsteSchritte", "Nächste Schritte"],
            ["sanierungsbedarf", "Geschätzter Sanierungsbedarf"],
            ["notizen", "Persönliche Notizen"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="crit">
            <div className="label" style={{ fontWeight: 600, fontSize: 15 }}>
              {label}
            </div>
            <textarea
              placeholder="…"
              value={insp.report[key] ?? ""}
              onChange={(e) => setReport(key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </>
  );
}

// ---------- Hilfsfunktion ----------
function groupBy<T>(items: T[], key: (t: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(item);
  }
  return map;
}
