"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  CalendarClock,
  Mail,
  MessageCircle,
  MessageSquare,
  Pencil,
  Phone,
  Plus,
  StickyNote,
  Trash2,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  ANSWER_STATUSES,
  ANSWER_STATUS_META,
  CONTACT_TYPES,
  CONTACT_TYPE_META,
} from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/format";
import {
  useCreateContactEvent,
  useDeleteContactEvent,
} from "@/lib/queries/contact-events";
import {
  useCreateContact,
  useDeleteContact,
  useUpdateContact,
} from "@/lib/queries/contacts";
import { useUpdateProperty } from "@/lib/queries/properties";
import { useCreateTask } from "@/lib/queries/tasks";
import { cn } from "@/lib/utils";
import type { PropertyWithRelations } from "@/types";
import type {
  AnswerStatus,
  ContactRow,
  ContactType,
  EventDirection,
} from "@/types/database";

const CONTACT_ROLES = ["Makler", "Eigentümer", "Verwalter", "Sonstige"] as const;

const CONTACT_TYPE_ICONS: Record<ContactType, React.ElementType> = {
  plattform: MessageSquare,
  email: Mail,
  telefon: Phone,
  whatsapp: MessageCircle,
  persoenlich: Users,
  sonstiges: StickyNote,
};

/** Sentinel für "keine Auswahl" in Selects (Base UI mag keine leeren Werte) */
const NONE = "__none__";

