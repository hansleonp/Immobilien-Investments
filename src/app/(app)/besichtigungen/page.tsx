import { ComingSoon, PageHeader } from "@/components/layout/page-header";

export default function BesichtigungenPage() {
  return (
    <>
      <PageHeader title="Besichtigungen" description="Geplante und vergangene Termine" />
      <ComingSoon milestone="M5" />
    </>
  );
}
