"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Eye,
  HandCoins,
  PartyPopper,
  ThumbsUp,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DiscardDialog } from "@/components/properties/discard-dialog";
import { STATUS_META } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { useUpdateProperty } from "@/lib/queries/properties";
import { cn } from "@/lib/utils";
import type { PropertyWithRelations } from "@/types";
import type { PropertyStatus } from "@/types/database";

type DecisionAction = {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  targetStatus: PropertyStatus | null; // null = eigener Handler (Verwerfen)
  accent: string;
};

const ACTIONS: DecisionAction[] = [
  {
    key: "weiter",
    label: "Weiter verfolgen",
    description: "Objekt aktiv weiterverfolgen",
    icon: ThumbsUp,
    targetStatus: "interessant",
    accent: "text-emerald-700",
  },
  {
    key: "beobachten",
    label: "Beobachten",
    description: "Erstmal zurückstellen und im Blick behalten",
    icon: Eye,
    targetStatus: "neu",
    accent: "text-sky-700",
  },
  {
    key: "angebot",
    label: "Angebot abgeben",
    description: "Kaufangebot ist raus",
    icon: HandCoins,
    targetStatus: "angebot_abgegeben",
    accent: "text-orange-700",
  },
  {
    key: "verwerfen",
    label: "Verwerfen",
    description: "Aus der aktiven Suche nehmen",
    icon: Trash2,
    targetStatus: null,
    accent: "text-red-700",
  },
  {
    key: "gekauft",
    label: "Gekauft",
    description: "Notartermin war erfolgreich",
    icon: PartyPopper,
    targetStatus: "gekauft",
    accent: "text-green-700",
  },
];

export function TabEntscheidung({ property }: { property: PropertyWithRelations }) {
  const update = useUpdateProperty();
  const [discardOpen, setDiscardOpen] = useState(false);

  function handleAction(action: DecisionAction) {
    if (action.targetStatus == null) {
      setDiscardOpen(true);
      return;
    }
    if (action.targetStatus === "gekauft") {
      update.mutate(
        {
          id: property.id,
          values: {
            status: "gekauft",
            purchased_at: new Date().toISOString().slice(0, 10),
          },
        },
        {
          onSuccess: () =>
            toast.success("🎉 Glückwunsch zum Kauf!", {
              className: "!bg-green-700 !text-white !border-green-800",
              duration: 6000,
            }),
          onError: () => toast.error("Status konnte nicht geändert werden"),
        }
      );
      return;
    }
    update.mutate(
      { id: property.id, values: { status: action.targetStatus } },
      {
        onSuccess: () =>
          toast.success(`Status: ${STATUS_META[action.targetStatus!].label}`),
        onError: () => toast.error("Status konnte nicht geändert werden"),
      }
    );
  }

  const isActive = (action: DecisionAction) =>
    action.targetStatus === property.status ||
    (action.key === "verwerfen" && property.status === "verworfen");

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-neutral-500">Aktueller Status:</span>
        <Badge variant="secondary" className={STATUS_META[property.status].badge}>
          {STATUS_META[property.status].label}
        </Badge>
        {property.status === "gekauft" && property.purchased_at && (
          <span className="text-neutral-500">
            gekauft am {formatDate(property.purchased_at)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACTIONS.map((action) => {
          const active = isActive(action);
          return (
            <Card
              key={action.key}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                active && "border-green-700 ring-2 ring-green-700/30"
              )}
              onClick={() => handleAction(action)}
            >
              <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
                <action.icon className={cn("size-7", action.accent)} />
                <div className="font-medium">{action.label}</div>
                <p className="text-xs text-neutral-500">{action.description}</p>
                {active && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Aktueller Stand
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DiscardDialog
        property={property}
        open={discardOpen}
        onOpenChange={setDiscardOpen}
      />
    </div>
  );
}
