"use client";

import { useLiveRefresh } from "@/hooks/use-live-refresh";

const INTERVAL_MS = 15_000;
// Une tablette restée allumée sur la liste ne doit pas garder Neon éveillé.
const IDLE_MS = 10 * 60_000;

/** Plusieurs appareils sur le même compte : la liste se met à jour sans recharger. */
export function LiveRefresh() {
  useLiveRefresh(INTERVAL_MS, IDLE_MS);
  return null;
}
