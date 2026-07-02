import { PageHeader } from "@/components/layout/page-header";
import { ViewingsPage } from "@/components/viewings/viewings-page";

export default function BesichtigungenPage() {
  return (
    <>
      <PageHeader title="Besichtigungen" description="Geplante und vergangene Termine" />
      <ViewingsPage />
    </>
  );
}
