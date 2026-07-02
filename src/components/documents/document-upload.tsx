"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, UploadCloud } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DOCUMENT_CATEGORIES, DOCUMENT_CATEGORY_META } from "@/lib/constants";
import { useUploadDocument } from "@/lib/queries/documents";
import { cn } from "@/lib/utils";
import type { DocumentCategory } from "@/types/database";

const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "webp", "heic"];
const ACCEPT = ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(",");

function isAllowed(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ALLOWED_EXTENSIONS.includes(ext);
}

export function DocumentUpload({
  propertyId,
  viewingId,
  defaultCategory = "sonstiges",
}: {
  propertyId: string;
  viewingId?: string | null;
  defaultCategory?: DocumentCategory;
}) {
  const upload = useUploadDocument();
  const inputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<DocumentCategory>(defaultCategory);
  const [dragOver, setDragOver] = useState(false);
  const [uploadingName, setUploadingName] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    if (files.length === 0) return;
    // Mehrere Dateien nacheinander hochladen
    for (const file of files) {
      if (!isAllowed(file)) {
        toast.error(`„${file.name}“: nur PDF, JPG, PNG, WEBP oder HEIC`);
        continue;
      }
      setUploadingName(file.name);
      try {
        await upload.mutateAsync({ propertyId, file, category, viewingId });
        toast.success(`„${file.name}“ hochgeladen`);
      } catch (err) {
        toast.error(
          err instanceof Error && err.message
            ? err.message
            : `„${file.name}“ konnte nicht hochgeladen werden`
        );
      }
    }
    setUploadingName(null);
  }

  return (
    <div className="flex flex-wrap items-stretch gap-3">
      <div
        role="button"
        tabIndex={0}
        aria-label="Dateien hochladen"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex min-h-24 min-w-64 flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-5 text-center text-sm transition-colors",
          dragOver
            ? "border-green-600 bg-green-50 text-green-700"
            : "border-neutral-300 text-neutral-500 hover:border-green-500 hover:text-neutral-700"
        )}
      >
        {uploadingName ? (
          <>
            <Loader2 className="size-5 animate-spin text-green-700" />
            <span className="max-w-full truncate">
              Lade „{uploadingName}“ hoch …
            </span>
          </>
        ) : (
          <>
            <UploadCloud className="size-5" />
            <span>
              Dateien hierher ziehen oder <span className="font-medium text-green-700">klicken</span>
            </span>
            <span className="text-xs text-neutral-400">
              PDF, JPG, PNG, WEBP, HEIC — max. 10 MB pro Datei
            </span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <div className="w-56 space-y-2">
        <Label>Kategorie</Label>
        <Select
          value={category}
          onValueChange={(v) => setCategory((v as DocumentCategory) ?? "sonstiges")}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DOCUMENT_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {DOCUMENT_CATEGORY_META[c].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-neutral-400">
          Gilt für die nächsten Uploads.
        </p>
      </div>
    </div>
  );
}
