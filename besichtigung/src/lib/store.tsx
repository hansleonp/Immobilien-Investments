import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { checkReminders } from "./reminders";
import type { CriteriaSettings, Inspection, Property, Status } from "./types";
import { EMPTY_SETTINGS } from "./types";

// ============================================================
// Local-first Store: alle Änderungen landen sofort in
// localStorage und werden im Hintergrund zu Supabase gesynct.
// ============================================================

const LS_DATA = "besichtigung.inspections";
const LS_DIRTY = "besichtigung.dirty";
const LS_SETTINGS = "besichtigung.settings";
const LS_PROPS = "besichtigung.properties";
const LS_PROPS_DIRTY = "besichtigung.properties_dirty";

function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveLS(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Speicher voll (z. B. viele Offline-Fotos) — ignorieren
  }
}

// Alt-Daten verträglich machen: Status immer Array, docs immer Array
function normProp(p: Property): Property {
  const s = (p as { status?: unknown }).status;
  return {
    ...p,
    status: Array.isArray(s) ? (s.length ? (s as string[]) : ["Neu"]) : typeof s === "string" && s ? [s] : ["Neu"],
    docs: Array.isArray(p.docs) ? p.docs : [],
    titel: p.titel ?? "",
    adresse: p.adresse ?? "",
    lat: typeof p.lat === "number" ? p.lat : null,
    lng: typeof p.lng === "number" ? p.lng : null,
    ansprechpartner: p.ansprechpartner ?? "",
    telefon: p.telefon ?? "",
    email: p.email ?? "",
    wiedervorlage: p.wiedervorlage ?? "",
    history: Array.isArray(p.history) ? p.history : [],
  };
}

export function newInspection(): Inspection {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
    title: "",
    status: "geplant",
    objekt: { datum: new Date().toISOString().slice(0, 10) },
    answers: {},
    questions: {},
    docs: {},
    report: {},
    score: null,
    scores: {},
    red_flags: [],
  };
}

interface StoreCtx {
  session: Session | null;
  authReady: boolean;
  inspections: Inspection[];
  properties: Property[];
  settings: CriteriaSettings;
  online: boolean;
  syncState: "idle" | "syncing" | "error" | "offline";
  upsert: (insp: Inspection) => void;
  patch: (id: string, patch: Partial<Inspection>) => void;
  remove: (id: string) => void;
  upsertProperty: (p: Property) => void;
  patchProperty: (id: string, patch: Partial<Property>) => void;
  removeProperty: (id: string) => void;
  saveSettings: (s: CriteriaSettings) => void;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  syncNow: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore außerhalb des Providers");
  return ctx;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [inspections, setInspections] = useState<Inspection[]>(() => loadLS(LS_DATA, []));
  const [properties, setProperties] = useState<Property[]>(() => loadLS<Property[]>(LS_PROPS, []).map(normProp));
  const [settings, setSettings] = useState<CriteriaSettings>(() => loadLS(LS_SETTINGS, EMPTY_SETTINGS));
  const [online, setOnline] = useState(navigator.onLine);
  const [syncState, setSyncState] = useState<StoreCtx["syncState"]>("idle");
  const dirtyRef = useRef<Set<string>>(new Set(loadLS<string[]>(LS_DIRTY, [])));
  const propsDirtyRef = useRef<Set<string>>(new Set(loadLS<string[]>(LS_PROPS_DIRTY, [])));
  const settingsDirtyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Auth ----
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // ---- Online/Offline ----
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const persistDirty = () => saveLS(LS_DIRTY, [...dirtyRef.current]);
  const persistPropsDirty = () => saveLS(LS_PROPS_DIRTY, [...propsDirtyRef.current]);

