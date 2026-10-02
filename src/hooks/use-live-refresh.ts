"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Relit la page serveur toutes les `intervalMs` tant que l'onglet est visible et
 * qu'on s'en est servi depuis moins de `idleMs` ; onglet caché ou délaissé : aucun
 * appel, la base Neon peut se mettre en veille.
 */
export function useLiveRefresh(intervalMs: number, idleMs: number) {
  const router = useRouter();

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    let lastActivity = Date.now();

    function tick() {
      if (Date.now() - lastActivity >= idleMs) {
        stop();
        return;
      }
      router.refresh();
    }
    function start() {
      stop();
      timer = setInterval(tick, intervalMs);
    }
    function stop() {
      if (timer !== undefined) clearInterval(timer);
      timer = undefined;
    }
    function onActivity() {
      const wasIdle = timer === undefined && document.visibilityState === "visible";
      lastActivity = Date.now();
      if (wasIdle) {
        router.refresh();
        start();
      }
    }
    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        lastActivity = Date.now();
        router.refresh();
        start();
      } else {
        stop();
      }
    }

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("pointerdown", onActivity);
    document.addEventListener("keydown", onActivity);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("pointerdown", onActivity);
      document.removeEventListener("keydown", onActivity);
    };
  }, [router, intervalMs, idleMs]);
}
