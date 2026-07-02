import { GoalsOverview } from "@/components/goals/goals-overview";
import { PageHeader } from "@/components/layout/page-header";

export default function ZielePage() {
  return (
    <>
      <PageHeader
        title="Ziele"
        description="Dein Fortschritt auf dem Weg zum Kaufziel"
      />
      <GoalsOverview />
    </>
  );
}
