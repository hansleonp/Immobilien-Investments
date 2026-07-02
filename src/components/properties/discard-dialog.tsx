"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DISCARD_REASON_META, DISCARD_REASONS } from "@/lib/constants";
import { useUpdateProperty } from "@/lib/queries/properties";
import type { DiscardReason, PropertyRow } from "@/types/database";

export function DiscardDialog({
  property,
  open,
  onOpenChange,
}: {
  property: Pick<PropertyRow, "id" | "title" | "notes">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const update = useUpdateProperty();
  const [reason, setReason] = useState<DiscardReason>("zu_teuer");
  const [note, setNote] = useState("");

  function handleDiscard() {
    const today = new Date().toISOString().slice(0, 10);
    const values: Parameters<typeof update.mutate>[0]["values"] = {
      status: "verworfen",
      discard_reason: reason,
      discarded_at: today,
    };
    if (note.trim()) {
      values.notes = [property.notes, `Verworfen (${today}): ${note.trim()}`]
        .filter(Boolean)
        .join("\n\n");
    }
    update.mutate(
      { id: property.id, values },
      {
        onSuccess: () => {
          toast.success("Immobilie verworfen");
          onOpenChange(false);
        },
        onError: () => toast.error("Verwerfen fehlgeschlagen"),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Immobilie verwerfen</DialogTitle>
          <DialogDescription>
            „{property.title}“ wird aus der aktiven Suche genommen. Der Grund bleibt
            nachvollziehbar dokumentiert.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={reason} onValueChange={(v) => setReason(v as DiscardReason)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DISCARD_REASONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {DISCARD_REASON_META[r].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Optionale Notiz…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button variant="destructive" onClick={handleDiscard} disabled={update.isPending}>
            Verwerfen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