  // ---- Sync zu Supabase (debounced) ----
  const pushDirty = useCallback(async () => {
    if (!session || !navigator.onLine) {
      setSyncState(navigator.onLine ? "idle" : "offline");
      return;
    }
    const ids = [...dirtyRef.current];
    const propIds = [...propsDirtyRef.current];
    if (ids.length === 0 && propIds.length === 0 && !settingsDirtyRef.current) return;
    setSyncState("syncing");
    // Pro Datensatz einzeln syncen: ein fehlerhafter Eintrag darf die
    // restliche Warteschlange NICHT blockieren (bleibt dirty für später).
    let hadError = false;
    const current = loadLS<Inspection[]>(LS_DATA, []);
    for (const id of ids) {
      try {
        const insp = current.find((i) => i.id === id);
        if (insp) {
          const { error } = await supabase.from("inspections").upsert({
            ...insp,
            user_id: session.user.id,
          });
          if (error) throw error;
        } else {
          await supabase.from("inspections").delete().eq("id", id);
        }
        dirtyRef.current.delete(id);
        persistDirty();
      } catch {
        hadError = true;
      }
    }
    // Immobilien-Suche: als jsonb-Blob in search_properties
    const currentProps = loadLS<Property[]>(LS_PROPS, []);
    for (const id of propIds) {
      try {
        const p = currentProps.find((x) => x.id === id);
        if (p) {
          const { error } = await supabase.from("search_properties").upsert({
            id: p.id,
            user_id: session.user.id,
            data: p,
            updated_at: p.updated_at,
          });
          if (error) throw error;
        } else {
          await supabase.from("search_properties").delete().eq("id", id);
        }
        propsDirtyRef.current.delete(id);
        persistPropsDirty();
      } catch {
        hadError = true;
      }
    }
    if (settingsDirtyRef.current) {
      try {
        const s = loadLS<CriteriaSettings>(LS_SETTINGS, EMPTY_SETTINGS);
        const { error } = await supabase.from("inspection_settings").upsert({
          user_id: session.user.id,
          custom_criteria: s,
        });
        if (error) throw error;
        settingsDirtyRef.current = false;
      } catch {
        hadError = true;
      }
    }
    setSyncState(hadError ? "error" : "idle");
  }, [session]);

