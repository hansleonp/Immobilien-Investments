import { ComingSoon, PageHeader } from "@/components/layout/page-header";

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Überblick über deine Immobiliensuche" />
      <ComingSoon milestone="M6" />
    </>
  );
}
