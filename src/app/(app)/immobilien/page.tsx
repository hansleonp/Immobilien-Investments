import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { PropertyTable } from "@/components/properties/property-table";
import { Button } from "@/components/ui/button";

export default function ImmobilienPage() {
  return (
    <>
      <PageHeader
        title="Immobilien"
        description="Alle erfassten Objekte im Überblick"
        actions={
          <Button
            className="bg-green-700 hover:bg-green-800"
            render={<Link href="/immobilien/neu" />}
          >
            + Immobilie hinzufügen
          </Button>
        }
      />
      <PropertyTable />
    </>
  );
}
