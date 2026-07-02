"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  INACTIVE_STATUSES,
  PROPERTY_STATUSES,
  SOURCE_META,
  SOURCES,
  STATUS_META,
} from "@/lib/constants";
import { nextOpenTask, nextPlannedViewing, wasContacted } from "@/lib/derive";
import { toISODate } from "@/lib/format";
import type { EnrichedProperty } from "@/types";
import type { PropertySource, PropertyStatus } from "@/types/database";

// ---------------------------------------------------------------------------
// Filter-State
// ---------------------------------------------------------------------------

export type ContactedFilter = "alle" | "ja" | "nein";

export type FilterState = {
  search: string;
  cities: string[];
  statuses: PropertyStatus[];
  source: PropertySource | "alle";
  priceMin: number | null;
  priceMax: number | null;
  areaMin: number | null;
  areaMax: number | null;
  yieldMin: number | null;
  scoreMin: number | null;
  cashflowPositive: boolean;
  followUpDue: boolean;
  viewingPlanned: boolean;
  contacted: ContactedFilter;
  showInactive: boolean;
};

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  cities: [],
  statuses: [],
  source: "alle",
  priceMin: null,
  priceMax: null,
  areaMin: null,
  areaMax: null,
  yieldMin: null,
  scoreMin: null,
  cashflowPositive: false,
  followUpDue: false,
  viewingPlanned: false,
  contacted: "alle",
  showInactive: false,
};

// URL-Param-Namen (kurz, deutsch, bookmark-freundlich)
const PARAM = {
  search: "q",
  cities: "ort",
  statuses: "status",
  source: "quelle",
  priceMin: "pmin",
  priceMax: "pmax",
  areaMin: "fmin",
  areaMax: "fmax",
  yieldMin: "rmin",
  scoreMin: "smin",
  cashflowPositive: "cfpos",
  followUpDue: "faellig",
  viewingPlanned: "besichtigung",
  contacted: "kontaktiert",
  showInactive: "inaktive",
} as const;

type ParamsLike = Pick<URLSearchParams, "get">;

