"use client";

import Link from "next/link";
import { CalendarCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { addDays, todayIso } from "./planner-utils";

/**
 * Navigation de semaine (← / →) pilotée par l'URL (`?week=`). La cohérence
 * planner ↔ liste est portée par la nav globale, qui conserve `?week=`.
 * `basePath` = "/" (planner) ou "/shopping-list".
 */
export function WeekNav({
  startDate,
  basePath,
}: {
  startDate: string;
  basePath: "/" | "/shopping-list";
}) {
  const today = todayIso();
  const isCurrent = today >= startDate && today < addDays(startDate, 7);

  return (
    <div className="flex items-center gap-1">
      <Link
        href={`${basePath}?week=${addDays(startDate, -7)}`}
        aria-label="Semaine précédente"
        className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
      >
        <ChevronLeft className="size-4" />
      </Link>
      <Link
        href={`${basePath}?week=${addDays(startDate, 7)}`}
        aria-label="Semaine suivante"
        className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
      >
        <ChevronRight className="size-4" />
      </Link>
      {isCurrent ? (
        <span className="ml-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
          <CalendarCheck className="size-4" />
          Semaine courante
        </span>
      ) : (
        <Link
          href={basePath}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "ml-1")}
        >
          <CalendarCheck className="mr-1 size-4" />
          Semaine courante
        </Link>
      )}
    </div>
  );
}
