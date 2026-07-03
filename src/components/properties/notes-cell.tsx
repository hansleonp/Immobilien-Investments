"use client";

import { useState } from "react";
import { toast } from "sonner";
import { StickyNote } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateProperty } from "@/lib/queries/properties";
import { cn } from "@/lib/utils";

/**
 * Inline editierbare Kurznotiz in der Immobilien-Tabelle ("alte Heizung" etc.).
 * Klick öffnet ein Popover mit Textarea; Speichern schreibt properties.notes.
 */
export function NotesCell({ propertyId, notes }: { propertyId: string; notes: string | null }) {
  const update = useUpdateProperty();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(notes ?? "");

  function handleSave() {
    const value = draft.trim() === "" ? null : draft.trim();
    update.mutate(
      { id: propertyId, values: { notes: value } },
      {
        onSuccess: () => {
          toast.success("Notiz gespeichert");
          setOpen(false);
        },
        onError: () => toast.error("Speichern fehlgeschlagen"),
      }
    );
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setDraft(notes ?? "");
      }}
    >
      <PopoverTrigger
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "flex max-w-48 cursor-pointer items-center gap-1 rounded px-1 py-0.5 text-left text-sm",
          "hover:bg-neutral-100",
          notes ? "text-neutral-600" : "text-neutral-300"
        )}
        title={notes ?? "Notiz hinzufügen"}
      >
        <StickyNote className="size-3 shrink-0" />
        <span className="truncate">{notes || "Notiz…"}</span>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 space-y-2"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="z. B. alte Heizung, EG-Wohnung, Makler unfreundlich…"
          rows={4}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
            Abbrechen
          </Button>
          <Button
            size="sm"
            className="bg-green-700 hover:bg-green-800"
            disabled={update.isPending}
            onClick={handleSave}
          >
            Speichern
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
