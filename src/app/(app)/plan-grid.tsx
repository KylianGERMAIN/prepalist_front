"use client";

import { useOptimistic, useTransition } from "react";
import { Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { MealSummary, Plan, PlanSlot } from "@/lib/models";
import { ClearPlanButton, GeneratePlanButton } from "./plan-actions";
import { SlotCell, type NextSlotInfo } from "./slot-cell";
import { assignSlot, setSlotAway } from "./planner-actions";
import { dayLabel, dayName, nextSlotOf, slotsReducer } from "./planner-utils";

// Inatteignable en pratique : le back crée toujours les deux créneaux d'un jour.
// N'existe que parce que `Map.get` rend `PlanSlot | undefined`.
function EmptySlot({ moment }: { moment: PlanSlot["slot"] }) {
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

export function PlanGrid({
  plan,
  todayIndex,
  canCreateMeals = false,
}: {
  plan: Plan;
  todayIndex: number | null;
  canCreateMeals?: boolean;
}) {
  const [optimisticSlots, dispatch] = useOptimistic(plan.slots, slotsReducer);
  const [, startTransition] = useTransition();

  function handleUndo(slotId: string, meal: MealSummary, servings: number) {
    startTransition(async () => {
      dispatch({ type: "assign", slotId, meal, servings });
      const res = await assignSlot(slotId, meal.id, servings);
      if (!res.ok) toast.error(res.error);
    });
  }

  function handleClear(slot: PlanSlot) {
    if (!slot.meal && !slot.away) return;
    const meal = slot.meal;
    const servings = slot.servings;
    startTransition(async () => {
      dispatch({ type: "clear", slotId: slot.id });
      const res = await assignSlot(slot.id, null);
      if (!res.ok) toast.error(res.error);
      else if (meal) {
        toast.success("Créneau vidé", {
          action: { label: "Annuler", onClick: () => handleUndo(slot.id, meal, servings) },
        });
      } else {
        toast.success("Créneau vidé");
      }
    });
  }

  function handleAway(slot: PlanSlot, alsoNext: boolean) {
    const next = alsoNext ? nextSlotOf(optimisticSlots, slot) : undefined;
    // Repas effacés par « dehors », pour que « Annuler » les remette.
    const erased = [slot, next].filter(
      (s): s is PlanSlot & { meal: MealSummary } => !!s?.meal,
    );
    startTransition(async () => {
      dispatch({ type: "setAway", slotId: slot.id });
      if (next) dispatch({ type: "setAway", slotId: next.id });
      const res = await setSlotAway(slot.id, !!next);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(next ? "Deux repas dehors" : "Repas dehors", {
        action:
          erased.length > 0
            ? {
                label: "Annuler",
                onClick: () => erased.forEach((s) => handleUndo(s.id, s.meal, s.servings)),
              }
            : undefined,
      });
    });
  }

  function handleAssign(
    slot: PlanSlot,
    meal: MealSummary,
    servings: number,
    alsoNext: boolean,
  ) {
    const next = alsoNext ? nextSlotOf(optimisticSlots, slot) : undefined;
    const replaced = next?.meal && next.meal.id !== meal.id ? next.meal : null;
    const replacedServings = next?.servings ?? 1;
    startTransition(async () => {
      dispatch({ type: "assign", slotId: slot.id, meal, servings });
      if (next) dispatch({ type: "assign", slotId: next.id, meal, servings });
      const res = await assignSlot(slot.id, meal.id, servings, !!next);
      if (!res.ok) {
        toast.error(res.error);
      } else if (next && replaced) {
        toast.success(`« ${replaced.name} » remplacé`, {
          action: {
            label: "Annuler",
            onClick: () => handleUndo(next.id, replaced, replacedServings),
          },
        });
      } else {
        toast.success(next ? "Créneaux mis à jour" : "Créneau mis à jour");
      }
    });
  }

  function nextInfo(slot: PlanSlot): NextSlotInfo | undefined {
    const next = nextSlotOf(optimisticSlots, slot);
    if (!next) return undefined;
    const moment = next.slot === "LUNCH" ? "midi" : "soir";
    return {
      label: `${dayName(plan.startDate, next.dayIndex)} ${moment}`,
      occupant: next.meal ?? null,
      away: next.away,
    };
  }

  const byKey = new Map<string, PlanSlot>();
  for (const slot of optimisticSlots) {
    byKey.set(`${slot.dayIndex}_${slot.slot}`, slot);
  }
  const days = Array.from({ length: plan.dayCount }, (_, i) => i);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl tracking-tight">Mon plan</h1>
        <div className="flex items-center gap-1">
          <GeneratePlanButton />
          <ClearPlanButton />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {days.map((dayIndex) => {
          const isToday = dayIndex === todayIndex;
          const lunch = byKey.get(`${dayIndex}_LUNCH`);
          const dinner = byKey.get(`${dayIndex}_DINNER`);
          return (
            <div
              key={dayIndex}
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
                {dayLabel(plan.startDate, dayIndex)}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {lunch ? (
                  <SlotCell
                    slot={lunch}
                    next={nextInfo(lunch)}
                    canCreateMeals={canCreateMeals}
                    onAssign={handleAssign}
                    onAway={handleAway}
                    onClear={handleClear}
                  />
                ) : (
                  <EmptySlot moment="LUNCH" />
                )}
                {dinner ? (
                  <SlotCell
                    slot={dinner}
                    next={nextInfo(dinner)}
                    canCreateMeals={canCreateMeals}
                    onAssign={handleAssign}
                    onAway={handleAway}
                    onClear={handleClear}
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
