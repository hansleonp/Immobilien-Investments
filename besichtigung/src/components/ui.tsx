import { NavLink, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useStore } from "../lib/store";

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
    to: "/",
    label: "Übersicht",
    icon: (
      <svg viewBox="0 0 26 26" fill="none">
        <path d="M4 12 13 4l9 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 10.5V21h13V10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
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
    to: "/vergleich",
    label: "Vergleich",
    icon: (
      <svg viewBox="0 0 26 26" fill="none">
        <path d="M5 21V11M13 21V5M21 21v-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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
