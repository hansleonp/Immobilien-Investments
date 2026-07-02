"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRIORITIES, PRIORITY_META, TASK_PRESETS } from "@/lib/constants";
import { isOverdue } from "@/lib/derive";
import { formatDate } from "@/lib/format";
import { useCreateTask, useDeleteTask, useUpdateTask } from "@/lib/queries/tasks";
import { cn } from "@/lib/utils";
import type { PropertyWithRelations } from "@/types";
import type { TaskPriority, TaskRow } from "@/types/database";

function sortByDueDate(tasks: TaskRow[]): TaskRow[] {
  return [...tasks].sort((a, b) => {
    if (a.due_date == null && b.due_date == null) return 0;
    if (a.due_date == null) return 1;
    if (b.due_date == null) return -1;
    return a.due_date.localeCompare(b.due_date);
  });
}

export function TabAufgaben({ property }: { property: PropertyWithRelations }) {
  const createTask = useCreateTask();
  const [showCompleted, setShowCompleted] = useState(false);

  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("mittel");

  const open = useMemo(
    () => sortByDueDate(property.tasks.filter((t) => !t.completed)),
    [property.tasks]
  );
  const completed = useMemo(
    () =>
      [...property.tasks]
        .filter((t) => t.completed)
        .sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? "")),
    [property.tasks]
  );

  function handleAdd() {
    if (!title.trim()) return;
    createTask.mutate(
      {
        property_id: property.id,
        title: title.trim(),
        due_date: dueDate || null,
        priority,
      },
      {
        onSuccess: () => {
          toast.success("Aufgabe erstellt");
          setTitle("");
          setDueDate("");
          setPriority("mittel");
        },
        onError: () => toast.error("Aufgabe konnte nicht erstellt werden"),
      }
    );
  }

  return (
    <div className="max-w-3xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Neue Aufgabe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Was ist zu tun?"
              className="min-w-48 flex-1"
            />
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-40"
            />
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
            <Button
              className="bg-green-700 hover:bg-green-800"
              onClick={handleAdd}
              disabled={!title.trim() || createTask.isPending}
            >
              <Plus className="size-4" /> Hinzufügen
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TASK_PRESETS.map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="xs"
                onClick={() => setTitle(preset)}
              >
                {preset}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Offene Aufgaben {open.length > 0 && `(${open.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {open.length === 0 ? (
            <p className="text-sm text-neutral-400">
              Keine offenen Aufgaben — alles erledigt.
            </p>
          ) : (
            <ul className="divide-y">
              {open.map((t) => (
                <TaskLine key={t.id} task={t} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {completed.length > 0 && (
        <div>
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800"
            onClick={() => setShowCompleted((s) => !s)}
          >
            {showCompleted ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
            Erledigte Aufgaben ({completed.length})
          </button>
          {showCompleted && (
            <Card className="mt-2">
              <CardContent>
                <ul className="divide-y">
                  {completed.map((t) => (
                    <TaskLine key={t.id} task={t} />
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function TaskLine({ task }: { task: TaskRow }) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const overdue = !task.completed && isOverdue(task.due_date);

  function handleToggle(checked: boolean) {
    updateTask.mutate(
      {
        id: task.id,
        values: {
          completed: checked,
          completed_at: checked ? new Date().toISOString() : null,
        },
      },
      {
        onSuccess: () =>
          toast.success(checked ? "Aufgabe erledigt" : "Aufgabe wieder geöffnet"),
        onError: () => toast.error("Aufgabe konnte nicht aktualisiert werden"),
      }
    );
  }

  return (
    <li className="flex items-center gap-3 py-2.5">
      <Checkbox
        checked={task.completed}
        onCheckedChange={(checked) => handleToggle(checked === true)}
        aria-label={task.completed ? "Als offen markieren" : "Als erledigt markieren"}
      />
      <div className="min-w-0 flex-1">
        <span
          className={cn(
            "text-sm",
            task.completed && "text-neutral-400 line-through"
          )}
        >
          {task.title}
        </span>
        {task.due_date && (
          <span
            className={cn(
              "ml-2 text-xs",
              overdue ? "font-medium text-red-600" : "text-neutral-500"
            )}
          >
            fällig {formatDate(task.due_date)}
            {overdue && " · überfällig"}
          </span>
        )}
      </div>
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
