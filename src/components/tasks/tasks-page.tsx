"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { isThisWeek, isToday } from "date-fns";
import { toast } from "sonner";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { INACTIVE_STATUSES, PRIORITIES, PRIORITY_META } from "@/lib/constants";
import { isOverdue } from "@/lib/derive";
import { formatDate } from "@/lib/format";
import { useProperties } from "@/lib/queries/properties";
import {
  useAllTasks,
  useCreateTask,
  useDeleteTask,
  useUpdateTask,
  type TaskWithProperty,
} from "@/lib/queries/tasks";
import { cn } from "@/lib/utils";
import type { TaskPriority } from "@/types/database";

const NONE = "__none__";

type Group = {
  key: string;
  title: string;
  accent?: string;
  tasks: TaskWithProperty[];
};

function groupTasks(tasks: TaskWithProperty[]): Group[] {
  const overdue: TaskWithProperty[] = [];
  const today: TaskWithProperty[] = [];
  const week: TaskWithProperty[] = [];
  const later: TaskWithProperty[] = [];
  const noDate: TaskWithProperty[] = [];

  for (const t of tasks) {
    if (!t.due_date) {
      noDate.push(t);
      continue;
    }
    const due = new Date(t.due_date + "T00:00:00");
    if (isOverdue(t.due_date)) overdue.push(t);
    else if (isToday(due)) today.push(t);
    else if (isThisWeek(due, { weekStartsOn: 1 })) week.push(t);
    else later.push(t);
  }

  return [
    { key: "ueberfaellig", title: "Überfällig", accent: "text-red-600", tasks: overdue },
    { key: "heute", title: "Heute", tasks: today },
    { key: "woche", title: "Diese Woche", tasks: week },
    { key: "spaeter", title: "Später", tasks: later },
    { key: "ohne", title: "Ohne Datum", tasks: noDate },
  ];
}

export function TasksPage() {
  const { data: tasks, isLoading } = useAllTasks();
  const { data: properties } = useProperties();
  const createTask = useCreateTask();

  const [title, setTitle] = useState("");
  const [propertyId, setPropertyId] = useState<string>(NONE);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("mittel");
  const [showCompleted, setShowCompleted] = useState(false);

  const activeProperties = useMemo(
    () => (properties ?? []).filter((p) => !INACTIVE_STATUSES.includes(p.status)),
    [properties]
  );

  const open = useMemo(() => (tasks ?? []).filter((t) => !t.completed), [tasks]);
  const completed = useMemo(
    () =>
      (tasks ?? [])
        .filter((t) => t.completed)
        .sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? "")),
    [tasks]
  );
  const groups = useMemo(() => groupTasks(open), [open]);

  function handleAdd() {
    if (!title.trim()) return;
    createTask.mutate(
      {
        title: title.trim(),
        property_id: propertyId === NONE ? null : propertyId,
        due_date: dueDate || null,
        priority,
      },
      {
        onSuccess: () => {
          toast.success("Aufgabe erstellt");
          setTitle("");
          setDueDate("");
          setPriority("mittel");
          setPropertyId(NONE);
        },
        onError: () => toast.error("Aufgabe konnte nicht erstellt werden"),
      }
    );
  }

  if (isLoading) return <Skeleton className="h-72 w-full" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-56 flex-1 space-y-1.5">
              <Label htmlFor="quick-task-title">Neue Aufgabe</Label>
              <Input
                id="quick-task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="Was ist zu tun?"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Objekt</Label>
              <Select
                value={propertyId}
                onValueChange={(v) => setPropertyId((v as string) ?? NONE)}
              >
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Ohne Objekt</SelectItem>
                  {activeProperties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quick-task-date">Fällig am</Label>
              <Input
                id="quick-task-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Priorität</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority((v as TaskPriority) ?? "mittel")}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_META[p].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="bg-green-700 hover:bg-green-800"
              onClick={handleAdd}
              disabled={!title.trim() || createTask.isPending}
            >
              <Plus className="size-4" /> Hinzufügen
            </Button>
          </div>
        </CardContent>
      </Card>

      {open.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-white text-sm text-neutral-400">
          <CheckCircle2 className="size-6 text-green-600" />
          Keine offenen Aufgaben — du bist auf dem Laufenden.
        </div>
      ) : (
        groups
          .filter((g) => g.tasks.length > 0)
          .map((g) => (
            <Card key={g.key}>
              <CardHeader>
                <CardTitle className={cn("text-base", g.accent)}>
                  {g.title} ({g.tasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y">
                  {g.tasks.map((t) => (
                    <TaskRowLine key={t.id} task={t} />
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))
      )}

      <div className="flex items-center gap-2">
        <Switch
          checked={showCompleted}
          onCheckedChange={(checked) => setShowCompleted(checked === true)}
        />
        <span className="text-sm text-neutral-600">
          Erledigte anzeigen {completed.length > 0 && `(${completed.length})`}
        </span>
      </div>

      {showCompleted &&
        (completed.length === 0 ? (
          <p className="text-sm text-neutral-400">Noch keine erledigten Aufgaben.</p>
        ) : (
          <Card>
            <CardContent>
              <ul className="divide-y">
                {completed.map((t) => (
                  <TaskRowLine key={t.id} task={t} />
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}

function TaskRowLine({ task }: { task: TaskWithProperty }) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const overdue = !task.completed && isOverdue(task.due_date);

  return (
    <li className="flex items-center gap-3 py-2.5">
      <Checkbox
        checked={task.completed}
        onCheckedChange={(checked) =>
          updateTask.mutate(
            {
              id: task.id,
              values: {
                completed: checked === true,
                completed_at: checked === true ? new Date().toISOString() : null,
              },
            },
            {
              onSuccess: () =>
                toast.success(
                  checked === true ? "Aufgabe erledigt" : "Aufgabe wieder geöffnet"
                ),
              onError: () => toast.error("Aufgabe konnte nicht aktualisiert werden"),
            }
          )
        }
        aria-label={task.completed ? "Als offen markieren" : "Als erledigt markieren"}
      />
      <span
        className={cn(
          "size-2 shrink-0 rounded-full",
          task.priority === "hoch" && "bg-red-500",
          task.priority === "mittel" && "bg-amber-400",
          task.priority === "niedrig" && "bg-neutral-300"
        )}
        title={`Priorität: ${PRIORITY_META[task.priority].label}`}
      />
      <div className="min-w-0 flex-1">
        <span
          className={cn("text-sm", task.completed && "text-neutral-400 line-through")}
        >
          {task.title}
        </span>
        {task.properties && (
          <Link
            href={`/immobilien/${task.properties.id}`}
            className="ml-2 text-xs text-green-700 hover:underline"
          >
            {task.properties.title}
          </Link>
        )}
      </div>
      {task.due_date && (
        <span
          className={cn(
            "shrink-0 text-xs tabular-nums",
            overdue ? "font-medium text-red-600" : "text-neutral-500"
          )}
        >
          {formatDate(task.due_date)}
        </span>
      )}
      <Badge variant="secondary" className={PRIORITY_META[task.priority].badge}>
        {PRIORITY_META[task.priority].label}
      </Badge>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Aufgabe löschen"
        className="text-neutral-400 hover:text-red-600"
        onClick={() =>
          deleteTask.mutate(task.id, {
            onSuccess: () => toast.success("Aufgabe gelöscht"),
            onError: () => toast.error("Aufgabe konnte nicht gelöscht werden"),
          })
        }
      >
        <Trash2 className="size-3.5" />
      </Button>
    </li>
  );
}
