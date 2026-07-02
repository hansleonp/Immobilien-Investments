import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { PropertyWizard } from "@/components/wizard/property-wizard";
import { Skeleton } from "@/components/ui/skeleton";

export default function NeueImmobiliePage() {
  return (
    <>
      <PageHeader
        title="Immobilie hinzufügen"
        description="Link einfügen oder manuell erfassen — die Bewertung rechnet live mit"
      />
      <Suspense fallback={<Skeleton className="h-96 w-full max-w-3xl" />}>
        <PropertyWizard />
      </Suspense>
    </>
  );
}