function nowForDateTimeInput(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function TabKontakt({ property }: { property: PropertyWithRelations }) {
  const events = useMemo(
    () =>
      [...property.contact_events].sort(
        (a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
      ),
    [property.contact_events]
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ContactsColumn property={property} />
      <div className="space-y-4">
        <EventTimeline property={property} events={events} />
        <NewEventForm property={property} />
      </div>
    </div>
  );
}

/* ---------------------------------- Kontakte ---------------------------------- */

function ContactsColumn({ property }: { property: PropertyWithRelations }) {
  const deleteContact = useDeleteContact();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ContactRow | null>(null);

  function handleDelete(contact: ContactRow) {
    deleteContact.mutate(contact.id, {
      onSuccess: () => toast.success("Kontakt gelöscht"),
      onError: () => toast.error("Kontakt konnte nicht gelöscht werden"),
    });
  }

  return (
    <Card className="self-start">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Kontakte</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-3.5" /> Kontakt
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {property.contacts.length === 0 && (
          <p className="text-sm text-neutral-400">
            Noch kein Kontakt erfasst. Lege den Ansprechpartner für dieses Objekt an.
          </p>
        )}
        {property.contacts.map((c) => (
          <div key={c.id} className="rounded-lg border p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-medium">{c.name}</div>
                {(c.company || c.role) && (
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
                    <Building2 className="size-3" />
                    {[c.company, c.role].filter(Boolean).join(" · ")}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Kontakt bearbeiten"
                  onClick={() => {
                    setEditing(c);
                    setDialogOpen(true);
                  }}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Kontakt löschen"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(c)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
            <div className="mt-2 space-y-1 text-sm">
              {c.phone && (
                <a
                  href={`tel:${c.phone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-1.5 text-green-700 hover:underline"
                >
                  <Phone className="size-3.5" /> {c.phone}
                </a>
              )}
              {c.email && (
                <a
                  href={`mailto:${c.email}`}
                  className="flex items-center gap-1.5 text-green-700 hover:underline"
                >
                  <Mail className="size-3.5" /> {c.email}
                </a>
              )}
              {c.platform && (
                <div className="flex items-center gap-1.5 text-neutral-600">
                  <MessageSquare className="size-3.5" /> {c.platform}
                </div>
              )}
              {c.notes && (
                <p className="whitespace-pre-wrap text-xs text-neutral-500">{c.notes}</p>
              )}
            </div>
          </div>
        ))}
      </CardContent>

      <ContactDialog
        key={editing?.id ?? "new"}
        propertyId={property.id}
        contact={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Card>
  );
}

function ContactDialog({
  propertyId,
  contact,
  open,
  onOpenChange,
}: {
  propertyId: string;
  contact: ContactRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();

  const [name, setName] = useState(contact?.name ?? "");
  const [company, setCompany] = useState(contact?.company ?? "");
  const [role, setRole] = useState(contact?.role ?? NONE);
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [email, setEmail] = useState(contact?.email ?? "");
  const [platform, setPlatform] = useState(contact?.platform ?? "");
  const [notes, setNotes] = useState(contact?.notes ?? "");

  const pending = createContact.isPending || updateContact.isPending;

  function reset() {
    setName("");
    setCompany("");
    setRole(NONE);
    setPhone("");
    setEmail("");
    setPlatform("");
    setNotes("");
  }

  function handleSave() {
    if (!name.trim()) return;
    const values = {
      name: name.trim(),
      company: company.trim() || null,
      role: role === NONE ? null : role,
      phone: phone.trim() || null,
      email: email.trim() || null,
      platform: platform.trim() || null,
      notes: notes.trim() || null,
    };
    const options = {
      onSuccess: () => {
        toast.success(contact ? "Kontakt aktualisiert" : "Kontakt angelegt");
        onOpenChange(false);
        if (!contact) reset();
      },
      onError: () => toast.error("Kontakt konnte nicht gespeichert werden"),
    };
    if (contact) {
      updateContact.mutate({ id: contact.id, values }, options);
    } else {
      createContact.mutate({ ...values, property_id: propertyId }, options);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{contact ? "Kontakt bearbeiten" : "Kontakt anlegen"}</DialogTitle>
          <DialogDescription>
            Ansprechpartner für dieses Objekt {contact ? "bearbeiten" : "hinzufügen"}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Name *</Label>
              <Input
                id="contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Max Mustermann"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-company">Firma</Label>
              <Input
                id="contact-company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Rolle</Label>
              <Select value={role} onValueChange={(v) => setRole((v as string) ?? NONE)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Keine Angabe</SelectItem>
                  {CONTACT_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Telefon</Label>
              <Input
                id="contact-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="contact-email">E-Mail</Label>
              <Input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-platform">Plattform</Label>
              <Input
                id="contact-platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="z. B. ImmoScout24"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-notes">Notiz</Label>
            <Textarea
              id="contact-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button
            className="bg-green-700 hover:bg-green-800"
            onClick={handleSave}
            disabled={!name.trim() || pending}
          >
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------------- Timeline ---------------------------------- */

function EventTimeline({
  property,
  events,
}: {
  property: PropertyWithRelations;
  events: PropertyWithRelations["contact_events"];
}) {
  const deleteEvent = useDeleteContactEvent();
  const contactById = useMemo(
    () => new Map(property.contacts.map((c) => [c.id, c])),
    [property.contacts]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Verlauf</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-neutral-400">
            Noch keine Kontaktversuche dokumentiert.
          </p>
        ) : (
          <ol className="relative space-y-5 border-l border-neutral-200 pl-5">
            {events.map((e) => {
              const Icon = CONTACT_TYPE_ICONS[e.contact_type];
              const contact = e.contact_id ? contactById.get(e.contact_id) : undefined;
              return (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[27px] top-0.5 flex size-4 items-center justify-center rounded-full border border-neutral-300 bg-white">
                    <span className="size-1.5 rounded-full bg-green-700" />
                  </span>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
                        <Icon className="size-3.5 text-neutral-400" />
                        <span>{CONTACT_TYPE_META[e.contact_type].label}</span>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "gap-0.5",
                            e.direction === "ausgehend"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-emerald-100 text-emerald-800"
                          )}
                        >
                          {e.direction === "ausgehend" ? (
                            <>
                              <ArrowUpRight className="size-3" /> ausgehend
                            </>
                          ) : (
                            <>
                              <ArrowDownLeft className="size-3" /> eingehend
                            </>
                          )}
                        </Badge>
                        <span>·</span>
                        <span>{formatDateTime(e.event_date)}</span>
                        {contact && (
                          <>
                            <span>·</span>
                            <span>{contact.name}</span>
                          </>
                        )}
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm">{e.summary}</p>
                      {e.next_action && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-amber-700">
                          <CalendarClock className="size-3" />
                          Nächste Aktion: {e.next_action}
                          {e.next_action_date && ` (${formatDate(e.next_action_date)})`}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Ereignis löschen"
                      className="shrink-0 text-neutral-400 hover:text-red-600"
                      onClick={() =>
                        deleteEvent.mutate(e.id, {
                          onSuccess: () => toast.success("Ereignis gelöscht"),
                          onError: () =>
                            toast.error("Ereignis konnte nicht gelöscht werden"),
                        })
                      }
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------ Neuer Kontaktversuch --------------------------- */

const KEEP_STATUS = "__keep__";

function NewEventForm({ property }: { property: PropertyWithRelations }) {
  const createEvent = useCreateContactEvent();
  const createTask = useCreateTask();
  const updateProperty = useUpdateProperty();

  const [eventDate, setEventDate] = useState(nowForDateTimeInput);
  const [contactType, setContactType] = useState<ContactType>("plattform");
  const [direction, setDirection] = useState<EventDirection>("ausgehend");
  const [contactId, setContactId] = useState<string>(NONE);
  const [summary, setSummary] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [nextActionDate, setNextActionDate] = useState("");
  const [answerStatus, setAnswerStatus] = useState<string>("anfrage_gesendet");

  const pending =
    createEvent.isPending || createTask.isPending || updateProperty.isPending;

  function handleDirectionChange(dir: EventDirection) {
    setDirection(dir);
    // Sinnvoller Default: ausgehend → "Anfrage gesendet", eingehend → nicht ändern
    setAnswerStatus(dir === "ausgehend" ? "anfrage_gesendet" : KEEP_STATUS);
  }

  function handleSave() {
    if (!summary.trim()) return;
    createEvent.mutate(
      {
        property_id: property.id,
        contact_id: contactId === NONE ? null : contactId,
        event_date: new Date(eventDate).toISOString(),
        contact_type: contactType,
        direction,
        summary: summary.trim(),
        next_action: nextAction.trim() || null,
        next_action_date: nextActionDate || null,
      },
      {
        onSuccess: () => {
          // Wiedervorlage → automatisch Aufgabe anlegen
          if (nextActionDate) {
            createTask.mutate({
              property_id: property.id,
              title: nextAction.trim() || "Nachfassen",
              due_date: nextActionDate,
              priority: "mittel",
            });
          }
          // Antwortstatus des Objekts mitziehen (falls gewählt)
          if (answerStatus !== KEEP_STATUS) {
            updateProperty.mutate({
              id: property.id,
              values: { answer_status: answerStatus as AnswerStatus },
            });
          }
          toast.success(
            nextActionDate
              ? "Kontaktversuch gespeichert, Wiedervorlage angelegt"
              : "Kontaktversuch gespeichert"
          );
          setSummary("");
          setNextAction("");
          setNextActionDate("");
          setEventDate(nowForDateTimeInput());
        },
        onError: () => toast.error("Kontaktversuch konnte nicht gespeichert werden"),
      }
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Neuer Kontaktversuch / Notiz</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="event-date">Datum & Uhrzeit</Label>
            <Input
              id="event-date"
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Kontaktart</Label>
            <Select
              value={contactType}
              onValueChange={(v) => setContactType((v as ContactType) ?? "plattform")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {CONTACT_TYPE_META[t].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Richtung</Label>
            <Select
              value={direction}
              onValueChange={(v) =>
                handleDirectionChange((v as EventDirection) ?? "ausgehend")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ausgehend">Ausgehend</SelectItem>
                <SelectItem value="eingehend">Eingehend</SelectItem>
              </SelectContent>
            </Select>
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
        </div>
        <div className="space-y-2">
          <Label htmlFor="event-summary">Ergebnis / Notiz *</Label>
          <Textarea
            id="event-summary"
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Was wurde besprochen bzw. geschrieben?"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="event-next-action">Nächste Aktion (optional)</Label>
            <Input
              id="event-next-action"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="z. B. Nachfassen"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-next-date">Wiedervorlage am</Label>
            <Input
              id="event-next-date"
              type="date"
              value={nextActionDate}
              onChange={(e) => setNextActionDate(e.target.value)}
            />
          </div>
        </div>
        {nextActionDate && (
          <p className="text-xs text-neutral-500">
            Beim Speichern wird automatisch eine Aufgabe „
            {nextAction.trim() || "Nachfassen"}“ zum {formatDate(nextActionDate)} angelegt.
          </p>
        )}
        <div className="flex flex-wrap items-end justify-between gap-3 border-t pt-3">
          <div className="space-y-2">
            <Label>Antwortstatus setzen auf …</Label>
            <Select
              value={answerStatus}
              onValueChange={(v) => setAnswerStatus((v as string) ?? KEEP_STATUS)}
            >
              <SelectTrigger className="w-56" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={KEEP_STATUS}>Nicht ändern</SelectItem>
                {ANSWER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {ANSWER_STATUS_META[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="bg-green-700 hover:bg-green-800"
            onClick={handleSave}
            disabled={!summary.trim() || pending}
          >
            Speichern
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
