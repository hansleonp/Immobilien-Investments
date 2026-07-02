import { PageHeader } from "@/components/layout/page-header";
import { InboxPage } from "@/components/inbox/inbox-page";

export default function PosteingangPage() {
  return (
    <>
      <PageHeader
        title="Posteingang"
        description="Neue Inserate aus deinen Suchagenten-E-Mails"
      />
      <InboxPage />
    </>
  );
}
