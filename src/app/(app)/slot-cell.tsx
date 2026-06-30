"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WeekSlot } from "@/lib/models";
import { assignSlot } from "./planner-actions";
import { MealCombobox } from "./meal-combobox";

const SLOT_LABEL = { LUNCH: "Midi", DINNER: "Soir" } as const;

export function SlotCell({ weekId, slot }: { weekId: string; slot: WeekSlot }) {
  const [open, setOpen] = useState(false);
  const [mealId, setMealId] = useState<string | null>(slot.meal?.id ?? null);
  const [mealName, setMealName] = useState<string | undefined>(slot.meal?.name);
  const [servings, setServings] = useState(slot.servings);
  const [pending, startTransition] = useTransition();

  function reset() {
    setMealId(slot.meal?.id ?? null);
    setMealName(slot.meal?.name);
    setServings(slot.servings);
  }

  function save(nextMealId: string | null) {
    startTransition(async () => {
      const res = await assignSlot(weekId, slot.id, nextMealId, servings);
      if (res.ok) {
        setOpen(false);
        toast.success(nextMealId ? "Créneau mis à jour" : "Créneau vidé");
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) reset();
      }}
    >
      <DialogTrigger
        render={
          <button
            type="button"
            className="flex min-h-16 w-full flex-col items-start justify-center gap-0.5 rounded-md border border-dashed p-2 text-left text-sm transition-colors hover:border-solid hover:bg-muted/50"
          >
            {slot.meal ? (
              <>
                <span className="font-medium">{slot.meal.name}</span>
                <span className="text-xs text-muted-foreground">{slot.servings} portion(s)</span>
              </>
            ) : (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Plus className="size-3.5" />
                Ajouter
              </span>
            )}
          </button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{SLOT_LABEL[slot.slot]} — assigner un repas</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Repas</Label>
            <MealCombobox
              value={mealId ?? undefined}
              label={mealName}
              onSelect={(meal) => {
                setMealId(meal.id);
                setMealName(meal.name);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slot-servings">Portions</Label>
            <Input
              id="slot-servings"
              type="number"
              min="1"
              value={servings}
              onChange={(e) => {
                const n = Math.floor(Number(e.target.value));
                setServings(Number.isFinite(n) && n >= 1 ? n : 1);
              }}
              className="w-24"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => save(null)}
            disabled={pending || !slot.meal}
          >
            Vider
          </Button>
          <Button type="button" onClick={() => save(mealId)} disabled={pending || !mealId}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
