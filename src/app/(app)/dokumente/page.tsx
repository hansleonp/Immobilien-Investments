import { PageHeader } from "@/components/layout/page-header";
import { DocumentsPage } from "@/components/documents/documents-page";

export default function DokumentePage() {
  return (
    <>
      <PageHeader title="Dokumente" description="Alle Unterlagen über alle Objekte" />
      <DocumentsPage />
    </>
  );
}
