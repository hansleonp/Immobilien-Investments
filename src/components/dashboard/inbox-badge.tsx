"use client";

import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";
import { useInboxCount } from "@/lib/queries/inbox";

/** Dezenter Hinweis-Banner: "N neue Inserate im Posteingang" (nur wenn N > 0) */
export function InboxBadge() {
  const { data: count } = useInboxCount();
  if (!count) return null;

  return (
    <Link
      href="/posteingang"
      className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-900 transition-colors hover:bg-green-100"
    >
      <Inbox className="size-4 shrink-0" />
      <span className="font-medium">
        {count === 1
          ? "1 neues Inserat im Posteingang"
          : `${count} neue Inserate im Posteingang`}
      </span>
      <ArrowRight className="ml-auto size-4 shrink-0" />
    </Link>
  );
}
