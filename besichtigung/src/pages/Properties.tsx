import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppBar } from "../components/ui";
import { formatEUR } from "../lib/scoring";
import { useStore } from "../lib/store";
import { newProperty, preisProQm, marktwertPct } from "../lib/property";
import type { Property } from "../lib/types";

type Filter = "alle" | "favoriten";
type Sort = "datum" | "preis" | "roi" | "markt";

const SORT_LABELS: Record<Sort, string> = {
  datum: "Datum",
  preis: "Preis",
  roi: "ROI",
  markt: "vs. Markt",
};

function pct(v: number | null, digits = 1): string {
  if (v == null || isNaN(v)) return "–";
  return v.toLocaleString("de-DE", { minimumFractionDigits: digits, maximumFractionDigits: digits }) + " %";
}
function fmtDate(d: string): string {
  if (!d) return "–";
  const [y, m, day] = d.split("-");
  return day && m && y ? `${day}.${m}.${y}` : d;
}

export default function Properties() {
  const { properties, upsertProperty, patchProperty } = useStore();
  const nav = useNavigate();
  const [filter, setFilter] = useState<Filter>("alle");
  const [sort, setSort] = useState<Sort>("datum");

  const rows = useMemo(() => {
    return properties
      .filter((p) => filter === "alle" || p.fav)
      .sort((a, b) => {
        switch (sort) {
          case "preis":
            return (a.preis ?? Infinity) - (b.preis ?? Infinity);
          case "roi":
            return (b.roiSoll ?? -1) - (a.roiSoll ?? -1);
          case "markt":
            return (marktwertPct(a) ?? 1) - (marktwertPct(b) ?? 1);
          default:
            return String(b.datum ?? "").localeCompare(String(a.datum ?? ""));
        }
      });
  }, [properties, filter, sort]);

  const createNew = () => {
    const p = newProperty();
    upsertProperty(p);
    nav(`/immobilien/${p.id}`);
  };

  const toggleFav = (e: React.MouseEvent, p: Property) => {
    e.preventDefault();
    e.stopPropagation();
    patchProperty(p.id, { fav: !p.fav });
  };

  return (
    <>
      <AppBar
        title="Immobilien"
        action={
          <button className="action" onClick={createNew} aria-label="Neu">
            ＋
          </button>
        }
      />
      <main className="content wide">
        <div className="chips">
          <button className={`chip ${filter === "alle" ? "on" : ""}`} onClick={() => setFilter("alle")}>
            Alle ({properties.length})
          </button>
          <button className={`chip ${filter === "favoriten" ? "on" : ""}`} onClick={() => setFilter("favoriten")}>
            ★ Favoriten ({properties.filter((p) => p.fav).length})
          </button>
        </div>
        <div className="chips">
          {(Object.keys(SORT_LABELS) as Sort[]).map((s) => (
            <button key={s} className={`chip ${sort === s ? "on" : ""}`} onClick={() => setSort(s)}>
              ↕ {SORT_LABELS[s]}
            </button>
          ))}
        </div>

        {/* ---------- Mobil: Karten ---------- */}
        <div className="prop-cards">
          {rows.map((p) => {
            const sqm = preisProQm(p);
            const mw = marktwertPct(p);
            return (
              <Link key={p.id} to={`/immobilien/${p.id}`} className="card card-tappable icard">
                <div className="row1">
                  <button className="starbtn" aria-label="Favorit" onClick={(e) => toggleFav(e, p)}>
                    {p.fav ? "★" : "☆"}
                  </button>
                  <div className="titleblock">
                    <div className="t">{p.ort || "Ohne Ort"}</div>
                    <div className="s">
                      {[p.quelle, p.zimmer ? `${p.zimmer} Zi` : null, p.wohnflaeche ? `${p.wohnflaeche} m²` : null]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </div>
                  </div>
                  {p.roiSoll != null && <span className="badge blue">{pct(p.roiSoll)}</span>}
                </div>
                <div className="meta">
                  <span>
                    <b>{formatEUR(p.preis)}</b>
                  </span>
                  {sqm != null && <span>{formatEUR(sqm)} / m²</span>}
                  {mw != null && (
                    <span style={{ color: mw <= 0 ? "var(--good)" : "var(--verybad)" }}>
                      {mw <= 0 ? "▼" : "▲"} {pct(mw * 100, 0)} Markt
                    </span>
                  )}
                  {p.cashflow != null && (
                    <span style={{ color: p.cashflow >= 0 ? "var(--good)" : "var(--verybad)" }}>
                      {formatEUR(p.cashflow)} CF
                    </span>
                  )}
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: "var(--primary)" }}>
                      Inserat ↗
                    </a>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* ---------- Desktop: Tabelle ---------- */}
        <div className="prop-table-wrap">
          <table className="prop-table">
            <thead>
              <tr>
                <th></th>
                <th>Quelle</th>
                <th>Ort</th>
                <th className="num">Zi</th>
                <th className="num">Wfl.</th>
                <th className="num">Bj</th>
                <th className="num">Preis</th>
                <th className="num">€/m²</th>
                <th className="num">ROI</th>
                <th className="num">vs. Markt</th>
                <th className="num">Marktwert</th>
                <th className="num">Cashflow</th>
                <th>Datum</th>
                <th>Notizen</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const sqm = preisProQm(p);
                const mw = marktwertPct(p);
                return (
                  <tr key={p.id} onClick={() => nav(`/immobilien/${p.id}`)}>
                    <td>
                      <button className="starbtn" aria-label="Favorit" onClick={(e) => toggleFav(e, p)}>
                        {p.fav ? "★" : "☆"}
                      </button>
                    </td>
                    <td>
                      {p.link ? (
                        <a href={p.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: "var(--primary)" }}>
                          {p.quelle || "Link"} ↗
                        </a>
                      ) : (
                        p.quelle || "—"
                      )}
                    </td>
                    <td>{p.ort || "—"}</td>
                    <td className="num">{p.zimmer ?? "–"}</td>
                    <td className="num">{p.wohnflaeche != null ? `${p.wohnflaeche} m²` : "–"}</td>
                    <td className="num">{p.baujahr ?? "–"}</td>
                    <td className="num">{formatEUR(p.preis)}</td>
                    <td className="num">{sqm != null ? formatEUR(sqm) : "–"}</td>
                    <td className="num">{pct(p.roiSoll)}</td>
                    <td className="num" style={{ color: mw == null ? undefined : mw <= 0 ? "var(--good)" : "var(--verybad)" }}>
                      {mw != null ? `${mw <= 0 ? "▼ " : "▲ "}${pct(mw * 100, 0)}` : "–"}
                    </td>
                    <td className="num">{formatEUR(p.marktwert)}</td>
                    <td className="num" style={{ color: p.cashflow == null ? undefined : p.cashflow >= 0 ? "var(--good)" : "var(--verybad)" }}>
                      {p.cashflow != null ? formatEUR(p.cashflow) : "–"}
                    </td>
                    <td>{fmtDate(p.datum)}</td>
                    <td className="note" title={p.notizen}>{p.notizen || ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="empty">
            <div className="big">🏠</div>
            {properties.length === 0
              ? "Noch keine Immobilien. Tippe oben auf ＋, um dein erstes Objekt einzutragen."
              : "Keine Favoriten in dieser Ansicht."}
          </div>
        )}
      </main>
    </>
  );
}
