"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ExternalLink, File, FileText, Image as ImageIcon, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DOCUMENT_CATEGORY_META } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { getDocumentUrl, useDeleteDocument } from "@/lib/queries/documents";
import type { DocumentRow, PropertyRow } from "@/types/database";

export type DocumentListItem = DocumentRow & {
  properties?: Pick<PropertyRow, "id" | "title"> | null;
};

export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null || Number.isNaN(bytes)) return "—";
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toLocaleString("de-DE", {
      maximumFractionDigits: 1,
    })} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function isPdf(doc: DocumentRow): boolean {
  return (
    doc.file_type?.includes("pdf") === true ||
    doc.file_name.toLowerCase().endsWith(".pdf")
  );
}

function isImage(doc: DocumentRow): boolean {
  return (
    doc.file_type?.startsWith("image/") === true ||
    /\.(jpe?g|png|webp|heic|gif)$/i.test(doc.file_name)
  );
}

function FileIcon({ doc }: { doc: DocumentRow }) {
  if (isPdf(doc)) return <FileText className="size-4 text-red-500" />;
  if (isImage(doc)) return <ImageIcon className="size-4 text-sky-600" />;
  return <File className="size-4 text-neutral-400" />;
}

async function openDocument(doc: DocumentRow) {
  try {
    const url = await getDocumentUrl(doc.storage_path);
    window.open(url, "_blank", "noopener,noreferrer");
  } catch {
    toast.error("Dokument konnte nicht geöffnet werden");
  }
}

export function DocumentList({
  documents,
  showProperty = false,
}: {
  documents: DocumentListItem[];
  showProperty?: boolean;
}) {
  const deleteDocument = useDeleteDocument();
  const [toDelete, setToDelete] = useState<DocumentListItem | null>(null);

  if (documents.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-neutral-400">
        Keine Dokumente vorhanden.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datei</TableHead>
              <TableHead>Kategorie</TableHead>
              {showProperty && <TableHead>Objekt</TableHead>}
              <TableHead className="text-right">Größe</TableHead>
              <TableHead>Hochgeladen</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => void openDocument(doc)}
                    className="flex max-w-72 items-center gap-2 text-left hover:underline"
                    title={doc.file_name}
                  >
                    <FileIcon doc={doc} />
                    <span className="truncate text-sm font-medium">
                      {doc.file_name}
                    </span>
                  </button>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {DOCUMENT_CATEGORY_META[doc.category].label}
                  </Badge>
                </TableCell>
                {showProperty && (
                  <TableCell>
                    {doc.properties ? (
                      <Link
                        href={`/immobilien/${doc.properties.id}`}
                        className="text-sm text-green-700 hover:underline"
                      >
                        {doc.properties.title}
                      </Link>
                    ) : (
                      <span className="text-sm text-neutral-400">—</span>
                    )}
                  </TableCell>
                )}
                <TableCell className="text-right text-sm tabular-nums text-neutral-500">
                  {formatFileSize(doc.file_size)}
                </TableCell>
                <TableCell className="text-sm text-neutral-500">
                  {formatDate(doc.uploaded_at)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Öffnen"
                      title="In neuem Tab öffnen"
                      onClick={() => void openDocument(doc)}
                    >
                      <ExternalLink className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Löschen"
                      className="text-neutral-400 hover:text-red-600"
                      onClick={() => setToDelete(doc)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={toDelete !== null}
        onOpenChange={(open) => {
          if (!open) setToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dokument löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              „{toDelete?.file_name}“ wird dauerhaft gelöscht. Das kann nicht
              rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteDocument.isPending}
              onClick={() => {
                if (!toDelete) return;
                deleteDocument.mutate(toDelete, {
                  onSuccess: () => {
                    toast.success("Dokument gelöscht");
                    setToDelete(null);
                  },
                  onError: () =>
                    toast.error("Dokument konnte nicht gelöscht werden"),
                });
              }}
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
