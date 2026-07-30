"use client";

import { useOptimistic, useTransition } from "react";
import { Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Meal, Plan, PlanSlot } from "@/lib/models";
import { ClearPlanButton, GeneratePlanButton } from "./plan-actions";
import { SlotCell } from "./slot-cell";
import { assignSlot } from "./planner-actions";
import { currentDayIndex, dayLabel, slotsReducer } from "./planner-utils";

/** Créneau absent du plan : placeholder passif, juste le moment. */
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

export function PlanGrid({ plan }: { plan: Plan }) {
  const [optimisticSlots, dispatch] = useOptimistic(plan.slots, slotsReducer);
  const [, startTransition] = useTransition();

  function handleUndo(slotId: string, meal: Meal, servings: number) {
    startTransition(async () => {
      dispatch({ type: "assign", slotId, meal, servings });
      const res = await assignSlot(slotId, meal.id, servings);
      if (!res.ok) toast.error(res.error);
    });
  }

  function handleClear(slot: PlanSlot) {
    if (!slot.meal) return;
    const meal = slot.meal;
    const servings = slot.servings;
    startTransition(async () => {
      dispatch({ type: "clear", slotId: slot.id });
      const res = await assignSlot(slot.id, null);
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
  function handleDuplicate(slot: PlanSlot) {
    if (!slot.meal || slot.slot !== "DINNER") return;
    const target = optimisticSlots.find(
      (s) => s.dayIndex === slot.dayIndex + 1 && s.slot === "LUNCH",
    );
    if (!target) return;
    const meal = slot.meal;
    const servings = slot.servings;
    startTransition(async () => {
      dispatch({ type: "assign", slotId: target.id, meal, servings });
      const res = await assignSlot(target.id, meal.id, servings);
      if (res.ok) toast.success("Reporté au midi du lendemain");
      else toast.error(res.error);
    });
  }

  // Index des créneaux par jour + moment, pour retrouver le slot d'une cellule.
  const byKey = new Map<string, PlanSlot>();
  for (const slot of optimisticSlots) {
    byKey.set(`${slot.dayIndex}_${slot.slot}`, slot);
  }
  const days = Array.from({ length: plan.dayCount }, (_, i) => i);
  const todayIndex = currentDayIndex(plan.startDate, plan.dayCount);

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
          // Report proposé seulement vers un midi de lendemain qui existe ET est libre
          // (pas d'écrasement silencieux, et rien le dernier jour du plan).
          const nextLunch = byKey.get(`${dayIndex + 1}_LUNCH`);
          const canDuplicate = !!nextLunch && !nextLunch.meal;
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
                  <SlotCell slot={lunch} onClear={handleClear} />
                ) : (
                  <EmptySlot moment="LUNCH" />
                )}
                {dinner ? (
                  <SlotCell
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
