"use client";

import { useOptimistic, useTransition } from "react";
import { Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Meal, Week, WeekSlot } from "@/lib/models";
import { GenerateWeekButton } from "./week-actions";
import { SlotCell } from "./slot-cell";
import { assignSlot } from "./planner-actions";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

/** Ajoute n jours à une date ISO (YYYY-MM-DD) et renvoie la nouvelle date ISO, sans dérive de fuseau. */
function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Date du jour au format ISO local (YYYY-MM-DD), pour marquer le jour courant. */
function todayIso(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

type SlotAction =
  | { type: "clear"; slotId: string }
  | { type: "assign"; slotId: string; meal: Meal; servings: number };

function slotsReducer(state: WeekSlot[], action: SlotAction): WeekSlot[] {
  return state.map((s) => {
    if (s.id !== action.slotId) return s;
    if (action.type === "clear") return { ...s, meal: null, mealId: null };
    return {
      ...s,
      meal: action.meal,
      mealId: action.meal.id,
      servings: action.servings,
    };
  });
}

/** Créneau non généré (semaine sans slots) : placeholder passif, juste le moment. */
function EmptySlot({ moment }: { moment: WeekSlot["slot"] }) {
  return (
    <div className="flex min-h-16 flex-1 items-start gap-1 rounded-md border border-dashed border-border p-2 text-xs text-muted-foreground opacity-60">
      {moment === "LUNCH" ? (
        <Sun className="size-3.5" />
      ) : (
        <Moon className="size-3.5" />
      )}
    </div>
  );
}

export function WeekGrid({ week }: { week: Week }) {
  const [optimisticSlots, dispatch] = useOptimistic(week.slots, slotsReducer);
  const [, startTransition] = useTransition();

  function handleUndo(slotId: string, meal: Meal, servings: number) {
    startTransition(async () => {
      dispatch({ type: "assign", slotId, meal, servings });
      const res = await assignSlot(week.id, slotId, meal.id, servings);
      if (!res.ok) toast.error(res.error);
    });
  }

  function handleClear(slot: WeekSlot) {
    if (!slot.meal) return;
    const meal = slot.meal;
    const servings = slot.servings;
    startTransition(async () => {
      dispatch({ type: "clear", slotId: slot.id });
      const res = await assignSlot(week.id, slot.id, null);
      if (res.ok) {
        toast.success("Créneau vidé", {
          action: {
            label: "Annuler",
            onClick: () => handleUndo(slot.id, meal, servings),
          },
        });
      } else {
        toast.error(res.error);
      }
    });
  }

  // Report des restes du dîner vers le déjeuner du lendemain.
  function handleDuplicate(slot: WeekSlot) {
    if (!slot.meal || slot.slot !== "DINNER") return;
    const nextDay = addDays(slot.date.slice(0, 10), 1);
    const target = optimisticSlots.find(
      (s) => s.date.slice(0, 10) === nextDay && s.slot === "LUNCH",
    );
    if (!target) return;
    const meal = slot.meal;
    const servings = slot.servings;
    startTransition(async () => {
      dispatch({ type: "assign", slotId: target.id, meal, servings });
      const res = await assignSlot(week.id, target.id, meal.id, servings);
      if (res.ok) toast.success("Reporté au midi de demain");
      else toast.error(res.error);
    });
  }

  // Index des créneaux par jour + moment, pour retrouver le slot d'une cellule.
  const byKey = new Map<string, WeekSlot>();
  for (const slot of optimisticSlots) {
    byKey.set(`${slot.date.slice(0, 10)}_${slot.slot}`, slot);
  }
  const days = Array.from({ length: 7 }, (_, i) => addDays(week.startDate, i));
  const today = todayIso();
  const startLabel = new Date(`${week.startDate}T00:00:00`).toLocaleDateString(
    "fr-FR",
    { day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl tracking-tight">
          Semaine du {startLabel}
        </h1>
        <GenerateWeekButton weekId={week.id} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {days.map((iso, i) => {
          const isToday = iso === today;
          const lunch = byKey.get(`${iso}_LUNCH`);
          const dinner = byKey.get(`${iso}_DINNER`);
          const canDuplicate = byKey.has(`${addDays(iso, 1)}_LUNCH`);
          return (
            <div
              key={iso}
              className={cn(
                "flex h-full flex-col gap-2 rounded-lg border border-transparent p-1.5",
                isToday && "border-primary/20 bg-primary/5",
              )}
            >
              <div
                className={cn(
                  "text-center font-heading text-sm",
                  isToday ? "font-medium text-primary" : "text-foreground",
                )}
              >
                {DAYS[i]}{" "}
                <span
                  className={cn("tnum", !isToday && "text-muted-foreground")}
                >
                  {iso.slice(8, 10)}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {lunch ? (
                  <SlotCell
                    weekId={week.id}
                    slot={lunch}
                    onClear={handleClear}
                  />
                ) : (
                  <EmptySlot moment="LUNCH" />
                )}
                {dinner ? (
                  <SlotCell
                    weekId={week.id}
                    slot={dinner}
                    onClear={handleClear}
                    onDuplicate={canDuplicate ? handleDuplicate : undefined}
                  />
                ) : (
                  <EmptySlot moment="DINNER" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