  const scheduleSync = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => void pushDirty(), 1200);
  }, [pushDirty]);

  // Bei Wieder-Online oder Login: syncen + frische Daten holen
  useEffect(() => {
    if (!session || !online) return;
    let cancelled = false;
    (async () => {
      await pushDirty();
      const { data, error } = await supabase
        .from("inspections")
        .select("*")
        .order("updated_at", { ascending: false });
      if (!error && data && !cancelled) {
        setInspections((local) => {
          // Merge: neuere Version gewinnt, lokale Dirty-Einträge bleiben lokal
          const map = new Map<string, Inspection>();
          for (const r of data as Inspection[]) map.set(r.id, r);
          for (const l of local) {
            const remote = map.get(l.id);
            if (!remote || dirtyRef.current.has(l.id) || l.updated_at > remote.updated_at) {
              map.set(l.id, l);
            }
          }
          const merged = [...map.values()].sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
          saveLS(LS_DATA, merged);
          return merged;
        });
      }
      const { data: sdata } = await supabase
        .from("inspection_settings")
        .select("custom_criteria")
        .maybeSingle();
      if (sdata?.custom_criteria && !cancelled && !settingsDirtyRef.current) {
        setSettings(sdata.custom_criteria as CriteriaSettings);
        saveLS(LS_SETTINGS, sdata.custom_criteria);
      }
      // Immobilien-Suche einlesen + mergen
      const { data: pdata, error: perr } = await supabase
        .from("search_properties")
        .select("*")
        .order("updated_at", { ascending: false });
      if (!perr && pdata && !cancelled) {
        setProperties((local) => {
          const map = new Map<string, Property>();
          for (const r of pdata as { id: string; user_id: string; data: Property; updated_at: string }[]) {
            map.set(r.id, normProp({ ...(r.data ?? {}), id: r.id, user_id: r.user_id, updated_at: r.updated_at } as Property));
          }
          for (const l of local) {
            const remote = map.get(l.id);
            if (!remote || propsDirtyRef.current.has(l.id) || l.updated_at > remote.updated_at) {
              map.set(l.id, l);
            }
          }
          const merged = [...map.values()].sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
          saveLS(LS_PROPS, merged);
          return merged;
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session, online, pushDirty]);

  // ---- Fällige Wiedervorlagen benachrichtigen (falls aktiviert) ----
  useEffect(() => {
    void checkReminders(properties);
  }, [properties]);

  // ---- Mutationen ----
  const upsert = useCallback(
    (insp: Inspection) => {
      const withTs = { ...insp, updated_at: new Date().toISOString() };
      setInspections((prev) => {
        const next = [withTs, ...prev.filter((i) => i.id !== insp.id)];
        saveLS(LS_DATA, next);
        return next;
      });
      dirtyRef.current.add(insp.id);
      persistDirty();
      scheduleSync();
    },
    [scheduleSync]
  );

  const patch = useCallback(
    (id: string, p: Partial<Inspection>) => {
      setInspections((prev) => {
        const next = prev.map((i) =>
          i.id === id ? { ...i, ...p, updated_at: new Date().toISOString() } : i
        );
        saveLS(LS_DATA, next);
        return next;
      });
      dirtyRef.current.add(id);
      persistDirty();
      scheduleSync();
    },
    [scheduleSync]
  );

  const remove = useCallback(
    (id: string) => {
      setInspections((prev) => {
        const next = prev.filter((i) => i.id !== id);
        saveLS(LS_DATA, next);
        return next;
      });
      dirtyRef.current.add(id); // pushDirty erkennt fehlende Zeile → delete
      persistDirty();
      scheduleSync();
    },
    [scheduleSync]
  );

  const upsertProperty = useCallback(
    (p: Property) => {
      const withTs = { ...p, updated_at: new Date().toISOString() };
      setProperties((prev) => {
        const next = [withTs, ...prev.filter((x) => x.id !== p.id)];
        saveLS(LS_PROPS, next);
        return next;
      });
      propsDirtyRef.current.add(p.id);
      persistPropsDirty();
      scheduleSync();
    },
    [scheduleSync]
  );

  const patchProperty = useCallback(
    (id: string, p: Partial<Property>) => {
      setProperties((prev) => {
        const next = prev.map((x) =>
          x.id === id ? { ...x, ...p, updated_at: new Date().toISOString() } : x
        );
        saveLS(LS_PROPS, next);
        return next;
      });
      propsDirtyRef.current.add(id);
      persistPropsDirty();
      scheduleSync();
    },
    [scheduleSync]
  );

  const removeProperty = useCallback(
    (id: string) => {
      setProperties((prev) => {
        const next = prev.filter((x) => x.id !== id);
        saveLS(LS_PROPS, next);
        return next;
      });
      propsDirtyRef.current.add(id);
      persistPropsDirty();
      scheduleSync();
    },
    [scheduleSync]
  );

  const saveSettings = useCallback(
    (s: CriteriaSettings) => {
      setSettings(s);
      saveLS(LS_SETTINGS, s);
      settingsDirtyRef.current = true;
      scheduleSync();
    },
    [scheduleSync]
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<StoreCtx>(
    () => ({
      session,
      authReady,
      inspections,
      properties,
      settings,
      online,
      syncState,
      upsert,
      patch,
      remove,
      upsertProperty,
      patchProperty,
      removeProperty,
      saveSettings,
      signIn,
      signOut,
      syncNow: () => void pushDirty(),
    }),
    [session, authReady, inspections, properties, settings, online, syncState, upsert, patch, remove, upsertProperty, patchProperty, removeProperty, saveSettings, signIn, signOut, pushDirty]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const STATUS_ORDER: Status[] = [
  "geplant",
  "in_bearbeitung",
  "abgeschlossen",
  "weiterverfolgen",
  "verhandeln",
  "verworfen",
];
