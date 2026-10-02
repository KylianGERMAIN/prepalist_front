"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { cn } from "@/lib/utils";

export type StripDay = { index: number; label: string; filled: number; isToday: boolean };

/**
 * Suit le jour visible d'un conteneur à défilement horizontal (mobile) et y
 * place `initialDay` au montage. Les jours portent `data-day={index}`.
 */
export function useVisibleDay(container: RefObject<HTMLElement | null>, initialDay: number) {
  const [visible, setVisible] = useState(initialDay);

  useEffect(() => {
    const root = container.current;
    if (!root) return;
    const start = root.querySelector<HTMLElement>(`[data-day="${initialDay}"]`);
    if (start) root.scrollTo({ left: start.offsetLeft - root.offsetLeft });
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setVisible(Number((entry.target as HTMLElement).dataset.day));
        }
      },
      { root, threshold: 0.6 },
    );
    root.querySelectorAll("[data-day]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [container, initialDay]);

  function show(day: number) {
    const root = container.current;
    const el = root?.querySelector<HTMLElement>(`[data-day="${day}"]`);
    if (!root || !el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.scrollTo({ left: el.offsetLeft - root.offsetLeft, behavior: reduce ? "auto" : "smooth" });
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
    <div role="tablist" aria-label="Jours" onKeyDown={onKeyDown} className="grid grid-cols-7 gap-1 sm:hidden">
      {days.map((day) => (
        <button
          key={day.index}
          ref={(el) => {
            tabs.current[day.index] = el;
          }}
          type="button"
          role="tab"
          aria-selected={day.index === active}
          aria-controls={`day-${day.index}`}
          tabIndex={day.index === active ? 0 : -1}
          onClick={() => onSelect(day.index)}
          className={cn(
            "flex flex-col items-center gap-1 rounded-md py-1.5 text-xs",
            day.index === active ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            day.isToday && day.index !== active && "font-medium text-primary",
          )}
        >
          {day.label}
          <span className="flex gap-0.5" aria-hidden>
            {[0, 1].map((i) => (
              <span
                key={i}
                className={cn("size-1 rounded-full", i < day.filled ? "bg-current" : "bg-current opacity-25")}
              />
            ))}
          </span>
          <span className="sr-only">{day.filled} repas sur 2</span>
        </button>
      ))}
    </div>
  );
}
