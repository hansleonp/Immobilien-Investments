import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useStore } from "../lib/store";
import { statusStyle } from "../lib/property";
import { PROPERTY_STATUS } from "../lib/types";

// ---------- Status-Auswahl (Mehrfach, inline) ----------
export function StatusPicker({
  value,
  onChange,
  align = "left",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  align?: "left" | "right";
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

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const toggle = (s: string) => {
    const has = value.includes(s);
    let next = has ? value.filter((x) => x !== s) : [...value, s];
    if (next.length === 0) next = ["Neu"]; // nie ganz leer
    onChange(next);
  };

  return (
    <div className="statuspick" ref={ref} onClick={stop}>
      <button
        type="button"
        className="statuspick-btn"
        onClick={(e) => {
          stop(e);
          setOpen((o) => !o);
        }}
      >
        <span className="statuspick-badges">
          {(value.length ? value : ["Neu"]).map((s) => {
            const st = statusStyle(s);
            return (
              <span key={s} className="badge" style={{ background: st.background, color: st.color }}>
                {s}
              </span>
            );
          })}
        </span>
        <span className="statuspick-caret">▾</span>
      </button>
      {open && (
        <div className={`statuspick-menu ${align === "right" ? "right" : ""}`}>
          {PROPERTY_STATUS.map((s) => {
            const st = statusStyle(s);
            const checked = value.includes(s);
            return (
              <label key={s} className={`statuspick-opt ${checked ? "on" : ""}`} onClick={stop}>
                <input type="checkbox" checked={checked} onChange={() => toggle(s)} />
                <span className="badge" style={{ background: st.background, color: st.color }}>
                  {s}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Ansprechpartner-Zelle (Kontaktinfos im Popover) ----------
export function ContactCell({
  name,
  telefon,
  email,
  align = "left",
}: {
  name?: string;
  telefon?: string;
  email?: string;
  align?: "left" | "right";
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

  const nm = (name || "").trim();
  const tel = (telefon || "").trim();
  const mail = (email || "").trim();
  if (!nm && !tel && !mail) return <span className="ink-muted">—</span>;

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  return (
    <div className="statuspick" ref={ref} onClick={stop}>
      <button
        type="button"
        className="contact-btn"
        onClick={(e) => {
          stop(e);
          setOpen((o) => !o);
        }}
      >
        <span>👤 {nm || "Kontakt"}</span>
        {(tel || mail) && <span className="statuspick-caret">▾</span>}
      </button>
      {open && (
        <div className={`statuspick-menu ${align === "right" ? "right" : ""}`} style={{ minWidth: 210 }}>
          {nm && <div style={{ fontWeight: 600, padding: "4px 8px" }}>{nm}</div>}
          {tel ? (
            <a className="contact-link" href={`tel:${tel.replace(/\s+/g, "")}`} onClick={(e) => e.stopPropagation()}>
              📞 {tel}
            </a>
          ) : null}
          {mail ? (
            <a className="contact-link" href={`mailto:${mail}`} onClick={(e) => e.stopPropagation()}>
              ✉️ {mail}
            </a>
          ) : null}
          {!tel && !mail && <div className="fineprint" style={{ padding: "4px 8px" }}>Keine Kontaktdaten hinterlegt.</div>}
        </div>
      )}
    </div>
  );
}

// ---------- Score-Ring ----------
export function ScoreRing({ value, size = 52 }: { value: number | null; size?: number }) {
  const stroke = size >= 60 ? 5 : 4;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = value == null ? 0 : Math.max(0, Math.min(100, value));
  const color =
    value == null ? "var(--hairline)" : value >= 75 ? "var(--good)" : value >= 55 ? "var(--ok)" : "var(--verybad)";
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--divider-soft)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * circ} ${circ}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="val" style={{ fontSize: size / 3 }}>
        {value == null ? "–" : value}
      </div>
    </div>
  );
}

// ---------- Empfehlung-Badge ----------
export function RecommendationBadge({
  rec,
  label,
}: {
  rec: "gruen" | "gelb" | "rot" | null;
  label?: string;
}) {
  if (!rec) return <span className="badge neutral">Offen</span>;
  const txt = label ?? (rec === "gruen" ? "Weiterverfolgen" : rec === "gelb" ? "Klären" : "Verwerfen");
  return <span className={`badge ${rec}`}>{txt}</span>;
}

// ---------- AppBar ----------
export function AppBar({
  title,
  back,
  action,
}: {
  title: string;
  back?: string | true;
  action?: ReactNode;
}) {
  const nav = useNavigate();
  const { syncState } = useStore();
  return (
    <header className="appbar">
      {back && (
        <button className="back" onClick={() => (back === true ? nav(-1) : nav(back))} aria-label="Zurück">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 3.5 6 10l6.5 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Zurück
        </button>
      )}
      <div className="title">{title}</div>
      <span className={`syncdot ${syncState}`} title={`Sync: ${syncState}`} />
      {action}
    </header>
  );
}

// ---------- Tab-Bar ----------
const tabs = [
  {
    to: "/besichtigungen",
    label: "Besichtigungen",
    icon: (
      <svg viewBox="0 0 26 26" fill="none">
        <rect x="4" y="5" width="18" height="17" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4 10h18M9 3v4M17 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="m9 15.5 2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: "/immobilien",
    label: "Immobilien",
    icon: (
      <svg viewBox="0 0 26 26" fill="none">
        <path d="M4 11 11 5l7 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 9.5V19h10V9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="18.6" cy="18.6" r="3.2" stroke="currentColor" strokeWidth="1.8" />
        <path d="m21 21 1.6 1.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: "/einstellungen",
    label: "Einstellungen",
    icon: (
      <svg viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M13 3.5v3M13 19.5v3M3.5 13h3M19.5 13h3M6.3 6.3l2.1 2.1M17.6 17.6l2.1 2.1M6.3 19.7l2.1-2.1M17.6 8.4l2.1-2.1"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function TabBar() {
  return (
    <nav className="tabbar">
      {tabs.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.to === "/"} className={({ isActive }) => (isActive ? "active" : "")}>
          {t.icon}
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}

// ---------- iOS-Toggle ----------
export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      className={`toggle ${on ? "on" : ""}`}
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
    />
  );
}
