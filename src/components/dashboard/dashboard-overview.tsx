"use client";

import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { enrichProperty } from "@/lib/finance/enrich";
import { useProperties } from "@/lib/queries/properties";
import { useMarketPrices, useSettings } from "@/lib/queries/settings";
import { useAllTasks } from "@/lib/queries/tasks";
import { useAllViewings } from "@/lib/queries/viewings";
import { DueTodayCard } from "./due-today-card";
import { GoalProgressCard } from "./goal-progress-card";
import { InboxBadge } from "./inbox-badge";
import { KpiCards } from "./kpi-cards";
import { TopDealsCard } from "./top-deals-card";
import { UpcomingViewingsCard } from "./upcoming-viewings-card";

export function DashboardOverview() {
  const { data: properties } = useProperties();
  const { data: settings } = useSettings();
  const { data: marketPrices } = useMarketPrices();
  const { data: tasks } = useAllTasks();
  const { data: viewings } = useAllViewings();

  const enriched = useMemo(() => {
    if (!properties || !settings || !marketPrices) return [];
    return properties.map((p) => enrichProperty(p, settings, marketPrices));
  }, [properties, settings, marketPrices]);

  if (!properties || !settings || !marketPrices || !tasks || !viewings) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InboxBadge />
      <KpiCards rows={enriched} viewings={viewings} />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <DueTodayCard tasks={tasks} />
          <UpcomingViewingsCard viewings={viewings} />
        </div>
        <div className="space-y-6">
          <TopDealsCard rows={enriched} />
          <GoalProgressCard rows={enriched} settings={settings} />
        </div>
      </div>
    </div>
  );
}