function numParam(params: ParamsLike, key: string): number | null {
  const raw = params.get(key);
  if (!raw) return null;
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function parseFilters(params: ParamsLike): FilterState {
  const cities = (params.get(PARAM.cities) ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  const statuses = (params.get(PARAM.statuses) ?? "")
    .split(",")
    .filter((s): s is PropertyStatus =>
      (PROPERTY_STATUSES as string[]).includes(s)
    );
  const rawSource = params.get(PARAM.source);
  const source: FilterState["source"] =
    rawSource && (SOURCES as string[]).includes(rawSource)
      ? (rawSource as PropertySource)
      : "alle";
  const rawContacted = params.get(PARAM.contacted);
  const contacted: ContactedFilter =
    rawContacted === "ja" || rawContacted === "nein" ? rawContacted : "alle";

  return {
    search: params.get(PARAM.search) ?? "",
    cities,
    statuses,
    source,
    priceMin: numParam(params, PARAM.priceMin),
    priceMax: numParam(params, PARAM.priceMax),
    areaMin: numParam(params, PARAM.areaMin),
    areaMax: numParam(params, PARAM.areaMax),
    yieldMin: numParam(params, PARAM.yieldMin),
    scoreMin: numParam(params, PARAM.scoreMin),
    cashflowPositive: params.get(PARAM.cashflowPositive) === "1",
    followUpDue: params.get(PARAM.followUpDue) === "1",
    viewingPlanned: params.get(PARAM.viewingPlanned) === "1",
    contacted,
    showInactive: params.get(PARAM.showInactive) === "1",
  };
}

export function serializeFilters(f: FilterState): string {
  const params = new URLSearchParams();
  if (f.search.trim()) params.set(PARAM.search, f.search.trim());
  if (f.cities.length) params.set(PARAM.cities, f.cities.join(","));
  if (f.statuses.length) params.set(PARAM.statuses, f.statuses.join(","));
  if (f.source !== "alle") params.set(PARAM.source, f.source);
  if (f.priceMin != null) params.set(PARAM.priceMin, String(f.priceMin));
  if (f.priceMax != null) params.set(PARAM.priceMax, String(f.priceMax));
  if (f.areaMin != null) params.set(PARAM.areaMin, String(f.areaMin));
  if (f.areaMax != null) params.set(PARAM.areaMax, String(f.areaMax));
  if (f.yieldMin != null) params.set(PARAM.yieldMin, String(f.yieldMin));
  if (f.scoreMin != null) params.set(PARAM.scoreMin, String(f.scoreMin));
  if (f.cashflowPositive) params.set(PARAM.cashflowPositive, "1");
  if (f.followUpDue) params.set(PARAM.followUpDue, "1");
  if (f.viewingPlanned) params.set(PARAM.viewingPlanned, "1");
  if (f.contacted !== "alle") params.set(PARAM.contacted, f.contacted);
  if (f.showInactive) params.set(PARAM.showInactive, "1");
  return params.toString();
}

/** Anzahl aktiver (= vom Default abweichender) Filter — für das Zähler-Badge */
export function countActiveFilters(f: FilterState): number {
  let n = 0;
  if (f.search.trim()) n++;
  if (f.cities.length) n++;
  if (f.statuses.length) n++;
  if (f.source !== "alle") n++;
  if (f.priceMin != null || f.priceMax != null) n++;
  if (f.areaMin != null || f.areaMax != null) n++;
  if (f.yieldMin != null) n++;
  if (f.scoreMin != null) n++;
  if (f.cashflowPositive) n++;
  if (f.followUpDue) n++;
  if (f.viewingPlanned) n++;
  if (f.contacted !== "alle") n++;
  if (f.showInactive) n++;
  return n;
}

// ---------------------------------------------------------------------------
// Pure Filter-Logik (client-seitig auf den enriched Rows)
// ---------------------------------------------------------------------------

export function applyFilters(
  rows: EnrichedProperty[],
  filters: FilterState
): EnrichedProperty[] {
  const search = filters.search.trim().toLowerCase();
  const today = toISODate(new Date());

  return rows.filter((r) => {
    const p = r.property;

    // Verworfene/abgelehnte/gekaufte Objekte nur bei aktivem Schalter
    if (!filters.showInactive && INACTIVE_STATUSES.includes(p.status)) {
      return false;
    }

    if (search) {
      const haystack = [p.title, p.street, p.city]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    if (filters.cities.length && !filters.cities.includes(p.city)) return false;
    if (filters.statuses.length && !filters.statuses.includes(p.status)) {
      return false;
    }
    if (filters.source !== "alle" && p.source !== filters.source) return false;

    if (filters.priceMin != null && (p.price == null || p.price < filters.priceMin)) {
      return false;
    }
    if (filters.priceMax != null && (p.price == null || p.price > filters.priceMax)) {
      return false;
    }
    if (
      filters.areaMin != null &&
      (p.living_area == null || p.living_area < filters.areaMin)
    ) {
      return false;
    }
    if (
      filters.areaMax != null &&
      (p.living_area == null || p.living_area > filters.areaMax)
    ) {
      return false;
    }
    if (
      filters.yieldMin != null &&
      (r.finance.grossYield == null || r.finance.grossYield < filters.yieldMin)
    ) {
      return false;
    }
    if (
      filters.scoreMin != null &&
      (r.score.score == null || r.score.score < filters.scoreMin)
    ) {
      return false;
    }

    if (
      filters.cashflowPositive &&
      (r.finance.cashflow == null || r.finance.cashflow < 0)
    ) {
      return false;
    }

    if (filters.followUpDue) {
      const task = nextOpenTask(p);
      if (!task?.due_date || task.due_date > today) return false;
    }

    if (filters.viewingPlanned && !nextPlannedViewing(p)) return false;

    if (filters.contacted !== "alle") {
      const contacted = wasContacted(p);
      if (filters.contacted === "ja" && !contacted) return false;
      if (filters.contacted === "nein" && contacted) return false;
    }

    return true;
  });
}

// ---------------------------------------------------------------------------
// Hook: FilterState <-> URL-Search-Params
// ---------------------------------------------------------------------------

export function usePropertyFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  const setFilters = useCallback(
    (patch: Partial<FilterState>) => {
      const query = serializeFilters({ ...filters, ...patch });
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [filters, pathname, router]
  );

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  return {
    filters,
    setFilters,
    resetFilters,
    activeCount: countActiveFilters(filters),
  };
}

// ---------------------------------------------------------------------------
// UI-Bausteine
// ---------------------------------------------------------------------------

function NumberField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-neutral-500">{label}</Label>
      <Input
        type="number"
        inputMode="decimal"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") return onChange(null);
          const n = Number(raw);
          onChange(Number.isFinite(n) ? n : null);
        }}
        className="h-8"
      />
    </div>
  );
}

function SwitchRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
      <span>{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}

/** Filter-Toolbar über der Immobilien-Tabelle. State lebt in den URL-Params. */
export function PropertyFilters({ cityOptions }: { cityOptions: string[] }) {
  const { filters, setFilters, resetFilters, activeCount } =
    usePropertyFilters();

  // Suchfeld: lokaler State + Debounce, damit nicht jeder Tastendruck die URL ersetzt.
  // Ändert sich die URL extern (Back-Button, Zurücksetzen), wird das Feld beim Rendern synchronisiert.
  const [searchInput, setSearchInput] = useState(filters.search);
  const [lastUrlSearch, setLastUrlSearch] = useState(filters.search);
  if (filters.search !== lastUrlSearch) {
    setLastUrlSearch(filters.search);
    setSearchInput(filters.search);
  }
  useEffect(() => {
    if (searchInput === filters.search) return;
    const t = setTimeout(() => setFilters({ search: searchInput }), 250);
    return () => clearTimeout(t);
  }, [searchInput, filters.search, setFilters]);

  function toggleCity(city: string, checked: boolean) {
    setFilters({
      cities: checked
        ? [...filters.cities, city]
        : filters.cities.filter((c) => c !== city),
    });
  }

  function toggleStatus(status: PropertyStatus, checked: boolean) {
    setFilters({
      statuses: checked
        ? [...filters.statuses, status]
        : filters.statuses.filter((s) => s !== status),
    });
  }

  const moreCount =
    (filters.priceMin != null || filters.priceMax != null ? 1 : 0) +
    (filters.areaMin != null || filters.areaMax != null ? 1 : 0) +
    (filters.yieldMin != null ? 1 : 0) +
    (filters.scoreMin != null ? 1 : 0) +
    (filters.cashflowPositive ? 1 : 0) +
    (filters.followUpDue ? 1 : 0) +
    (filters.viewingPlanned ? 1 : 0) +
    (filters.contacted !== "alle" ? 1 : 0) +
    (filters.showInactive ? 1 : 0);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Suche */}
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-neutral-400" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Suchen (Titel, Straße, Ort)…"
          className="h-8 w-56 pl-8"
        />
      </div>

      {/* Ort (Multi-Select) */}
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
          Ort
          {filters.cities.length > 0 && (
            <Badge className="ml-1 h-4 min-w-4 rounded-full px-1 text-[10px]">
              {filters.cities.length}
            </Badge>
          )}
          <ChevronDown className="size-3.5 text-neutral-400" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-48">
          {cityOptions.length === 0 && (
            <div className="px-2 py-1.5 text-xs text-neutral-500">
              Keine Orte vorhanden
            </div>
          )}
          {cityOptions.map((city) => (
            <DropdownMenuCheckboxItem
              key={city}
              checked={filters.cities.includes(city)}
              onCheckedChange={(checked) => toggleCity(city, checked)}
            >
              {city}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status (Multi-Select) */}
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
          Status
          {filters.statuses.length > 0 && (
            <Badge className="ml-1 h-4 min-w-4 rounded-full px-1 text-[10px]">
              {filters.statuses.length}
            </Badge>
          )}
          <ChevronDown className="size-3.5 text-neutral-400" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-56">
          {PROPERTY_STATUSES.map((status) => (
            <DropdownMenuCheckboxItem
              key={status}
              checked={filters.statuses.includes(status)}
              onCheckedChange={(checked) => toggleStatus(status, checked)}
            >
              {STATUS_META[status].label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Quelle */}
      <Select
        value={filters.source}
        onValueChange={(v) =>
          setFilters({ source: (v as FilterState["source"]) ?? "alle" })
        }
      >
        <SelectTrigger size="sm" className="min-w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="alle">Alle Quellen</SelectItem>
          {SOURCES.map((s) => (
            <SelectItem key={s} value={s}>
              {SOURCE_META[s].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Mehr Filter */}
      <Popover>
        <PopoverTrigger render={<Button variant="outline" size="sm" />}>
          <SlidersHorizontal className="size-3.5" />
          Mehr Filter
          {moreCount > 0 && (
            <Badge className="ml-1 h-4 min-w-4 rounded-full px-1 text-[10px]">
              {moreCount}
            </Badge>
          )}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80">
          <div className="grid grid-cols-2 gap-2">
            <NumberField
              label="Preis min (€)"
              value={filters.priceMin}
              onChange={(v) => setFilters({ priceMin: v })}
              placeholder="0"
            />
            <NumberField
              label="Preis max (€)"
              value={filters.priceMax}
              onChange={(v) => setFilters({ priceMax: v })}
              placeholder="∞"
            />
            <NumberField
              label="Fläche min (m²)"
              value={filters.areaMin}
              onChange={(v) => setFilters({ areaMin: v })}
              placeholder="0"
            />
            <NumberField
              label="Fläche max (m²)"
              value={filters.areaMax}
              onChange={(v) => setFilters({ areaMax: v })}
              placeholder="∞"
            />
            <NumberField
              label="Rendite min (%)"
              value={filters.yieldMin}
              onChange={(v) => setFilters({ yieldMin: v })}
              placeholder="z. B. 4,5"
            />
            <NumberField
              label="Score min"
              value={filters.scoreMin}
              onChange={(v) => setFilters({ scoreMin: v })}
              placeholder="0–100"
            />
          </div>
          <Separator />
          <div className="space-y-2.5">
            <SwitchRow
              label="Nur Cashflow positiv"
              checked={filters.cashflowPositive}
              onCheckedChange={(v) => setFilters({ cashflowPositive: v })}
            />
            <SwitchRow
              label="Nachfassen fällig"
              checked={filters.followUpDue}
              onCheckedChange={(v) => setFilters({ followUpDue: v })}
            />
            <SwitchRow
              label="Besichtigung geplant"
              checked={filters.viewingPlanned}
              onCheckedChange={(v) => setFilters({ viewingPlanned: v })}
            />
            <div className="flex items-center justify-between gap-3 text-sm">
              <span>Kontaktiert</span>
              <Select
                value={filters.contacted}
                onValueChange={(v) =>
                  setFilters({
                    contacted: (v as ContactedFilter) ?? "alle",
                  })
                }
              >
                <SelectTrigger size="sm" className="min-w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alle">Alle</SelectItem>
                  <SelectItem value="ja">Ja</SelectItem>
                  <SelectItem value="nein">Nein</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <SwitchRow
              label="Verworfene anzeigen"
              checked={filters.showInactive}
              onCheckedChange={(v) => setFilters({ showInactive: v })}
            />
          </div>
        </PopoverContent>
      </Popover>

      {/* Aktive Filter + Zurücksetzen */}
      {activeCount > 0 && (
        <>
          <Badge className="border-transparent bg-green-100 text-green-800">
            {activeCount} {activeCount === 1 ? "Filter" : "Filter"} aktiv
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchInput("");
              resetFilters();
            }}
          >
            <X className="size-3.5" />
            Zurücksetzen
          </Button>
        </>
      )}
    </div>
  );
}
