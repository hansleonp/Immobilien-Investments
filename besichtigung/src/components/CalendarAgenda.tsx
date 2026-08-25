import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { statusList } from "../lib/property";
import type { Inspection, Property } from "../lib/types";

type Kind = "insp" | "wv";
interface Entry { date: string; time: string; label: string; kind: Kind; to: string }

const DOW = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function addDays(d: Date, n: number): Date { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function mondayOf(d: Date): Date { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }

export function CalendarAgenda({ inspections, properties }: { inspections: Inspection[]; properties: Property[] }) {
  const nav = useNavigate();
  const [mode, setMode] = useState<"monat" | "woche">("monat");
  const [cursor, setCursor] = useState<Date>(() => new Date());
  const todayISO = toISO(new Date());

  const byDate = useMemo(() => {
    const arr: Entry[] = [];
    for (const i of inspections) {
      const d = i.objekt.datum as string | undefined;
      if (d) arr.push({
        date: d,
        time: (i.objekt.uhrzeit as string) || "",
        label: i.title || (i.objekt.bezeichnung as string) || "Besichtigung",
        kind: "insp",
        to: `/besichtigung/${i.id}`,
      });
    }
    for (const p of properties) {
      const st = statusList(p.status);
      if (p.wiedervorlage && !st.includes("Gekauft") && !st.includes("Verworfen")) {
        arr.push({ date: p.wiedervorlage, time: "", label: `Wiedervorlage: ${p.titel || p.ort || "Objekt"}`, kind: "wv", to: `/immobilien/${p.id}` });
      }
    }
    const m = new Map<string, Entry[]>();
    for (const e of arr) { const g = m.get(e.date) ?? []; g.push(e); m.set(e.date, g); }
    for (const g of m.values()) g.sort((a, b) => (a.time || "99").localeCompare(b.time || "99"));
    return m;
  }, [inspections, properties]);

  const step = (dir: number) => {
    setCursor((c) => (mode === "monat" ? new Date(c.getFullYear(), c.getMonth() + dir, 1) : addDays(c, dir * 7)));
  };

  const title =
    mode === "monat"
      ? `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`
      : (() => {
          const mo = mondayOf(cursor);
          const su = addDays(mo, 6);
          return `${mo.getDate()}.${mo.getMonth() + 1}. – ${su.getDate()}.${su.getMonth() + 1}.${su.getFullYear()}`;
        })();

  // Tage der Ansicht
  const days: Date[] = [];
  if (mode === "monat") {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = mondayOf(first);
    for (let i = 0; i < 42; i++) days.push(addDays(start, i));
  } else {
    const mo = mondayOf(cursor);
    for (let i = 0; i < 7; i++) days.push(addDays(mo, i));
  }

  const Ev = ({ e }: { e: Entry }) => (
    <button className={`cal-ev ${e.kind}`} onClick={() => nav(e.to)} title={e.label}>
      {e.time ? <b>{e.time}</b> : null} {e.kind === "wv" ? "⏰ " : ""}{e.label}
    </button>
  );

  return (
    <div className="cal">
      <div className="cal-head">
        <div className="cal-nav">
          <button className="chip" onClick={() => step(-1)}>‹</button>
          <button className="chip" onClick={() => setCursor(new Date())}>Heute</button>
          <button className="chip" onClick={() => step(1)}>›</button>
        </div>
        <div className="cal-title">{title}</div>
        <div className="cal-nav">
          <button className={`chip ${mode === "woche" ? "on" : ""}`} onClick={() => setMode("woche")}>Woche</button>
          <button className={`chip ${mode === "monat" ? "on" : ""}`} onClick={() => setMode("monat")}>Monat</button>
        </div>
      </div>

      {mode === "monat" ? (
        <div className="cal-grid">
          {DOW.map((d) => <div key={d} className="cal-dow">{d}</div>)}
          {days.map((d) => {
            const iso = toISO(d);
            const evs = byDate.get(iso) ?? [];
            const inMonth = d.getMonth() === cursor.getMonth();
            return (
              <div key={iso} className={`cal-cell ${inMonth ? "" : "muted"} ${iso === todayISO ? "today" : ""}`}>
                <div className="cal-daynum">{d.getDate()}</div>
                {evs.slice(0, 3).map((e, i) => <Ev key={i} e={e} />)}
                {evs.length > 3 && <div className="cal-more">+{evs.length - 3}</div>}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="cal-week">
          {days.map((d) => {
            const iso = toISO(d);
            const evs = byDate.get(iso) ?? [];
            return (
              <div key={iso} className={`cal-wday ${iso === todayISO ? "today" : ""}`}>
                <div className="cal-wday-head">
                  {DOW[(d.getDay() + 6) % 7]} {d.getDate()}.{d.getMonth() + 1}.
                </div>
                {evs.length === 0 ? <div className="cal-empty">—</div> : evs.map((e, i) => <Ev key={i} e={e} />)}
              </div>
            );
          })}
        </div>
      )}

      <div className="cal-legend">
        <span><i className="dot insp" /> Besichtigung</span>
        <span><i className="dot wv" /> Wiedervorlage</span>
      </div>
    </div>
  );
}
