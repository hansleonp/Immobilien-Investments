import { useState } from "react";
import { AppBar, Toggle } from "../components/ui";
import { DEFAULT_CRITERIA, SECTION_META } from "../lib/catalog";
import { useStore } from "../lib/store";
import { notificationsEnabled, enableNotifications, disableNotifications } from "../lib/reminders";
import {
  CATEGORY_LABELS,
  CATEGORY_WEIGHTS,
  type Category,
  type Criterion,
  type SectionId,
} from "../lib/types";

// Sektionen, in denen Kriterien verwaltet werden können
const EDITABLE_SECTIONS: SectionId[] = ["lage", "gebaeude", "wohnung", "schimmel", "technik", "weg", "mieter", "bericht"];

// Standard-Kategorie je Sektion für neue Kriterien
const DEFAULT_CAT: Record<string, Category> = {
  lage: "lage",
  gebaeude: "gebaeude",
  wohnung: "wohnung",
  schimmel: "wohnung",
  technik: "technik",
  weg: "weg",
  mieter: "mieter",
  bericht: "wirtschaftlichkeit",
};

export default function Settings() {
  const { settings, saveSettings, session, signOut, syncState, syncNow, online } = useStore();
  const [openSection, setOpenSection] = useState<SectionId | null>(null);
  const [notify, setNotify] = useState(() => notificationsEnabled());

  const onToggleNotify = async (v: boolean) => {
    if (v) {
      const ok = await enableNotifications();
      setNotify(ok);
      if (!ok) alert("Benachrichtigungen wurden vom Browser blockiert. Bitte in den Browser-/Systemeinstellungen für diese Seite erlauben.");
    } else {
      disableNotifications();
      setNotify(false);
    }
  };

  const rename = (id: string, label: string) => {
    const renamed = { ...settings.renamed };
    const original = DEFAULT_CRITERIA.find((c) => c.id === id)?.label;
    if (!label.trim() || label === original) delete renamed[id];
    else renamed[id] = label;
    // Eigene Kriterien direkt im Objekt umbenennen
    const added = settings.added.map((c) => (c.id === id ? { ...c, label: label || c.label } : c));
    saveSettings({ ...settings, renamed, added });
  };

  const toggleHidden = (id: string) => {
    const hidden = settings.hidden.includes(id)
      ? settings.hidden.filter((h) => h !== id)
      : [...settings.hidden, id];
    saveSettings({ ...settings, hidden });
  };

  const addCriterion = (section: SectionId, label: string, scale: Criterion["scale"], category: Category) => {
    if (!label.trim()) return;
    const crit: Criterion = {
      id: `custom_${crypto.randomUUID().slice(0, 8)}`,
      section,
      label: label.trim(),
      scale,
      category,
      custom: true,
      ...(scale === "bool" ? { boolGood: "ja" as const } : {}),
    };
    saveSettings({ ...settings, added: [...settings.added, crit] });
  };

  const removeCustom = (id: string) => {
    saveSettings({ ...settings, added: settings.added.filter((c) => c.id !== id) });
  };

  return (
    <>
      <AppBar title="Einstellungen" />
      <main className="content">
        {/* Konto & Sync */}
        <h2 className="section-title">Konto & Sync</h2>
        <div className="card form-list">
          <div className="frow">
            <label>Angemeldet als</label>
            <b style={{ fontSize: 15 }}>{session?.user.email}</b>
          </div>
          <div className="frow">
            <label>Verbindung</label>
            <span className="rowflex">
              <span className={`syncdot ${syncState}`} />
              {online ? (syncState === "error" ? "Sync-Fehler" : syncState === "syncing" ? "Synchronisiert…" : "Online") : "Offline — Änderungen werden lokal gespeichert"}
            </span>
          </div>
          <div className="frow">
            <label>Jetzt synchronisieren</label>
            <button className="btn pearl" onClick={syncNow}>
              Sync
            </button>
          </div>
          <div className="frow">
            <label>Abmelden</label>
            <button className="btn pearl" onClick={() => void signOut()}>
              Logout
            </button>
          </div>
        </div>

        {/* Benachrichtigungen */}
        <h2 className="section-title">Benachrichtigungen</h2>
        <div className="card form-list">
          <div className="frow">
            <label>Erinnerungen an Wiedervorlagen</label>
            <Toggle on={notify} onChange={(v) => void onToggleNotify(v)} />
          </div>
          <p className="fineprint" style={{ padding: "4px 4px 0" }}>
            Meldet fällige Wiedervorlagen (kontaktiert, aber keine Rückmeldung), solange die App geöffnet ist oder im
            Hintergrund läuft. Für Meldungen bei komplett geschlossener App wäre ein Server-Push nötig — auf Wunsch einrichtbar.
          </p>
        </div>

        {/* Score-Gewichte (informativ) */}
        <h2 className="section-title">Score-Gewichtung</h2>
        <div className="card form-list">
          {(Object.keys(CATEGORY_WEIGHTS) as Category[]).map((cat) => (
            <div key={cat} className="frow">
              <label>{CATEGORY_LABELS[cat]}</label>
              <b>{CATEGORY_WEIGHTS[cat]} %</b>
            </div>
          ))}
        </div>

        {/* Kriterien verwalten */}
        <h2 className="section-title">Kriterien anpassen</h2>
        <p className="fineprint" style={{ padding: "0 4px 10px" }}>
          Pro Bereich kannst du Kriterien umbenennen, ausblenden oder eigene hinzufügen.
        </p>
        <div className="card form-list">
          {EDITABLE_SECTIONS.map((s) => (
            <button
              key={s}
              className="sectionrow card-tappable"
              style={{ width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer" }}
              onClick={() => setOpenSection(openSection === s ? null : s)}
            >
              <span className="ico">{SECTION_META[s].icon}</span>
              <span className="tx">
                <div className="t">{s === "bericht" ? "Wirtschaftlichkeit" : SECTION_META[s].title}</div>
                <div className="s">
                  {DEFAULT_CRITERIA.filter((c) => c.section === s).length +
                    settings.added.filter((c) => c.section === s).length}{" "}
                  Kriterien
                </div>
              </span>
              <span className="chev">{openSection === s ? "▾" : "›"}</span>
            </button>
          ))}
        </div>

        {openSection && (
          <SectionEditor
            section={openSection}
            settings={settings}
            onRename={rename}
            onToggleHidden={toggleHidden}
            onAdd={addCriterion}
            onRemoveCustom={removeCustom}
          />
        )}

        <div className="spacer" />
        <p className="fineprint" style={{ textAlign: "center" }}>
          Besichtigungen · PWA · Daten in Supabase
        </p>
      </main>
    </>
  );
}

function SectionEditor({
  section,
  settings,
  onRename,
  onToggleHidden,
  onAdd,
  onRemoveCustom,
}: {
  section: SectionId;
  settings: ReturnType<typeof useStore>["settings"];
  onRename: (id: string, label: string) => void;
  onToggleHidden: (id: string) => void;
  onAdd: (section: SectionId, label: string, scale: Criterion["scale"], category: Category) => void;
  onRemoveCustom: (id: string) => void;
}) {
  const [newLabel, setNewLabel] = useState("");
  const [newScale, setNewScale] = useState<Criterion["scale"]>("rating5");
  const [newCat, setNewCat] = useState<Category>(DEFAULT_CAT[section] ?? "wohnung");

  const defaults = DEFAULT_CRITERIA.filter((c) => c.section === section);
  const custom = settings.added.filter((c) => c.section === section);

  return (
    <>
      <h2 className="group-title">{SECTION_META[section].title} — Kriterien</h2>
      <div className="card form-list">
        {[...defaults, ...custom].map((c) => {
          const hidden = settings.hidden.includes(c.id);
          const label = settings.renamed[c.id] ?? c.label;
          return (
            <div key={c.id} className="frow" style={{ opacity: hidden ? 0.45 : 1 }}>
              <input
                type="text"
                value={label}
                style={{ textAlign: "left", flex: 2 }}
                onChange={(e) => onRename(c.id, e.target.value)}
              />
              {c.custom ? (
                <button className="textlink" style={{ color: "var(--verybad)", fontSize: 14 }} onClick={() => onRemoveCustom(c.id)}>
                  Löschen
                </button>
              ) : (
                <button className="textlink" style={{ fontSize: 14 }} onClick={() => onToggleHidden(c.id)}>
                  {hidden ? "Einblenden" : "Ausblenden"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <h2 className="group-title">Neues Kriterium</h2>
      <div className="card form-list">
        <div className="frow">
          <input
            type="text"
            placeholder="Bezeichnung, z. B. Tiefgaragentor"
            value={newLabel}
            style={{ textAlign: "left" }}
            onChange={(e) => setNewLabel(e.target.value)}
          />
        </div>
        <div className="frow">
          <label>Skala</label>
          <select value={newScale} onChange={(e) => setNewScale(e.target.value as Criterion["scale"])}>
            <option value="rating5">Sehr gut – sehr schlecht</option>
            <option value="rating3">Gut / Mittel / Schlecht</option>
            <option value="bool">Ja / Nein</option>
            <option value="mold">Schimmel-Skala</option>
          </select>
        </div>
        <div className="frow">
          <label>Zählt zu</label>
          <select value={newCat} onChange={(e) => setNewCat(e.target.value as Category)}>
            {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div className="frow">
          <button
            className="btn block"
            onClick={() => {
              onAdd(section, newLabel, newScale, newCat);
              setNewLabel("");
            }}
          >
            ＋ Kriterium hinzufügen
          </button>
        </div>
      </div>
    </>
  );
}
