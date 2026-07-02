"use client";

import { useMemo, useState } from "react";
import { FolderOpen, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentList } from "@/components/documents/document-list";
import { DOCUMENT_CATEGORIES, DOCUMENT_CATEGORY_META } from "@/lib/constants";
import { useAllDocuments } from "@/lib/queries/documents";
import { useProperties } from "@/lib/queries/properties";
import type { DocumentCategory } from "@/types/database";

const ALL = "__all__";

export function DocumentsPage() {
  const { data: documents, isLoading } = useAllDocuments();
  const { data: properties } = useProperties();

  const [category, setCategory] = useState<string>(ALL);
  const [propertyId, setPropertyId] = useState<string>(ALL);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (documents ?? []).filter((d) => {
      if (category !== ALL && d.category !== (category as DocumentCategory)) {
        return false;
      }
      if (propertyId !== ALL && d.property_id !== propertyId) return false;
      if (term && !d.file_name.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [documents, category, propertyId, search]);

  if (isLoading) return <Skeleton className="h-72 w-full" />;

  if ((documents ?? []).length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-sm text-neutral-400">
          <FolderOpen className="size-6" />
          <p>Noch keine Dokumente hochgeladen.</p>
          <p>
            Unterlagen lädst du direkt am Objekt hoch — im Tab „Dokumente“ der
            jeweiligen Immobilie.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Dateiname suchen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 pl-8"
          />
        </div>
        <Select value={category} onValueChange={(v) => setCategory(v ?? ALL)}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Alle Kategorien</SelectItem>
            {DOCUMENT_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {DOCUMENT_CATEGORY_META[c].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={propertyId} onValueChange={(v) => setPropertyId(v ?? ALL)}>
          <SelectTrigger className="w-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Alle Objekte</SelectItem>
            {(properties ?? []).map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="ml-auto text-sm text-neutral-400">
          {filtered.length} von {(documents ?? []).length} Dokumenten
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-400">
          Keine Dokumente passen zu den Filtern.
        </p>
      ) : (
        <DocumentList documents={filtered} showProperty />
      )}
    </div>
  );
}
