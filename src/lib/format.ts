import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { de } from "date-fns/locale";

const euroFmt = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const euroCentFmt = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFmt = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });

export function formatEuro(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return euroFmt.format(value);
}

export function formatEuroCents(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return euroCentFmt.format(value);
}

export function formatPercent(value: number | null | undefined, digits = 1): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toLocaleString("de-DE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} %`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return numberFmt.format(value);
}

export function formatSqm(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${numberFmt.format(value)} m²`;
}

export function formatFactor(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  return format(new Date(value), "dd.MM.yyyy", { locale: de });
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  return format(new Date(value), "dd.MM.yyyy, HH:mm", { locale: de });
}

export function formatRelative(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (isToday(date)) return "heute";
  if (isYesterday(date)) return "gestern";
  return formatDistanceToNow(date, { addSuffix: true, locale: de });
}

/** ISO-Datum (yyyy-MM-dd) für date-Inputs und DB-date-Spalten */
export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}
