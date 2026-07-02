"use client";

import { useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PartyPopper } from "lucide-react";
import { PriorityBadge } from "@/components/properties/badges";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { isOverdue } from "@/lib/derive";
import { formatDate, toISODate } from "@/lib/format";
import { useUpdateTask, type TaskWithProperty } from "@/lib/queries/tasks";
import { cn } from "@/lib/utils";

export function DueTodayCard({ tasks }: { tasks: TaskWithProperty[] }) {
  const due = useMemo(() => {
    const today = toISODate(new Date());
    return tasks
      .filter((t) => !t.completed && t.due_date != null && t.due_date <= today)
      .sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? ""));
  }, [tasks]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Heute fällig {due.length > 0 && `(${due.length})`}
        </CardTitle>
        <CardAction>
          <Link
            href="/aufgaben"
            className="text-sm text-green-700 hover:underline"
          >
            Alle Aufgaben →
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {due.length === 0 ? (
          <div className="flex h-24 flex-col items-center justify-center gap-1 text-sm text-neutral-400">
            <PartyPopper className="size-5 text-green-600" />
            Nichts fällig — gut so!
          </div>
        ) : (
          <ul className="divide-y">
            {due.map((t) => (
              <DueTaskLine key={t.id} task={t} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function DueTaskLine({ task }: { task: TaskWithProperty }) {
  const updateTask = useUpdateTask();
  const overdue = isOverdue(task.due_date);

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
              onSuccess: () => toast.success("Aufgabe erledigt"),
              onError: () => toast.error("Aufgabe konnte nicht aktualisiert werden"),
            }
          )
        }
        aria-label="Als erledigt markieren"
      />
      <div className="min-w-0 flex-1">
        <span className="text-sm">{task.title}</span>
        {task.properties && (
          <Link
            href={`/immobilien/${task.properties.id}`}
            className="ml-2 text-xs text-green-700 hover:underline"
          >
            {task.properties.title}
          </Link>
        )}
      </div>
      <span
        className={cn(
          "shrink-0 text-xs tabular-nums",
          overdue ? "font-medium text-red-600" : "text-neutral-500"
        )}
        title={overdue ? "Überfällig" : undefined}
      >
        {formatDate(task.due_date)}
      </span>
      <PriorityBadge priority={task.priority} />
    </li>
  );
}
