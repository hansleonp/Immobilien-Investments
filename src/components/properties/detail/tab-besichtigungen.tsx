"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarPlus, MapPin, Pencil, Star, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { VIEWING_STATUS_META } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { useUpdateProperty } from "@/lib/queries/properties";
import {
  useCreateViewing,
  useDeleteViewing,
  useUpdateViewing,
} from "@/lib/queries/viewings";
import { cn } from "@/lib/utils";
import type { PropertyWithRelations } from "@/types";
import type { ViewingRow, ViewingStatus } from "@/types/database";

const VIEWING_STATUSES = Object.keys(VIEWING_STATUS_META) as ViewingStatus[];
const NONE = "__none__";

function toDateTimeInput(iso: string): string {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function TabBesichtigungen({ property }: { property: PropertyWithRelations }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ViewingRow | null>(null);

  const viewings = useMemo(
    () =>
      [...property.viewings].sort((a, b) =>
        b.viewing_date.localeCompare(a.viewing_date)
      ),
    [property.viewings]
  );

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex justify-end">
        <Button
          className="bg-green-700 hover:bg-green-800"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <CalendarPlus className="size-4" /> Besichtigung
        </Button>
      </div>

      {viewings.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-neutral-400">
            Noch keine Besichtigung geplant. Lege den ersten Termin an.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {viewings.map((v) => (
            <ViewingCard
              key={v.id}
              viewing={v}
              property={property}
              onEdit={() => {
                setEditing(v);
                setDialogOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <ViewingDialog
        key={editing?.id ?? "new"}
        property={property}
        viewing={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}

function ViewingCard({
  viewing: v,
  property,
  onEdit,
}: {
  viewing: ViewingRow;
  property: PropertyWithRelations;
  onEdit: () => void;
}) {
  const updateViewing = useUpdateViewing();
  const deleteViewing = useDeleteViewing();
  const updateProperty = useUpdateProperty();

  const contact = v.contact_id
    ? property.contacts.find((c) => c.id === v.contact_id)
    : undefined;

  function handleStatusChange(status: ViewingStatus) {
    updateViewing.mutate(
      { id: v.id, values: { status } },
      {
        onSuccess: () => {
          if (status === "erledigt" && property.status !== "besichtigung_erledigt") {
            toast.success("Besichtigung als erledigt markiert", {
              action: {
                label: "Objektstatus auf „Besichtigung erledigt“ setzen",
                onClick: () =>
                  updateProperty.mutate(
                    { id: property.id, values: { status: "besichtigung_erledigt" } },
                    { onSuccess: () => toast.success("Objektstatus aktualisiert") }
                  ),
              },
            });
          } else {
            toast.success(`Status: ${VIEWING_STATUS_META[status].label}`);
          }
        },
        onError: () => toast.error("Status konnte nicht geändert werden"),
      }
    );
  }

  return (
    <Card>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-medium">{formatDateTime(v.viewing_date)}</div>
          <div className="flex items-center gap-1.5">
            <Select
              value={v.status}
              onValueChange={(val) => {
                const status = (val as ViewingStatus) ?? v.status;
                if (status !== v.status) handleStatusChange(status);
              }}
            >
              <SelectTrigger size="sm" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VIEWING_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {VIEWING_STATUS_META[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon-sm" aria-label="Bearbeiten" onClick={onEdit}>
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Löschen"
              className="text-neutral-400 hover:text-red-600"
              onClick={() =>
                deleteViewing.mutate(v.id, {
                  onSuccess: () => toast.success("Besichtigung gelöscht"),
                  onError: () =>
                    toast.error("Besichtigung konnte nicht gelöscht werden"),
                })
              }
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-600">
          {v.location && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5 text-neutral-400" /> {v.location}
            </span>
          )}
          {contact && (
            <span className="flex items-center gap-1">
              <User className="size-3.5 text-neutral-400" /> {contact.name}
            </span>
          )}
          {v.rating != null && (
            <span className="flex items-center gap-0.5" title={`Eindruck: ${v.rating}/5`}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-3.5",
                    i <= (v.rating ?? 0)
                      ? "fill-amber-400 text-amber-400"
                      : "text-neutral-300"
                  )}
                />
              ))}
            </span>
          )}
        </div>
        {v.notes && (
          <p className="whitespace-pre-wrap text-sm text-neutral-500">{v.notes}</p>
        )}
      </CardContent>
    </Card>
  );
}

function ViewingDialog({
  property,
  viewing,
  open,
  onOpenChange,
}: {
  property: PropertyWithRelations;
  viewing: ViewingRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createViewing = useCreateViewing();
  const updateViewing = useUpdateViewing();
  const updateProperty = useUpdateProperty();

  const defaultLocation = [
    property.street,
    [property.zip, property.city].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  const [date, setDate] = useState(
    viewing ? toDateTimeInput(viewing.viewing_date) : ""
  );
  const [location, setLocation] = useState(viewing?.location ?? defaultLocation);
  const [contactId, setContactId] = useState<string>(viewing?.contact_id ?? NONE);
  const [status, setStatus] = useState<ViewingStatus>(viewing?.status ?? "geplant");
  const [notes, setNotes] = useState(viewing?.notes ?? "");
  const [rating, setRating] = useState<number | null>(viewing?.rating ?? null);
  const [syncStatus, setSyncStatus] = useState(true);

  const pending = createViewing.isPending || updateViewing.isPending;

  function handleSave() {
    if (!date) return;
    const values = {
      viewing_date: new Date(date).toISOString(),
      location: location.trim() || null,
      contact_id: contactId === NONE ? null : contactId,
      status,
      notes: notes.trim() || null,
      rating,
    };
    const afterSave = () => {
      if (
        !viewing &&
        status === "geplant" &&
        syncStatus &&
        property.status !== "besichtigung_geplant"
      ) {
        updateProperty.mutate({
          id: property.id,
          values: { status: "besichtigung_geplant" },
        });
        toast.success("Besichtigung angelegt, Objektstatus auf „Besichtigung geplant“ gesetzt");
      } else {
        toast.success(viewing ? "Besichtigung aktualisiert" : "Besichtigung angelegt");
      }
      onOpenChange(false);
    };
    if (viewing) {
      updateViewing.mutate(
        { id: viewing.id, values },
        {
          onSuccess: afterSave,
          onError: () => toast.error("Besichtigung konnte nicht gespeichert werden"),
        }
      );
    } else {
      createViewing.mutate(
        { ...values, property_id: property.id },
        {
          onSuccess: afterSave,
          onError: () => toast.error("Besichtigung konnte nicht gespeichert werden"),
        }
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {viewing ? "Besichtigung bearbeiten" : "Besichtigung planen"}
          </DialogTitle>
          <DialogDescription>„{property.title}“</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="viewing-date">Datum & Uhrzeit *</Label>
              <Input
                id="viewing-date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus((v as ViewingStatus) ?? "geplant")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VIEWING_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {VIEWING_STATUS_META[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="viewing-location">Ort / Treffpunkt</Label>
            <Input
              id="viewing-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Ansprechpartner</Label>
            <Select
              value={contactId}
              onValueChange={(v) => setContactId((v as string) ?? NONE)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Kein Ansprechpartner</SelectItem>
                {property.contacts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {viewing && (
            <div className="space-y-2">
              <Label>Eindruck (1–5)</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`${i} von 5 Sternen`}
                    onClick={() => setRating(rating === i ? null : i)}
                  >
                    <Star
                      className={cn(
                        "size-5",
                        rating != null && i <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-neutral-300 hover:text-amber-300"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="viewing-notes">Notiz</Label>
            <Textarea
              id="viewing-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          {!viewing && status === "geplant" && (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={syncStatus}
                onCheckedChange={(checked) => setSyncStatus(checked === true)}
              />
              Objektstatus auf „Besichtigung geplant“ setzen
            </label>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button
            className="bg-green-700 hover:bg-green-800"
            onClick={handleSave}
            disabled={!date || pending}
          >
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
