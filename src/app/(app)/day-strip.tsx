"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { cn } from "@/lib/utils";

export type StripDay = { index: number; label: string; filled: number; isToday: boolean };

const MOBILE = "(max-width: 639px)";

/** Vrai sous le point de rupture `sm`, où le planning affiche un jour par écran. */
export function useIsMobile(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(MOBILE);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(MOBILE).matches,
    () => false,
  );
}

/**
 * Suit le jour visible d'un conteneur à défilement horizontal et y place
 * `initialDay` au montage. Les jours portent `data-day={index}`.
 */
export function useVisibleDay(container: RefObject<HTMLElement | null>, initialDay: number) {
  const [visible, setVisible] = useState(initialDay);
  // Pendant un défilement lancé par `show`, les jours traversés ne doivent pas s'allumer.
  const scriptedUntil = useRef(0);

  useEffect(() => {
    const root = container.current;
    if (!root) return;
    root.querySelector(`[data-day="${initialDay}"]`)?.scrollIntoView({ inline: "start", block: "nearest" });
    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < scriptedUntil.current) return;
        for (const entry of entries) {
          // `isIntersecting` vaut true dès un pixel visible : le voisin l'emporterait.
          if (entry.intersectionRatio >= 0.6) setVisible(Number((entry.target as HTMLElement).dataset.day));
        }
      },
      { root, threshold: 0.6 },
    );
    root.querySelectorAll("[data-day]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [container, initialDay]);

  function show(day: number) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scriptedUntil.current = Date.now() + (reduce ? 0 : 700);
    container.current
      ?.querySelector(`[data-day="${day}"]`)
      ?.scrollIntoView({ inline: "start", block: "nearest", behavior: reduce ? "auto" : "smooth" });
    setVisible(day);
  }

  return [visible, show] as const;
}

export function DayStrip({
  days,
  active,
  onSelect,
}: {
  days: StripDay[];
  active: number;
  onSelect: (day: number) => void;
}) {
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: React.KeyboardEvent) {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = Math.min(days.length - 1, Math.max(0, active + step));
    onSelect(next);
    tabs.current[next]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label="Jours"
      onKeyDown={onKeyDown}
      className="grid auto-cols-fr grid-flow-col gap-1 sm:hidden"
    >
      {days.map((day) => (
        <button
          key={day.index}
          ref={(el) => {
            tabs.current[day.index] = el;
          }}
          id={`day-tab-${day.index}`}
          type="button"
          role="tab"
          aria-selected={day.index === active}
          aria-controls={`day-${day.index}`}
          aria-current={day.isToday ? "date" : undefined}
          tabIndex={day.index === active ? 0 : -1}
          onClick={() => onSelect(day.index)}
          className={cn(
            "flex flex-col items-center gap-1 rounded-md py-2 text-xs",
            day.index === active ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            day.isToday && day.index !== active && "font-medium text-primary",
          )}
        >
          {day.label}
          <span className="flex gap-0.5" aria-hidden>
            {[0, 1].map((i) => (
              <span
                key={i}
                className={cn("size-1 rounded-full bg-current", i >= day.filled && "opacity-25")}
              />
            ))}
          </span>
          <span className="sr-only">
            , {day.filled} repas sur 2{day.isToday ? ", aujourd’hui" : ""}
          </span>
        </button>
      ))}
    </div>
  );
}
