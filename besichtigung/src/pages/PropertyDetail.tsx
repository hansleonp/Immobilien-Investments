
import { useParams } from "react-router-dom";
import { AppBar, Toggle } from "../components/ui";
import { formatEUR } from "../lib/scoring";
import { useStore } from "../lib/store";
import { preisProQm, marktwertPct, wunschrendite } from "../lib/property";
import { PROPERTY_QUELLEN, type Property } from "../lib/types";

function pct(v: number | null, digits = 1): string {
  if (v == null || isNaN(v)) return "–";
  return v.toLocaleString("de-DE", { minimumFractionDigits: digits, maximumFractionDigits: digits }) + " %";
}

export default function PropertyDetail() {
  const { id } = useParams();
  const { properties, patchProperty, removeProperty } = useStore();
  const p = properties.find((x) => x.id === id);

  if (!p) {
    return (
      <>
        <AppBar title="Immobilie" back="/immobilien" />
        <main className="content">
          <div className="empty">Nicht gefunden.</div>
        </main>
      </>
    );
  }

  const set = (patch: Partial<Property>) => patchProperty(p.id, patch);
  const numSet = (key: keyof Property) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    set({ [key]: v === "" ? null : Number(v) } as Partial<Property>);
  };
  const txtSet = (key: keyof Property) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    set({ [key]: e.target.value } as Partial<Property>);

  const sqm = preisProQm(p);
  const mw = marktwertPct(p);
  const wr = wunschrendite(p);

  return (
    <>
      <AppBar
        title={p.ort || "Immobilie"}
        back="/immobilien"
        action={
          <button
            className="starbtn"
            aria-label="Favorit"
            onClick={() => set({ fav: !p.fav })}
          >
            {p.fav ? "★" : "☆"}
          </button>
        }
      />
      <main className="content">
        {p.link && (
          <a href={p.link} target="_blank" rel="noopener noreferrer" className="btn" style={{ display: "block", textAlign: "center", marginBottom: 12 }}>
            Inserat öffnen ↗
          </a>
        )}

        <h2 className="group-title">Objekt</h2>
        <div className="card form-list">
          <SelectRow label="Quelle" value={p.quelle} options={[...PROPERTY_QUELLEN]} onChange={(v) => set({ quelle: v })} />
          <TextRow label="Link zum Inserat" value={p.link} type="url" placeholder="https://…" onChange={txtSet("link")} />
          <TextRow label="Ort" value={p.ort} onChange={txtSet("ort")} />
          <NumRow label="Zimmer" value={p.zimmer} step="0.5" onChange={numSet("zimmer")} />
          <NumRow label="Wohnfläche" value={p.wohnflaeche} unit="m²" onChange={numSet("wohnflaeche")} />
          <NumRow label="Baujahr" value={p.baujahr} onChange={numSet("baujahr")} />
          <TextRow label="Datum" value={p.datum} type="date" onChange={txtSet("datum")} />
        </div>

        <h2 className="group-title">Preis & Rendite</h2>
        <div className="card form-list">
          <NumRow label="Kaufpreis" value={p.preis} unit="€" step="1000" onChange={numSet("preis")} />
          <CalcRow label="Preis / m²" value={sqm != null ? formatEUR(sqm) : "–"} />
          <NumRow label="Kaltmiete" value={p.miete} unit="€/M" step="10" onChange={numSet("miete")} />
          <NumRow label="ROI (soll)" value={p.roiSoll} unit="%" step="0.1" onChange={numSet("roiSoll")} />
          <NumRow label="Marktwert" value={p.marktwert} unit="€" step="1000" onChange={numSet("marktwert")} />
          <CalcRow
            label="vs. Markt"
            value={mw != null ? `${mw <= 0 ? "▼ " : "▲ "}${pct(mw * 100, 0)}` : "–"}
            color={mw == null ? undefined : mw <= 0 ? "var(--good)" : "var(--verybad)"}
          />
          <NumRow label="Cashflow" value={p.cashflow} unit="€/M" step="10" onChange={numSet("cashflow")} />
        </div>

        <h2 className="group-title">Best Case — was ist möglich?</h2>
        <div className="card form-list">
          <NumRow label="Wunschpreis" value={p.wunschpreis} unit="€" step="1000" onChange={numSet("wunschpreis")} />
          <NumRow label="Wunschmiete" value={p.wunschmiete} unit="€/M" step="10" onChange={numSet("wunschmiete")} />
          <CalcRow
            label="Wunschrendite"
            value={wr != null ? pct(wr) : "–"}
            color={wr == null ? undefined : p.roiSoll != null && wr > p.roiSoll ? "var(--good)" : undefined}
          />
        </div>
        <p className="fineprint" style={{ padding: "8px 4px 0" }}>
          Wunschrendite = 12 × Wunschmiete ÷ Wunschpreis. So siehst du, wie sich die Rendite verbessert, wenn du den
          Preis drückst oder die Miete erhöhst.
        </p>

        <h2 className="group-title">Sonstiges</h2>
        <div className="card form-list">
          <div className="frow">
            <label>Neu / ungeprüft</label>
            <Toggle on={p.neu} onChange={(v) => set({ neu: v })} />
          </div>
          <div className="frow" style={{ alignItems: "flex-start" }}>
            <label>Notizen</label>
            <textarea
              value={p.notizen}
              placeholder="z. B. alte Heizung, Nähe Bahnhof, Makler zäh …"
              onChange={txtSet("notizen")}
            />
          </div>
        </div>

        <div className="spacer" />
        <button
          className="btn danger"
          style={{ width: "100%" }}
          onClick={() => {
            if (confirm("Dieses Objekt wirklich löschen?")) {
              removeProperty(p.id);
              history.back();
            }
          }}
        >
          Objekt löschen
        </button>
      </main>
    </>
  );
}

function TextRow({
  label, value, onChange, type = "text", placeholder,
}: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; placeholder?: string;
}) {
  return (
    <div className="frow">
      <label>{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={onChange} />
    </div>
  );
}

function NumRow({
  label, value, onChange, unit, step,
}: {
  label: string; value: number | null; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; unit?: string; step?: string;
}) {
  return (
    <div className="frow">
      <label>{label}</label>
      <input type="number" inputMode="decimal" step={step} value={value ?? ""} onChange={onChange} />
      {unit && <span className="unit">{unit}</span>}
    </div>
  );
}

function SelectRow({
  label, value, options, onChange,
}: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div className="frow">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">—</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function CalcRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="frow">
      <label>{label}</label>
      <span style={{ flex: 1.2, textAlign: "right", fontSize: 17, fontWeight: 600, color: color ?? "var(--ink-muted-48)" }}>
        {value}
      </span>
    </div>
  );
}
