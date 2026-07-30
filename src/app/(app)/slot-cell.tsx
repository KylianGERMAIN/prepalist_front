"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Copy, Moon, Plus, Star, Sun, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { PlanSlot } from "@/lib/models";
import { assignSlot } from "./planner-actions";
import { cookedRecently } from "./planner-utils";
import { MealCombobox } from "./meal-combobox";

const SLOT_LABEL = { LUNCH: "Midi", DINNER: "Soir" } as const;

export function SlotCell({
  slot,
  onClear,
  onDuplicate,
}: {
  slot: PlanSlot;
  onClear: (slot: PlanSlot) => void;
  onDuplicate?: (slot: PlanSlot) => void;
}) {
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

  function save(nextMealId: string) {
    startTransition(async () => {
      const res = await assignSlot(slot.id, nextMealId, servings);
      if (res.ok) {
        setOpen(false);
        toast.success("Créneau mis à jour");
      } else {
        toast.error(res.error);
      }
    });
  }

  const meal = slot.meal;
  const recent = meal ? cookedRecently(meal.lastCookedAt) : false;
  const firstTag = meal?.tags[0];
  const MomentIcon = slot.slot === "LUNCH" ? Sun : Moon;

  return (
    <div className="group relative flex-1">
      {meal && (
        <div className="absolute right-1 top-1 z-10 flex gap-0.5 rounded-md bg-card/95 p-0.5 opacity-0 shadow-sm ring-1 ring-border backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-70">
          {onDuplicate && (
            <button
              type="button"
              aria-label="Reporter au midi du lendemain"
              title="Reporter au midi du lendemain"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(slot);
              }}
              className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Copy className="size-3.5" />
            </button>
          )}
          <button
            type="button"
            aria-label="Vider le créneau"
            onClick={(e) => {
              e.stopPropagation();
              onClear(slot);
            }}
            className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-destructive"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
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
              className={cn(
                "flex h-full min-h-16 w-full flex-col items-start justify-center gap-0.5 rounded-md p-2 text-left text-sm transition-colors",
                meal
                  ? "border border-l-4 border-border border-l-accent bg-card shadow-sm hover:bg-muted/40"
                  : "border border-dashed border-border text-muted-foreground hover:border-l-4 hover:border-l-accent hover:bg-muted/40",
              )}
            >
              {meal ? (
                <>
                  <span
                    className="flex w-full items-start gap-1 pr-6 font-medium text-foreground"
                    title={meal.name}
                  >
                    {meal.isFavorite && (
                      <Star className="mt-0.5 size-3.5 shrink-0 fill-current text-accent" />
                    )}
                    <span className="break-words">{meal.name}</span>
                  </span>
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    <MomentIcon className="size-3.5 shrink-0" />
                    <span>
                      <span className="tnum">{slot.servings}</span> portion(s)
                    </span>
                    {meal.rating != null && meal.rating > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Star className="size-3 fill-current" />
                        <span className="tnum">{meal.rating}</span>
                      </span>
                    )}
                    {recent && (
                      <span
                        role="img"
                        aria-label="Cuisiné récemment"
                        title="Cuisiné récemment"
                        className="size-1.5 rounded-full bg-accent"
                      />
                    )}
                    {firstTag && (
                      <Badge
                        variant="secondary"
                        className="px-1 py-0 text-[10px]"
                      >
                        {firstTag}
                      </Badge>
                    )}
                  </span>
                </>
              ) : (
                <span className="flex items-center gap-1">
                  <MomentIcon className="size-3.5 shrink-0" />
                  <Plus className="size-3.5" />
                  Ajouter
                </span>
              )}
            </button>
          }
        />
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {SLOT_LABEL[slot.slot]} — assigner un repas
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Repas</Label>
              <MealCombobox
                value={mealId ?? undefined}
                label={mealName}
                onSelect={(m) => {
                  setMealId(m.id);
                  setMealName(m.name);
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
              onClick={() => {
                setOpen(false);
                onClear(slot);
              }}
              disabled={pending || !meal}
            >
              Vider
            </Button>
            <Button
              type="button"
              onClick={() => mealId && save(mealId)}
              disabled={pending || !mealId}
            >
              {pending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
