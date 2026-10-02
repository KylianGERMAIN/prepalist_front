"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Relit la page serveur toutes les `intervalMs` tant que l'onglet est visible, et
 * dès qu'il revient au premier plan. Onglet caché : aucun appel, la base Neon
 * peut se mettre en veille. Une coche optimiste en cours survit au rafraîchissement :
 * `useOptimistic` la garde tant que son action n'est pas terminée.
 */
export function useLiveRefresh(intervalMs: number) {
  const router = useRouter();

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    function start() {
      stop();
      timer = setInterval(() => router.refresh(), intervalMs);
    }
    function stop() {
      if (timer !== undefined) clearInterval(timer);
      timer = undefined;
    }
    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        router.refresh();
        start();
      } else {
        stop();
      }
    }

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [router, intervalMs]);
}
