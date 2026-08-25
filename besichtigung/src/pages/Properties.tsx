import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppBar, StatusPicker, ContactCell } from "../components/ui";
import { formatEUR } from "../lib/scoring";
import { useStore } from "../lib/store";
import { investUrteil, INVEST, newProperty, preisProQm, marktwertPct, wunschrendite, statusList, statusChangePatch, wiedervorlageFaellig, kaufpreisfaktor, bruttoRendite, nettoRendite, wunschCashflow } from "../lib/property";
import { PROPERTY_STATUS, PROPERTY_QUELLEN, type Property } from "../lib/types";

type Filter = "alle" | "favoriten";
type Sort = "datum" | "status" | "preis" | "roi" | "markt";

const SORT_LABELS: Record<Sort, string> = {
  datum: "Inseriert am",
  status: "Status A–Z",
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

function StatusHeaderFilter({
  value,
  counts,
  onChange,
}: {
  value: string;
  counts: Record<string, number>;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <div className="hfilter" ref={ref}>
      <button type="button" className={`hfilter-btn ${value ? "on" : ""}`} onClick={() => setOpen((o) => !o)}>
        Status <span className="hfilter-caret">▾</span>
      </button>
      {open && (
        <div className="statuspick-menu hfilter-menu">
          <button className={`hfilter-opt ${value === "" ? "on" : ""}`} onClick={() => { onChange(""); setOpen(false); }}>
            Alle (ohne Verworfen)
          </button>
          {PROPERTY_STATUS.map((s) => (
            <button key={s} className={`hfilter-opt ${value === s ? "on" : ""}`} onClick={() => { onChange(s); setOpen(false); }}>
              {s}{counts[s] ? ` (${counts[s]})` : ""}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Properties() {
  const { properties, upsertProperty, patchProperty } = useStore();
  const nav = useNavigate();
  const [filter, setFilter] = useState<Filter>("alle");
  const [sort, setSort] = useState<Sort>("datum");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [quelleFilter, setQuelleFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [dueOnly, setDueOnly] = useState<boolean>(false);
  const dueCount = useMemo(() => properties.filter(wiedervorlageFaellig).length, [properties]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return properties
      .filter((p) => {
        if (filter === "favoriten" && !p.fav) return false;
        const st = statusList(p.status);
        // Verworfen ist standardmäßig ausgeblendet — nur sichtbar, wenn gezielt „Verworfen" gewählt ist
        if (statusFilter !== "Verworfen" && st.includes("Verworfen")) return false;
        if (statusFilter && !st.includes(statusFilter)) return false;
        if (quelleFilter && p.quelle !== quelleFilter) return false;
        if (dueOnly && !wiedervorlageFaellig(p)) return false;
        if (q) {
          const hay = [p.titel, p.ort, p.adresse, p.ansprechpartner, p.notizen]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        switch (sort) {
          case "status": {
            const sa = statusList(a.status);
            const sb = statusList(b.status);
            const c = (sa[0] ?? "").localeCompare(sb[0] ?? "", "de");
            if (c !== 0) return c;
            return sa.join(",").localeCompare(sb.join(","), "de");
          }
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
  }, [properties, filter, sort, statusFilter, quelleFilter, search, dueOnly]);

  const filtersActive = statusFilter !== "" || quelleFilter !== "" || search.trim() !== "" || filter === "favoriten" || dueOnly;
  const resetFilters = () => {
    setStatusFilter("");
    setQuelleFilter("");
    setSearch("");
    setFilter("alle");
    setDueOnly(false);
  };
  // Anzahl je Status (für die Auswahl)
  const statusCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of properties) for (const s of statusList(p.status)) m[s] = (m[s] ?? 0) + 1;
    return m;
  }, [properties]);

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
          <button className={`chip ${filter === "favoriten" ? "on" : ""}`} onClick={() => setFilter(filter === "favoriten" ? "alle" : "favoriten")}>
            ★ Favoriten ({properties.filter((p) => p.fav).length})
          </button>
          <button className={`chip ${dueOnly ? "on" : ""}`} onClick={() => setDueOnly((v) => !v)} style={dueCount ? { color: "#B45309" } : undefined}>
            ⏰ Fällig ({dueCount})
          </button>
          <Link to="/immobilien/karte" className="chip" style={{ textDecoration: "none" }}>
            🗺 Karte
          </Link>
          {filtersActive && (
            <button className="chip" onClick={resetFilters}>✕ Filter zurücksetzen</button>
          )}
        </div>

        <div className="filters">
          <input
            className="filtsearch"
            type="search"
            placeholder="Suche: Ort, Name, Ansprechpartner …"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="filtsel" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Status: alle (ohne Verworfen)</option>
            {PROPERTY_STATUS.map((s) => (
              <option key={s} value={s}>{s}{statusCounts[s] ? ` (${statusCounts[s]})` : ""}</option>
            ))}
          </select>
          <select className="filtsel" value={quelleFilter} onChange={(e) => setQuelleFilter(e.target.value)}>
            <option value="">Quelle: alle</option>
            {PROPERTY_QUELLEN.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="chips">
          {(Object.keys(SORT_LABELS) as Sort[]).map((s) => (
            <button key={s} className={`chip ${sort === s ? "on" : ""}`} onClick={() => setSort(s)}>
              ↕ {SORT_LABELS[s]}
            </button>
          ))}
          <span className="fineprint" style={{ alignSelf: "center", marginLeft: "auto" }}>
            {rows.length} von {properties.length}
          </span>
        </div>

        {/* ---------- Mobil: Karten ---------- */}
        <div className="prop-cards">
          {rows.map((p) => {
            const sqm = preisProQm(p);
            const mw = marktwertPct(p);
            const faktor = kaufpreisfaktor(p.preis, p.miete);
            const brutto = bruttoRendite(p.preis, p.miete);
            const st = statusList(p.status);
            const verworfen = st.includes("Verworfen");
            return (
              <Link key={p.id} to={`/immobilien/${p.id}`} className={`card card-tappable icard${verworfen ? " verworfen" : ""}`}>
                <div className="row1">
                  <button className="starbtn" aria-label="Favorit" onClick={(e) => toggleFav(e, p)}>
                    {p.fav ? "★" : "☆"}
                  </button>
                  <div className="titleblock">
                    <div className="t">{p.titel || p.ort || "Ohne Namen"}</div>
                    <div className="s">
                      {[p.ort, p.quelle, p.zimmer ? `${p.zimmer} Zi` : null, p.wohnflaeche ? `${p.wohnflaeche} m²` : null]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </div>
                  </div>
                  <StatusPicker value={st} align="right" onChange={(next) => patchProperty(p.id, statusChangePatch(p, next))} />
                </div>
                <div className="meta">
                  <span>
                    <b>{formatEUR(p.preis)}</b>
                  </span>
                  {sqm != null && <span>{formatEUR(sqm)} / m²</span>}
                  {faktor != null && <span>{faktor.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}× Faktor</span>}
                  {brutto != null && <span>{pct(brutto)} brutto</span>}
                  {p.roiSoll != null && <span>{pct(p.roiSoll)} ROI (s)</span>}
                  {mw != null && (
                    <span style={{ color: mw <= 0 ? "var(--good)" : "var(--verybad)" }}>
                      {mw <= 0 ? "▼" : "▲"} {pct(mw * 100, 0)} Markt
                    </span>
                  )}
                  {(() => {
                    const u = investUrteil(p);
                    if (u.grund === "veto")
                      return <span style={{ color: "var(--verybad)" }}>⛔ {u.text}</span>;
                    if (u.renditePa == null) return null;
                    return (
                      <span style={{ color: u.ok ? "var(--good)" : "var(--verybad)" }}>
                        {pct(u.renditePa * 100, 1)} EK
                      </span>
                    );
                  })()}
                  {(p.docs?.length ?? 0) > 0 && <span>📎 {p.docs!.length}</span>}
                  {wiedervorlageFaellig(p) && <span style={{ color: "#B45309" }}>⏰ fällig</span>}
                  {(p.ansprechpartner || p.telefon || p.email) && (
                    <ContactCell name={p.ansprechpartner} telefon={p.telefon} email={p.email} />
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
                <th><StatusHeaderFilter value={statusFilter} counts={statusCounts} onChange={setStatusFilter} /></th>
                <th>Quelle</th>
                <th>Ort</th>
                <th>Name</th>
                <th>Ansprechpartner</th>
                <th className="num">Zi</th>
                <th className="num">Wfl.</th>
                <th className="num">Bj</th>
                <th className="num">Preis</th>
                <th className="num">€/m²</th>
                <th className="num">Miete</th>
                <th className="num">Faktor</th>
                <th className="num">Brutto</th>
                <th className="num">Netto</th>
                <th className="num">ROI (s)</th>
                <th className="num">vs. Markt</th>
                <th className="num">Marktwert</th>
                <th className="num">Cashflow</th>
                <th className="num">EK-Rendite</th>
                <th className="num">Liquidität</th>
                <th className="num bc">Wunschpreis</th>
                <th className="num bc">Wunschmiete</th>
                <th className="num bc">W-Faktor</th>
                <th className="num bc">W-Brutto</th>
                <th className="num bc">W-Netto</th>
                <th className="num bc">W-Cashflow</th>
                <th>Inseriert am</th>
                <th>Hinzugefügt am</th>
                <th>Notizen</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const sqm = preisProQm(p);
                const mw = marktwertPct(p);
                const faktor = kaufpreisfaktor(p.preis, p.miete);
                const brutto = bruttoRendite(p.preis, p.miete);
                const netto = nettoRendite(p.preis, p.miete);
                const wFaktor = kaufpreisfaktor(p.wunschpreis, p.wunschmiete);
                const wBrutto = wunschrendite(p);
                const wNetto = nettoRendite(p.wunschpreis, p.wunschmiete);
                const wCf = wunschCashflow(p);
                const urteil = investUrteil(p);
                const st = statusList(p.status);
                const verworfen = st.includes("Verworfen");
                return (
                  <tr key={p.id} className={verworfen ? "verworfen" : ""} onClick={() => nav(`/immobilien/${p.id}`)}>
                    <td>
                      <button className="starbtn" aria-label="Favorit" onClick={(e) => toggleFav(e, p)}>
                        {p.fav ? "★" : "☆"}
                      </button>
                    </td>
                    <td><StatusPicker value={st} onChange={(next) => patchProperty(p.id, { status: next })} /></td>
                    <td>
                      {p.link ? (
                        <a href={p.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: "var(--primary)" }}>
                          {p.quelle || "Link"} ↗
                        </a>
                      ) : (
                        p.quelle || "—"
                      )}
                    </td>
                    <td>
                      {p.ort || "—"}
                      {(p.docs?.length ?? 0) > 0 && (
                        <span title={`${p.docs!.length} Dokument(e)`} style={{ marginLeft: 6, opacity: 0.6 }}>📎{p.docs!.length}</span>
                      )}
                      {wiedervorlageFaellig(p) && (
                        <span title={`Wiedervorlage fällig (${fmtDate(p.wiedervorlage)})`} style={{ marginLeft: 6, color: "#B45309" }}>⏰</span>
                      )}
                    </td>
                    <td className="pname" title={p.titel}>{p.titel || "—"}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <ContactCell name={p.ansprechpartner} telefon={p.telefon} email={p.email} />
                    </td>
                    <td className="num">{p.zimmer ?? "–"}</td>
                    <td className="num">{p.wohnflaeche != null ? `${p.wohnflaeche} m²` : "–"}</td>
                    <td className="num">{p.baujahr ?? "–"}</td>
                    <td className="num">{formatEUR(p.preis)}</td>
                    <td className="num">{sqm != null ? formatEUR(sqm) : "–"}</td>
                    <td className="num">{p.miete != null ? formatEUR(p.miete) : "–"}</td>
                    <td className="num">{faktor != null ? `${faktor.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}×` : "–"}</td>
                    <td className="num">{pct(brutto)}</td>
                    <td className="num">{pct(netto)}</td>
                    <td className="num">{pct(p.roiSoll)}</td>
                    <td className="num" style={{ color: mw == null ? undefined : mw <= 0 ? "var(--good)" : "var(--verybad)" }}>
                      {mw != null ? `${mw <= 0 ? "▼ " : "▲ "}${pct(mw * 100, 0)}` : "–"}
                    </td>
                    <td className="num">{formatEUR(p.marktwert)}</td>
                    <td className="num" style={{ color: p.cashflow == null ? undefined : p.cashflow >= 0 ? "var(--good)" : "var(--verybad)" }}>
                      {p.cashflow != null ? formatEUR(p.cashflow) : "–"}
                    </td>
                    <td
                      className="num"
                      title={urteil.grund === "veto" ? urteil.text : undefined}
                      style={{ color: urteil.renditePa == null ? undefined : urteil.ok ? "var(--good)" : "var(--verybad)" }}
                    >
                      {urteil.grund === "veto"
                        ? "⛔"
                        : urteil.renditePa != null
                          ? pct(urteil.renditePa * 100, 1)
                          : "–"}
                    </td>
                    <td
                      className="num"
                      style={{
                        color:
                          urteil.liquiditaetStart == null
                            ? undefined
                            : urteil.liquiditaetStart >= -INVEST.maxZuzahlung
                              ? "var(--good)"
                              : "var(--verybad)",
                      }}
                    >
                      {urteil.liquiditaetStart != null ? formatEUR(Math.round(urteil.liquiditaetStart)) : "–"}
                    </td>
                    <td className="num bc">{formatEUR(p.wunschpreis)}</td>
                    <td className="num bc">{p.wunschmiete != null ? formatEUR(p.wunschmiete) : "–"}</td>
                    <td className="num bc">{wFaktor != null ? `${wFaktor.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}×` : "–"}</td>
                    <td className="num bc" style={{ color: wBrutto != null && brutto != null && wBrutto > brutto ? "var(--good)" : undefined }}>
                      {pct(wBrutto)}
                    </td>
                    <td className="num bc" style={{ color: wNetto != null && netto != null && wNetto > netto ? "var(--good)" : undefined }}>
                      {pct(wNetto)}
                    </td>
                    <td className="num bc" style={{ color: wCf == null ? undefined : wCf >= 0 ? "var(--good)" : "var(--verybad)" }}>
                      {wCf != null ? formatEUR(wCf) : "–"}
                    </td>
                    <td>{fmtDate(p.datum)}</td>
                    <td>{fmtDate((p.created_at || "").slice(0, 10))}</td>
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
              : "Keine Objekte für diese Filter."}
          </div>
        )}
      </main>
    </>
  );
}
