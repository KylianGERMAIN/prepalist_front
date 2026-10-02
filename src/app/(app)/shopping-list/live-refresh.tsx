"use client";

import { useLiveRefresh } from "@/hooks/use-live-refresh";

const INTERVAL_MS = 15_000;

/** Plusieurs appareils sur le même compte : la liste se met à jour sans recharger. */
export function LiveRefresh() {
  useLiveRefresh(INTERVAL_MS);
  return null;
}
