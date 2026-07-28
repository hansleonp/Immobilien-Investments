import { useState } from "react";
import { AppBar } from "../components/ui";
import { computeScore, formatEUR, grossYield, pricePerSqm } from "../lib/scoring";
import { useStore } from "../lib/store";
import { CATEGORY_LABELS, type Category } from "../lib/types";

const COMPARE_CATS: Category[] = ["lage", "gebaeude", "wohnung", "technik", "weg", "mieter", "wirtschaftlichkeit", "zukunft"];

export default function Compare() {
  const { inspections, settings } = useStore();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 4 ? prev : [...prev, id]
    );

  const rows = inspections
    .filter((i) => selected.includes(i.id))
    .map((i) => ({ insp: i, score: computeScore(i, settings) }));

  const bestOf = (vals: (number | null)[], invert = false): number | null => {
    const nums = vals.filter((v): v is number => v != null);
    if (nums.length < 2) return null;
    return invert ? Math.min(...nums) : Math.max(...nums);
  };

  const totals = rows.map((r) => r.score.total);
  const bestTotal = bestOf(totals);

  return (
    <>
      <AppBar title="Vergleich" />
      <main className="content">
        <p className="fineprint" style={{ padding: "0 4px 10px" }}>
          Wähle 2–4 Objekte für den Vergleich.
        </p>
        <div className="chips" style={{ flexWrap: "wrap" }}>
          {inspections.map((i) => (
            <button
              key={i.id}
              className={`chip ${selected.includes(i.id) ? "on" : ""}`}
              onClick={() => toggle(i.id)}
            >
              {i.title || (i.objekt.bezeichnung as string) || "Ohne Titel"}
            </button>
          ))}
        </div>

        {rows.length >= 2 ? (
          <div className="card comparewrap" style={{ padding: "4px 0" }}>
            <table className="comparetable">
              <thead>
                <tr>
                  <th>Kriterium</th>
                  {rows.map((r) => (
                    <th key={r.insp.id}>{r.insp.title || (r.insp.objekt.bezeichnung as string) || "—"}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="head">Gesamt-Score</td>
                  {rows.map((r) => (
                    <td key={r.insp.id} className={r.score.total != null && r.score.total === bestTotal ? "best" : ""}>
                      {r.score.total ?? "–"}
                    </td>
                  ))}
                </tr>
                {COMPARE_CATS.map((cat) => {
                  const vals = rows.map((r) => r.score.perCategory[cat] ?? null);
                  const best = bestOf(vals);
                  return (
                    <tr key={cat}>
                      <td className="head">{CATEGORY_LABELS[cat]}</td>
                      {rows.map((r, i) => (
                        <td key={r.insp.id} className={vals[i] != null && vals[i] === best ? "best" : ""}>
                          {vals[i] ?? "–"}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                <tr>
                  <td className="head">Red Flags</td>
                  {rows.map((r) => {
                    const n = r.score.redFlags.length;
                    return (
                      <td key={r.insp.id} style={{ color: n > 0 ? "var(--verybad)" : "var(--good)", fontWeight: 600 }}>
                        {n}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="head">Kaufpreis</td>
                  {(() => {
                    const vals = rows.map((r) => Number(r.insp.objekt.kaufpreis) || null);
                    const best = bestOf(vals, true);
                    return rows.map((r, i) => (
                      <td key={r.insp.id} className={vals[i] != null && vals[i] === best ? "best" : ""}>
                        {formatEUR(vals[i])}
                      </td>
                    ));
                  })()}
                </tr>
                <tr>
                  <td className="head">€ / m²</td>
                  {(() => {
                    const vals = rows.map((r) => pricePerSqm(r.insp));
                    const best = bestOf(vals, true);
                    return rows.map((r, i) => (
                      <td key={r.insp.id} className={vals[i] != null && vals[i] === best ? "best" : ""}>
                        {formatEUR(vals[i])}
                      </td>
                    ));
                  })()}
                </tr>
                <tr>
                  <td className="head">Bruttorendite</td>
                  {(() => {
                    const vals = rows.map((r) => grossYield(r.insp));
                    const best = bestOf(vals);
                    return rows.map((r, i) => (
                      <td key={r.insp.id} className={vals[i] != null && vals[i] === best ? "best" : ""}>
                        {vals[i] != null ? `${vals[i]!.toFixed(1)} %` : "–"}
                      </td>
                    ));
                  })()}
                </tr>
                <tr>
                  <td className="head">Offene Fragen</td>
                  {rows.map((r) => (
                    <td key={r.insp.id}>{r.score.openQuestions}</td>
                  ))}
                </tr>
                <tr>
                  <td className="head">Empfehlung</td>
                  {rows.map((r) => (
                    <td key={r.insp.id}>
                      <span className={`badge ${r.score.recommendation ?? "neutral"}`}>
                        {r.score.recommendationLabel}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            <div className="big">⚖️</div>
            Mindestens zwei Objekte auswählen.
          </div>
        )}
      </main>
    </>
  );
}
