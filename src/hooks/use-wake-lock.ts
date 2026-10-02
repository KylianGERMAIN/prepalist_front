"use client";

import { useEffect, useSyncExternalStore } from "react";

const noSubscribe = () => () => {};

/**
 * Garde l'écran allumé tant que `active`. Renvoie `false` si le navigateur n'a pas
 * la Screen Wake Lock API : l'écran peut alors se mettre en veille.
 */
export function useWakeLock(active: boolean): boolean {
  const supported = useSyncExternalStore(noSubscribe, () => "wakeLock" in navigator, () => true);

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
      } catch {
        // Refus (batterie faible, onglet caché) : on retente au retour au premier plan.
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

  return supported;
}
