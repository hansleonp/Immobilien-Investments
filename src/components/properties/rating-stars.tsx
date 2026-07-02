"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  value,
  onChange,
  label,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="w-32 text-sm text-neutral-600">{label}</span>}
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? null : n)}
            className="p-0.5"
            title={`${n} von 5`}
          >
            <Star
              className={cn(
                "size-5 transition-colors",
                value != null && n <= value
                  ? "fill-amber-400 text-amber-400"
                  : "text-neutral-300 hover:text-amber-300"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
