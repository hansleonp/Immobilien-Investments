"use client";

import { PageHeader } from "@/components/layout/page-header";
import { FinancingForm } from "@/components/settings/financing-form";
import { GoalForm } from "@/components/settings/goal-form";
import { MarketPricesCard } from "@/components/settings/market-prices-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/lib/queries/settings";

export default function EinstellungenPage() {
  const { data: settings, isLoading, isError } = useSettings();

  return (
    <>
      <PageHeader
        title="Einstellungen"
        description="Finanzierungsannahmen, Marktpreise und Ziele"
      />
      {isLoading && (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full max-w-3xl" />
          <Skeleton className="h-40 w-full max-w-3xl" />
        </div>
      )}
      {isError && (
        <p className="text-sm text-red-600">
          Einstellungen konnten nicht geladen werden. Ist die Datenbank erreichbar?
        </p>
      )}
      {settings && (
        <div className="max-w-3xl space-y-6">
          <FinancingForm settings={settings} />
          <MarketPricesCard />
          <GoalForm settings={settings} />
        </div>
      )}
    </>
  );
}
