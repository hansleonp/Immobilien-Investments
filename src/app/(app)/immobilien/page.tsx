import { ComingSoon, PageHeader } from "@/components/layout/page-header";

export default function ImmobilienPage() {
  return (
    <>
      <PageHeader title="Immobilien" description="Alle erfassten Objekte im Überblick" />
      <ComingSoon milestone="M3" />
    </>
  );
}
