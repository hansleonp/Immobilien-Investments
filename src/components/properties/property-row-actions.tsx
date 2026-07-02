"use client";

import { useState } from "react";
import Link from "next/link";
import { de } from "date-fns/locale";
import {
  CalendarClock,
  ExternalLink,
  Eye,
  ListChecks,
  MessageSquarePlus,
  MoreHorizontal,
  Send,
  Star,
  StarOff,
  StickyNote,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  PRIORITIES,
  PRIORITY_META,
  PROPERTY_STATUSES,
  STATUS_META,
  TASK_PRESETS,
} from "@/lib/constants";
import { toISODate } from "@/lib/format";
import { useCreateContactEvent } from "@/lib/queries/contact-events";
import { useUpdateProperty } from "@/lib/queries/properties";
import { useCreateTask } from "@/lib/queries/tasks";
import { DiscardDialog } from "./discard-dialog";
import type { EnrichedProperty } from "@/types";
import type { PropertyInsert, PropertyStatus, TaskPriority } from "@/types/database";

/** Quick-Actions pro Tabellenzeile (Drei-Punkte-Menü) */
export function PropertyRowActions({ row }: { row: EnrichedProperty }) {
  const p = row.property;
  const updateProperty = useUpdateProperty();
  const createTask = useCreateTask();
  const createEvent = useCreateContactEvent();

  const [discardOpen, setDiscardOpen] = useState(false);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  // Aufgabe-Dialog
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("mittel");

  // Notiz-Dialog
  const [note, setNote] = useState("");

  function handleStatusChange(status: PropertyStatus) {
    updateProperty.mutate(
      { id: p.id, values: { status } },
      {
        onSuccess: () =>
          toast.success(`Status: ${STATUS_META[status].label}`),
        onError: () => toast.error("Status konnte nicht geändert werden"),
      }
    );
  }

  function handleMarkContacted() {
    createEvent.mutate(
      {
        property_id: p.id,
        contact_type: "plattform",
        direction: "ausgehend",
        summary: "Anfrage gesendet",
        event_date: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          const values: Partial<PropertyInsert> = {
            answer_status: "anfrage_gesendet",
          };
          if (p.status === "neu" || p.status === "interessant") {
            values.status = "kontaktiert";
          }
          updateProperty.mutate({ id: p.id, values });
          toast.success("Als kontaktiert markiert");
        },
        onError: () => toast.error("Kontakt konnte nicht gespeichert werden"),
      }
    );
  }

  function handleFollowUpDate(date: Date | undefined) {
    if (!date) return;
    createTask.mutate(
      {
        property_id: p.id,
        title: "Nachfassen",
        due_date: toISODate(date),
        priority: "mittel",
      },
      {
        onSuccess: () => {
          if (p.answer_status === "anfrage_gesendet") {
            updateProperty.mutate({
              id: p.id,
              values: { answer_status: "antwort_ausstehend" },
            });
          }
          toast.success("Nachfassdatum gesetzt");
        },
        onError: () => toast.error("Nachfassdatum konnte nicht gesetzt werden"),
      }
    );
    setFollowUpOpen(false);
  }

  function handleCreateTask() {
    if (!taskTitle.trim()) return;
    createTask.mutate(
      {
        property_id: p.id,
        title: taskTitle.trim(),
        due_date: taskDate || null,
        priority: taskPriority,
      },
      {
        onSuccess: () => {
          toast.success("Aufgabe erstellt");
          setTaskOpen(false);
          setTaskTitle("");
          setTaskDate("");
          setTaskPriority("mittel");
        },
        onError: () => toast.error("Aufgabe konnte nicht erstellt werden"),
      }
    );
  }

  function handleAddNote() {
    if (!note.trim()) return;
    const notes = [p.notes, note.trim()].filter(Boolean).join("\n\n");
    updateProperty.mutate(
      { id: p.id, values: { notes } },
      {
        onSuccess: () => {
          toast.success("Notiz gespeichert");
          setNoteOpen(false);
          setNote("");
        },
        onError: () => toast.error("Notiz konnte nicht gespeichert werden"),
      }
    );
  }

  function handleToggleFavorite() {
    updateProperty.mutate(
      { id: p.id, values: { is_favorite: !p.is_favorite } },
      {
        onSuccess: () =>
          toast.success(
            p.is_favorite ? "Favorit entfernt" : "Als Favorit markiert"
          ),
        onError: () => toast.error("Änderung fehlgeschlagen"),
      }
    );
  }

  return (
    // stopPropagation: Klicks im Menü dürfen nicht zur Detailseite navigieren
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Aktionen" />
          }
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          {p.source_url ? (
            <DropdownMenuItem
              render={
                <a
                  href={p.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <ExternalLink /> Inserat öffnen
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem disabled>
              <ExternalLink /> Inserat öffnen
            </DropdownMenuItem>
          )}
          <DropdownMenuItem render={<Link href={`/immobilien/${p.id}`} />}>
            <Eye /> Details öffnen
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ListChecks /> Status ändern
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="max-h-80 overflow-y-auto">
              {PROPERTY_STATUSES.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={
                    status === p.status ? "font-semibold" : undefined
                  }
                >
                  {STATUS_META[status].label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleMarkContacted}>
            <Send /> Als kontaktiert markieren
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFollowUpOpen(true)}>
            <CalendarClock /> Nachfassdatum setzen
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTaskOpen(true)}>
            <MessageSquarePlus /> Aufgabe erstellen
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setNoteOpen(true)}>
            <StickyNote /> Notiz hinzufügen
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleFavorite}>
            {p.is_favorite ? (
              <>
                <StarOff /> Favorit entfernen
              </>
            ) : (
              <>
                <Star /> Als Favorit markieren
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDiscardOpen(true)}
          >
            <Trash2 /> Verwerfen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Nachfassdatum: Popover mit Kalender, unsichtbar am Icon-Button verankert */}
      <Popover open={followUpOpen} onOpenChange={setFollowUpOpen}>
        <PopoverTrigger
          render={<span aria-hidden className="absolute size-0" />}
        />
        <PopoverContent align="end" className="w-auto p-1">
          <Calendar
            mode="single"
            locale={de}
            selected={undefined}
            onSelect={handleFollowUpDate}
            disabled={{ before: new Date() }}
          />
        </PopoverContent>
      </Popover>

      {/* Aufgabe erstellen */}
      <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aufgabe erstellen</DialogTitle>
            <DialogDescription>„{p.title}“</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`task-title-${p.id}`}>Titel</Label>
              <Input
                id={`task-title-${p.id}`}
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Was ist zu tun?"
              />
              <div className="flex flex-wrap gap-1.5">
                {TASK_PRESETS.map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="xs"
                    onClick={() => setTaskTitle(preset)}
                  >
                    {preset}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor={`task-date-${p.id}`}>Fällig am (optional)</Label>
                <Input
                  id={`task-date-${p.id}`}
                  type="date"
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Priorität</Label>
                <Select
                  value={taskPriority}
                  onValueChange={(v) =>
                    setTaskPriority((v as TaskPriority) ?? "mittel")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((prio) => (
                      <SelectItem key={prio} value={prio}>
                        {PRIORITY_META[prio].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskOpen(false)}>
              Abbrechen
            </Button>
            <Button
              className="bg-green-700 hover:bg-green-800"
              onClick={handleCreateTask}
              disabled={!taskTitle.trim() || createTask.isPending}
            >
              Aufgabe erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notiz hinzufügen */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notiz hinzufügen</DialogTitle>
            <DialogDescription>
              Wird an die bestehenden Notizen von „{p.title}“ angehängt.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Notiz…"
            rows={4}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteOpen(false)}>
              Abbrechen
            </Button>
            <Button
              className="bg-green-700 hover:bg-green-800"
              onClick={handleAddNote}
              disabled={!note.trim() || updateProperty.isPending}
            >
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DiscardDialog
        property={p}
        open={discardOpen}
        onOpenChange={setDiscardOpen}
      />
    </div>
  );
}
