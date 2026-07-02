"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentList } from "@/components/documents/document-list";
import { DocumentUpload } from "@/components/documents/document-upload";
import { usePropertyDocuments } from "@/lib/queries/documents";
import type { PropertyWithRelations } from "@/types";

export function TabDokumente({ property }: { property: PropertyWithRelations }) {
  const { data: documents, isLoading } = usePropertyDocuments(property.id);

  return (
    <div className="max-w-4xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dokument hochladen</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentUpload propertyId={property.id} />
        </CardContent>
      </Card>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <DocumentList documents={documents ?? []} />
      )}
    </div>
  );
}
