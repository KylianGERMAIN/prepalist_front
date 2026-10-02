"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const noSubscribe = () => () => {};

/**
 * Garde l'écran allumé tant que `active`. Renvoie `false` si le navigateur n'a pas
 * la Screen Wake Lock API ou refuse le verrou : l'écran peut alors se mettre en veille.
 */
export function useWakeLock(active: boolean): boolean {
  const supported = useSyncExternalStore(noSubscribe, () => "wakeLock" in navigator, () => true);
  const [refused, setRefused] = useState(false);

  useEffect(() => {
    if (!active || !supported) return;
    let sentinel: WakeLockSentinel | null = null;
    let pending = false;
    let cancelled = false;

    async function request() {
      if (pending || (sentinel && !sentinel.released)) return;
      pending = true;
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) void lock.release();
        else sentinel = lock;
        if (!cancelled) setRefused(false);
      } catch {
        // Refus (économiseur de batterie, onglet caché) : on retente au retour au premier plan.
        if (!cancelled) setRefused(true);
      } finally {
        pending = false;
      }
    }
    // Le navigateur relâche le verrou dès que l'onglet passe en arrière-plan.
    function onVisibilityChange() {
      if (document.visibilityState === "visible") void request();
    }

    void request();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      void sentinel?.release();
    };
  }, [active, supported]);

  return supported && !(active && refused);
}
