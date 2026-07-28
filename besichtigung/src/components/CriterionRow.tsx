import { useEffect, useRef, useState } from "react";
import { SCALE_OPTIONS, boolOptions } from "../lib/catalog";
import { deletePhoto, photoUrl, uploadPhoto } from "../lib/photos";
import { useStore } from "../lib/store";
import type { Answer, Criterion } from "../lib/types";

// Eine Bewertungszeile: Label, Segment-Auswahl, Notiz, Fotos
export function CriterionRow({
  crit,
  answer,
  inspectionId,
  onChange,
}: {
  crit: Criterion;
  answer: Answer | undefined;
  inspectionId: string;
  onChange: (a: Answer) => void;
}) {
  const { session } = useStore();
  const [showNote, setShowNote] = useState(!!answer?.note);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const opts =
    crit.scale === "bool" ? boolOptions(crit.boolGood ?? "ja") : SCALE_OPTIONS[crit.scale] ?? SCALE_OPTIONS.rating5;

  const current = answer?.v;
  const set = (patch: Partial<Answer>) => onChange({ ...answer, ...patch });

  const onPhoto = async (file: File | undefined) => {
    if (!file || !session) return;
    setBusy(true);
    try {
      const path = await uploadPhoto(session.user.id, inspectionId, crit.id, file);
      set({ photos: [...(answer?.photos ?? []), path] });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removePhoto = async (path: string) => {
    set({ photos: (answer?.photos ?? []).filter((p) => p !== path) });
    void deletePhoto(path);
  };

  return (
    <div className="crit">
      <div className="head">
        <div className="grow">
          <div className="label">{crit.label}</div>
          {crit.hint && <div className="hint">{crit.hint}</div>}
        </div>
      </div>
      <div className="opts">
        {opts.map((o) => {
          const on = current !== undefined && current === o.value;
          return (
            <button
              key={o.label}
              type="button"
              className={`opt ${on ? `on ${o.tone}` : ""}`}
              onClick={() => set({ v: on ? undefined : o.value })}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      <div className="extras">
        <button type="button" className="textlink" onClick={() => setShowNote((s) => !s)}>
          {answer?.note ? "✏️ Notiz" : "＋ Notiz"}
        </button>
        <button type="button" className="textlink" onClick={() => fileRef.current?.click()} disabled={busy}>
          {busy ? "Lädt…" : "📷 Foto"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => void onPhoto(e.target.files?.[0])}
        />
      </div>
      {showNote && (
        <textarea
          placeholder="Notiz…"
          value={answer?.note ?? ""}
          onChange={(e) => set({ note: e.target.value })}
        />
      )}
      {(answer?.photos?.length ?? 0) > 0 && (
        <div className="photostrip">
          {answer!.photos!.map((p) => (
            <Photo key={p} path={p} onDelete={() => void removePhoto(p)} />
          ))}
        </div>
      )}
    </div>
  );
}

function Photo({ path, onDelete }: { path: string; onDelete: () => void }) {
  const [url, setUrl] = useState<string | null>(path.startsWith("data:") ? path : null);
  useEffect(() => {
    if (!url) void photoUrl(path).then(setUrl);
  }, [path]);
  if (!url) return <div className="ph" style={{ width: 72, height: 72, background: "var(--divider-soft)", borderRadius: 8 }} />;
  return (
    <div className="ph">
      <a href={url} target="_blank" rel="noreferrer">
        <img src={url} alt="Foto" />
      </a>
      <button type="button" className="del" onClick={onDelete} aria-label="Foto löschen">
        ✕
      </button>
    </div>
  );
}
