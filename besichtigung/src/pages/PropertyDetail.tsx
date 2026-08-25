
import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { AppBar, Toggle, StatusPicker } from "../components/ui";
import { formatEUR } from "../lib/scoring";
import { useStore } from "../lib/store";
import { investUrteil, maxPreisFuerZiel, liquiditaet, eigentuemerlast, INVEST, preisProQm, marktwertPct, wunschrendite, statusList, statusChangePatch, tageOnline, kaufpreisfaktor, bruttoRendite, nettoRendite, wunschCashflow, newNoteEntry, formatNoteTs } from "../lib/property";
import { uploadDoc, docUrl, deleteDoc, fmtSize } from "../lib/docs";
import { PROPERTY_QUELLEN, PROPERTY_DOC_KATEGORIEN, type Property, type PropertyDoc } from "../lib/types";

function pct(v: number | null, digits = 1): string {
  if (v == null || isNaN(v)) return "–";
  return v.toLocaleString("de-DE", { minimumFractionDigits: digits, maximumFractionDigits: digits }) + " %";
}
function fmtDay(iso: string | undefined): string {
  if (!iso) return "–";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return d && m && y ? `${d}.${m}.${y}` : "–";
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
  // Ort/Adresse ändern → Geokoordinaten verwerfen, Karte geocodet neu
  const geoSet = (key: "ort" | "adresse") => (e: React.ChangeEvent<HTMLInputElement>) =>
    set({ [key]: e.target.value, lat: null, lng: null } as Partial<Property>);

  const sqm = preisProQm(p);
  const mw = marktwertPct(p);
  const faktor = kaufpreisfaktor(p.preis, p.miete);
  const brutto = bruttoRendite(p.preis, p.miete);
  const netto = nettoRendite(p.preis, p.miete);
  const wr = wunschrendite(p);
  const wFaktor = kaufpreisfaktor(p.wunschpreis, p.wunschmiete);
  const wNetto = nettoRendite(p.wunschpreis, p.wunschmiete);
  const wCf = wunschCashflow(p);
  const urteil = investUrteil(p);
  const maxPreis = maxPreisFuerZiel(p);
  const liq = liquiditaet(p);
  const fak = (v: number | null) =>
    v == null ? "–" : `${v.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}×`;

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
          <div className="frow">
            <label>Status</label>
            <StatusPicker value={statusList(p.status)} align="right" onChange={(next) => set(statusChangePatch(p, next))} />
          </div>
          <SelectRow label="Quelle" value={p.quelle} options={[...PROPERTY_QUELLEN]} onChange={(v) => set({ quelle: v })} />
          <TextRow label="Name des Inserats" value={p.titel ?? ""} placeholder="z. B. Helle 2-Zi-Wohnung mit Balkon" onChange={txtSet("titel")} />
          <TextRow label="Link zum Inserat" value={p.link} type="url" placeholder="https://…" onChange={txtSet("link")} />
          <TextRow label="Ort / Stadtteil" value={p.ort} onChange={geoSet("ort")} />
          <TextRow label="Adresse (für punktgenaue Karte)" value={p.adresse ?? ""} placeholder="Straße Nr., PLZ Ort" onChange={geoSet("adresse")} />
          <NumRow label="Zimmer" value={p.zimmer} step="0.5" onChange={numSet("zimmer")} />
          <NumRow label="Wohnfläche" value={p.wohnflaeche} unit="m²" onChange={numSet("wohnflaeche")} />
          <NumRow label="Baujahr" value={p.baujahr} onChange={numSet("baujahr")} />
          <TextRow label="Inseriert am" value={p.datum} type="date" onChange={txtSet("datum")} />
          <CalcRow label="Tage online" value={tageOnline(p) != null ? `${tageOnline(p)} Tage` : "–"} />
          <CalcRow label="Hinzugefügt am" value={fmtDay(p.created_at)} />
        </div>

        <h2 className="group-title">Ansprechpartner</h2>
        <div className="card form-list">
          <TextRow label="Name" value={p.ansprechpartner ?? ""} placeholder="Makler / Eigentümer" onChange={txtSet("ansprechpartner")} />
          <TextRow label="Telefon" value={p.telefon ?? ""} type="tel" placeholder="+49 …" onChange={txtSet("telefon")} />
          <TextRow label="E-Mail" value={p.email ?? ""} type="email" placeholder="name@…" onChange={txtSet("email")} />
          <TextRow label="Wiedervorlage" value={p.wiedervorlage ?? ""} type="date" onChange={txtSet("wiedervorlage")} />
        </div>
        <p className="fineprint" style={{ padding: "6px 4px 0" }}>
          Wiedervorlage = Datum zum Nachfassen. Wird beim Status „Kontaktiert" automatisch auf +7 Tage gesetzt und
          erscheint dann im Kalender sowie unter „⏰ Fällig" in der Immobilien-Liste.
        </p>

        <h2 className="group-title">Preis & Rendite</h2>
        <div className="card form-list">
          <NumRow label="Kaufpreis" value={p.preis} unit="€" step="1000" onChange={numSet("preis")} />
          <CalcRow label="Preis / m²" value={sqm != null ? formatEUR(sqm) : "–"} />
          <NumRow label="Kaltmiete" value={p.miete} unit="€/M" step="10" onChange={numSet("miete")} />
          <CalcRow label="Kaufpreisfaktor" value={fak(faktor)} />
          <CalcRow label="Bruttorendite" value={brutto != null ? pct(brutto) : "–"} />
          <CalcRow label="Nettorendite (−10 % NK)" value={netto != null ? pct(netto) : "–"} />
          <NumRow label="ROI (s)" value={p.roiSoll} unit="%" step="0.1" onChange={numSet("roiSoll")} />
          <NumRow label="Marktwert" value={p.marktwert} unit="€" step="1000" onChange={numSet("marktwert")} />
          <CalcRow
            label="vs. Markt"
            value={mw != null ? `${mw <= 0 ? "▼ " : "▲ "}${pct(mw * 100, 0)}` : "–"}
            color={mw == null ? undefined : mw <= 0 ? "var(--good)" : "var(--verybad)"}
          />
          <NumRow label="Cashflow" value={p.cashflow} unit="€/M" step="10" onChange={numSet("cashflow")} />
          <NumRow
            label="Nicht umlagefähig"
            value={p.nichtUmlagefaehig ?? null}
            unit="€/M"
            step="5"
            onChange={numSet("nichtUmlagefaehig" as keyof Property)}
          />
        </div>

        <h2 className="group-title">Kaufkriterium — Eigenkapitalrendite</h2>
        <div className="card form-list">
          <CalcRow
            label={`EK-Rendite ${INVEST.haltedauer} J. p. a.`}
            value={urteil.renditePa == null ? "–" : pct(urteil.renditePa * 100)}
            color={
              urteil.renditePa == null
                ? undefined
                : urteil.renditePa >= INVEST.zielRendite
                  ? "var(--good)"
                  : "var(--verybad)"
            }
          />
          <CalcRow
            label="ohne Wertsteigerung"
            value={urteil.renditeOhneWert == null ? "–" : pct(urteil.renditeOhneWert * 100)}
          />
          <CalcRow
            label="Liquidität Jahr 1"
            value={liq == null ? "–" : `${Math.round(liq)} €/M`}
            color={liq == null ? undefined : liq >= -INVEST.maxZuzahlung ? "var(--good)" : "var(--verybad)"}
          />
          <CalcRow
            label="Eigentümerlast"
            value={`${Math.round(eigentuemerlast(p))} €/M${p.nichtUmlagefaehig == null ? " (geschätzt)" : ""}`}
          />
          <CalcRow
            label={`Max. Preis für ${(INVEST.zielRendite * 100).toFixed(0)} %`}
            value={maxPreis == null ? "–" : maxPreis.toLocaleString("de-DE") + " €"}
          />
          <CalcRow
            label="Urteil"
            value={urteil.ok ? "kaufbar" : urteil.text}
            color={urteil.ok ? "var(--good)" : "var(--verybad)"}
          />
        </div>

        <h2 className="group-title">Best Case — was ist möglich?</h2>
        <div className="card form-list">
          <NumRow label="Wunschpreis" value={p.wunschpreis} unit="€" step="1000" onChange={numSet("wunschpreis")} />
          <NumRow label="Wunschmiete" value={p.wunschmiete} unit="€/M" step="10" onChange={numSet("wunschmiete")} />
          <CalcRow label="Wunsch-Faktor" value={fak(wFaktor)} />
          <CalcRow
            label="Wunsch-Bruttorendite"
            value={wr != null ? pct(wr) : "–"}
            color={wr == null ? undefined : brutto != null && wr > brutto ? "var(--good)" : undefined}
          />
          <CalcRow
            label="Wunsch-Nettorendite (−10 % NK)"
            value={wNetto != null ? pct(wNetto) : "–"}
            color={wNetto == null ? undefined : netto != null && wNetto > netto ? "var(--good)" : undefined}
          />
          <CalcRow
            label="Wunsch-Cashflow"
            value={wCf != null ? `${formatEUR(wCf)} /M` : "–"}
            color={wCf == null ? undefined : wCf >= 0 ? "var(--good)" : "var(--verybad)"}
          />
        </div>
        <p className="fineprint" style={{ padding: "8px 4px 0" }}>
          Wunsch-Bruttorendite = 12 × Wunschmiete ÷ Wunschpreis; Netto berücksichtigt ~10 % Kaufnebenkosten.
          Wunsch-Cashflow = Wunschmiete − Kreditrate (20 % EK, Nebenkosten selbst gezahlt, 4 % Zins + 2 % Tilgung). So siehst
          du, wie sich Rendite, Faktor und Cashflow verbessern, wenn du den Preis drückst oder die Miete erhöhst.
        </p>

        <HistorySection property={p} />

        <DocsSection property={p} />

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

function HistorySection({ property }: { property: Property }) {
  const { patchProperty } = useStore();
  const history = property.history ?? [];
  const [text, setText] = useState("");
  const add = () => {
    const t = text.trim();
    if (!t) return;
    patchProperty(property.id, { history: [...history, newNoteEntry(t)] });
    setText("");
  };
  const remove = (eid: string) =>
    patchProperty(property.id, { history: history.filter((e) => e.id !== eid) });
  const sorted = [...history].sort((a, b) => (a.ts < b.ts ? 1 : -1));
  return (
    <>
      <h2 className="group-title">Verlauf</h2>
      <div className="card">
        <div className="hist-add">
          <input
            type="text"
            value={text}
            placeholder="z. B. angerufen, Exposé erhalten, Besichtigung vereinbart …"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") add(); }}
          />
          <button className="btn" onClick={add} disabled={!text.trim()}>Eintrag</button>
        </div>
        {sorted.length === 0 ? (
          <p className="fineprint" style={{ padding: "8px 2px 0" }}>
            Noch kein Verlauf. Trag jeden Kontakt ein — z. B. „Mo kontaktiert", „Di angerufen", „Do Infos erhalten".
          </p>
        ) : (
          <ul className="hist-list">
            {sorted.map((e) => (
              <li key={e.id} className="hist-row">
                <span className="hist-ts">{formatNoteTs(e.ts)}</span>
                <span className="hist-text">{e.text}</span>
                <button className="doc-del" aria-label="Löschen" onClick={() => remove(e.id)}>🗑</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function DocsSection({ property }: { property: Property }) {
  const { patchProperty, session } = useStore();
  const docs = property.docs ?? [];
  const [kat, setKat] = useState<string>("Exposé");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const uid = session?.user.id;
    if (!uid) {
      setErr("Nicht angemeldet – zum Hochladen bitte online einloggen.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const added: PropertyDoc[] = [];
      for (const file of Array.from(files)) {
        const up = await uploadDoc(uid, property.id, file);
        added.push({
          id: crypto.randomUUID(),
          name: up.name,
          path: up.path,
          mime: up.mime,
          size: up.size,
          kategorie: kat,
          uploaded_at: new Date().toISOString(),
        });
      }
      patchProperty(property.id, { docs: [...docs, ...added] });
    } catch {
      setErr("Upload fehlgeschlagen. Bist du online und eingeloggt?");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const open = async (d: PropertyDoc) => {
    const url = await docUrl(d.path);
    if (url) window.open(url, "_blank", "noopener");
    else setErr("Konnte das Dokument nicht öffnen.");
  };

  const remove = async (d: PropertyDoc) => {
    if (!confirm(`„${d.name}" wirklich löschen?`)) return;
    try {
      await deleteDoc(d.path);
    } catch {
      /* Datei evtl. schon weg – trotzdem aus der Liste nehmen */
    }
    patchProperty(property.id, { docs: docs.filter((x) => x.id !== d.id) });
  };

  const setKatOf = (d: PropertyDoc, k: string) =>
    patchProperty(property.id, {
      docs: docs.map((x) => (x.id === d.id ? { ...x, kategorie: k } : x)),
    });

  return (
    <>
      <h2 className="group-title">Dokumente</h2>
      <div className="card">
        <div className="doc-upload">
          <select value={kat} onChange={(e) => setKat(e.target.value)} aria-label="Kategorie">
            {PROPERTY_DOC_KATEGORIEN.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,image/*,.doc,.docx,.xls,.xlsx,.csv,.txt"
            style={{ display: "none" }}
            onChange={(e) => void onFiles(e.target.files)}
          />
          <button className="btn" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? "Lädt hoch …" : "＋ Datei hochladen"}
          </button>
        </div>
        {err && <p className="fineprint" style={{ color: "var(--verybad)", paddingTop: 6 }}>{err}</p>}
        {docs.length === 0 ? (
          <p className="fineprint" style={{ padding: "8px 2px 0" }}>
            Noch keine Dokumente. Kategorie wählen und Datei (PDF, Bild …) hochladen.
          </p>
        ) : (
          <ul className="doc-list">
            {docs.map((d) => (
              <li key={d.id} className="doc-row">
                <button className="doc-name" onClick={() => void open(d)} title="Öffnen">
                  📄 {d.name}
                </button>
                <div className="doc-meta">
                  <select value={d.kategorie} onChange={(e) => setKatOf(d, e.target.value)}>
                    {PROPERTY_DOC_KATEGORIEN.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                  {d.size ? <span className="unit">{fmtSize(d.size)}</span> : null}
                  <button className="doc-del" aria-label="Löschen" onClick={() => void remove(d)}>🗑</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
