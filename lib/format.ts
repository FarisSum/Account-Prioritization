// Small presentation helpers shared by the dashboard and detail views.

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatCompactCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function formatPercent(n: number): string {
  return `${n > 0 ? "+" : ""}${n}%`;
}

/** 2_400_000 -> "2.4M", 340_000 -> "340K". */
export function formatCompact(n: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/** A signed delta count, e.g. +4 / 0. */
export function formatSignedCount(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}

/** Whole days from `asOf` to an ISO date. Future dates are positive. */
export function daysUntil(dateISO: string | null, asOf: Date = new Date()): number | null {
  if (!dateISO) return null;
  const target = new Date(`${dateISO}T00:00:00Z`).getTime();
  const now = Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), asOf.getUTCDate());
  return Math.round((target - now) / 86_400_000);
}

/** Whole days since an ISO date. Past dates are positive. */
export function daysSince(dateISO: string | null, asOf: Date = new Date()): number | null {
  const d = daysUntil(dateISO, asOf);
  return d === null ? null : -d;
}

/** Signed days -> "in 12d" / "today" / "8d ago". */
export function formatRelativeDays(days: number | null): string {
  if (days === null) return "—";
  if (days === 0) return "today";
  if (days > 0) return `in ${days}d`;
  return `${Math.abs(days)}d ago`;
}

export function formatMonthYear(dateISO: string | null): string {
  if (!dateISO) return "—";
  return new Date(`${dateISO}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function formatTimestamp(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(dateISO: string | null): string {
  if (!dateISO) return "—";
  return new Date(`${dateISO}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
