"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Rendered only while a recommendation is 'pending'. Refreshes the server
// component every few seconds; once status changes the page re-renders without
// this component and polling stops.
export function PendingPoller({ intervalMs = 4000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(t);
  }, [router, intervalMs]);
  return null;
}
