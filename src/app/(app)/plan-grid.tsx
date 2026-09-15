"use client";

import { useOptimistic, useTransition } from "react";
import { Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { MealSummary, Plan, PlanSlot } from "@/lib/models";
import { ClearPlanButton, GeneratePlanButton } from "./plan-actions";
import { SlotCell } from "./slot-cell";
import { assignSlot } from "./planner-actions";
import { dayLabel, slotsReducer } from "./planner-utils";

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
}: {
  plan: Plan;
  todayIndex: number | null;
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
          // Report proposé seulement vers un midi libre : pas d'écrasement silencieux.
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
