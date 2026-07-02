"use client";

import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { enrichProperty } from "@/lib/finance/enrich";
import { useProperties } from "@/lib/queries/properties";
import { useMarketPrices, useSettings } from "@/lib/queries/settings";
import { GoalHero } from "./goal-hero";
import { GoalTimeline } from "./goal-timeline";
import { PipelineFunnel } from "./pipeline-funnel";
import { PurchasedList } from "./purchased-list";

export function GoalsOverview() {
  const { data: properties } = useProperties();
  const { data: settings } = useSettings();
  const { data: marketPrices } = useMarketPrices();

  const enriched = useMemo(() => {
    if (!properties || !settings || !marketPrices) return [];
    return properties.map((p) => enrichProperty(p, settings, marketPrices));
  }, [properties, settings, marketPrices]);

  if (!properties || !settings || !marketPrices) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const purchased = enriched.filter((r) => r.property.status === "gekauft");

  return (
    <div className="space-y-6">
      <GoalHero purchased={purchased.length} settings={settings} />
      <GoalTimeline purchased={purchased} goalYear={settings.goal_year} />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <PurchasedList purchased={purchased} />
        <PipelineFunnel rows={enriched} />
      </div>
    </div>
  );
}
