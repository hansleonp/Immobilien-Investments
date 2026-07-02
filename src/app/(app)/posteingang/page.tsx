import { ComingSoon, PageHeader } from "@/components/layout/page-header";

export default function PosteingangPage() {
  return (
    <>
      <PageHeader
        title="Posteingang"
        description="Neue Inserate aus deinen Suchagenten-E-Mails"
      />
      <ComingSoon milestone="M11" />
    </>
  );
}
