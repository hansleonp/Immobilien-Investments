"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Building2,
  CalendarCheck,
  CheckSquare,
  FileText,
  Home,
  Inbox,
  LayoutDashboard,
  LogOut,
  Settings,
  Target,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/immobilien", label: "Immobilien", icon: Building2 },
  { href: "/aufgaben", label: "Aufgaben", icon: CheckSquare },
  { href: "/besichtigungen", label: "Besichtigungen", icon: CalendarCheck },
  { href: "/dokumente", label: "Dokumente", icon: FileText },
  { href: "/posteingang", label: "Posteingang", icon: Inbox },
  { href: "/ziele", label: "Ziele", icon: Target },
  { href: "/einstellungen", label: "Einstellungen", icon: Settings },
];

export function AppSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r bg-white">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-green-700 text-white">
          <Home className="size-5" />
        </div>
        <div>
          <div className="text-base font-semibold leading-tight">ImmoFinder</div>
          <div className="text-xs text-neutral-500">Dein Investment-Cockpit</div>
        </div>
      </div>

      <div className="px-3 pb-2">
        <Button
          className="w-full bg-green-700 hover:bg-green-800"
          render={<Link href="/immobilien/neu" />}
        >
          + Immobilie hinzufügen
        </Button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-green-50 text-green-800"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t px-3 py-3">
        <div className="flex items-center justify-between gap-2 px-2">
          <div className="truncate text-xs text-neutral-500">{userEmail}</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            title="Abmelden"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
