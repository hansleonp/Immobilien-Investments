"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDeleteMarketPrice,
  useMarketPrices,
  useSaveMarketPrice,
} from "@/lib/queries/settings";
import { LOCATION_CLASSES, LOCATION_CLASS_META } from "@/lib/constants";
import type { LocationClass, MarketPriceRow } from "@/types/database";

/** Sentinel-Wert für „keine Lage" — Base-UI-Select mag keine leeren string-Values */
const NO_CLASS = "__none__";

function PriceRow({ row }: { row: MarketPriceRow }) {
  const save = useSaveMarketPrice();
  const remove = useDeleteMarketPrice();
  const [price, setPrice] = useState(String(row.price_per_sqm));
  const [rent, setRent] = useState(row.rent_per_sqm != null ? String(row.rent_per_sqm) : "");

  const dirty =
    Number(price) !== row.price_per_sqm ||
    (rent === "" ? null : Number(rent)) !== row.rent_per_sqm;

  function handleSave() {
    const priceNum = Number(price);
    if (!priceNum || priceNum <= 0) {
      toast.error("Bitte einen gültigen Kaufpreis je m² angeben");
      return;
    }
    save.mutate(
      {
        id: row.id,
        city: row.city,
        price_per_sqm: priceNum,
        rent_per_sqm: rent === "" ? null : Number(rent),
        location_class: row.location_class,
      },
      { onSuccess: () => toast.success(`${row.city} aktualisiert`) }
    );
  }

  function handleLocationChange(value: string | null) {
    const next = value == null || value === NO_CLASS ? null : (value as LocationClass);
    if (next === row.location_class) return;
    save.mutate(
      {
        id: row.id,
        city: row.city,
        price_per_sqm: row.price_per_sqm,
        rent_per_sqm: row.rent_per_sqm,
        location_class: next,
      },
      { onSuccess: () => toast.success(`${row.city} aktualisiert`) }
    );
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{row.city}</TableCell>
      <TableCell>
        <Input
          type="number"
          step="50"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="h-8 w-28"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          step="0.5"
          value={rent}
          placeholder="—"
          onChange={(e) => setRent(e.target.value)}
          className="h-8 w-24"
        />
      </TableCell>
      <TableCell>
        <Select
          value={row.location_class ?? NO_CLASS}
          onValueChange={handleLocationChange}
        >
          <SelectTrigger size="sm" className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_CLASS}>–</SelectItem>
            {LOCATION_CLASSES.map((c) => (
              <SelectItem key={c} value={c}>
                {LOCATION_CLASS_META[c].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          {dirty && (
            <Button size="sm" onClick={handleSave} disabled={save.isPending}>
              Speichern
            </Button>
          )}
          <Button
            size="icon-sm"
            variant="ghost"
            title="Löschen"
            onClick={() =>
              remove.mutate(row.id, {
                onSuccess: () => toast.success(`${row.city} entfernt`),
              })
            }
          >
            <Trash2 className="size-3.5 text-neutral-400" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function MarketPricesCard() {
  const { data: prices, isLoading } = useMarketPrices();
  const save = useSaveMarketPrice();
  const [newCity, setNewCity] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newRent, setNewRent] = useState("");
  const [newClass, setNewClass] = useState<string>(NO_CLASS);

  function handleAdd() {
    const priceNum = Number(newPrice);
    if (!newCity.trim() || !priceNum || priceNum <= 0) {
      toast.error("Bitte Stadt und Kaufpreis je m² angeben");
      return;
    }
    save.mutate(
      {
        city: newCity.trim(),
        price_per_sqm: priceNum,
        rent_per_sqm: newRent === "" ? null : Number(newRent),
        location_class: newClass === NO_CLASS ? null : (newClass as LocationClass),
      },
      {
        onSuccess: () => {
          toast.success(`${newCity.trim()} hinzugefügt`);
          setNewCity("");
          setNewPrice("");
          setNewRent("");
          setNewClass(NO_CLASS);
        },
        onError: (e) =>
          toast.error(
            e.message.includes("duplicate")
              ? "Diese Stadt existiert bereits"
              : "Hinzufügen fehlgeschlagen"
          ),
      }
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Marktpreise</CardTitle>
        <CardDescription>
          Referenzwerte je Stadt — Grundlage für das Score-Kriterium „Preis vs. Markt“
          und die Miet-Plausibilisierung. Bitte regelmäßig selbst pflegen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stadt</TableHead>
              <TableHead>Kaufpreis €/m²</TableHead>
              <TableHead>Kaltmiete €/m²</TableHead>
              <TableHead>Lage</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-neutral-400">
                  Lade…
                </TableCell>
              </TableRow>
            )}
            {prices?.map((row) => <PriceRow key={row.id} row={row} />)}
            <TableRow>
              <TableCell>
                <Input
                  placeholder="Neue Stadt"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="h-8 w-36"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="50"
                  placeholder="z. B. 3400"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="h-8 w-28"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="z. B. 11,50"
                  value={newRent}
                  onChange={(e) => setNewRent(e.target.value)}
                  className="h-8 w-24"
                />
              </TableCell>
              <TableCell>
                <Select
                  value={newClass}
                  onValueChange={(v) => setNewClass(v ?? NO_CLASS)}
                >
                  <SelectTrigger size="sm" className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_CLASS}>–</SelectItem>
                    {LOCATION_CLASSES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {LOCATION_CLASS_META[c].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={handleAdd} disabled={save.isPending}>
                  Hinzufügen
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
