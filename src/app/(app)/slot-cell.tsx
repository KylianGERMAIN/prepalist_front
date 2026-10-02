"use client";

import { useRef, useState } from "react";
import { Moon, Plus, Star, Sun, X } from "lucide-react";
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
import type { MealSummary, PlanSlot } from "@/lib/models";
import { MealCombobox } from "./meal-combobox";
import { readAlsoNext, writeAlsoNext } from "./planner-utils";

const SLOT_LABEL = { LUNCH: "Midi", DINNER: "Soir" } as const;

/** `undefined` : dernier créneau du plan, rien après. */
export type NextSlotInfo = { label: string; occupant: string | null };

export function SlotCell({
  slot,
  next,
  onAssign,
  onClear,
}: {
  slot: PlanSlot;
  next?: NextSlotInfo;
  onAssign: (slot: PlanSlot, meal: MealSummary, servings: number, alsoNext: boolean) => void;
  onClear: (slot: PlanSlot) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<MealSummary | null>(slot.meal ?? null);
  const [servings, setServings] = useState(slot.servings);
  const [alsoNext, setAlsoNext] = useState(true);
  const submitRef = useRef<HTMLButtonElement>(null);

  function reset() {
    setSelected(slot.meal ?? null);
    setServings(slot.servings);
    setAlsoNext(readAlsoNext());
  }

  const meal = slot.meal;
  const firstTag = meal?.tags[0];
  const MomentIcon = slot.slot === "LUNCH" ? Sun : Moon;

  return (
    <div className="group relative flex-1">
      {meal && (
        <div className="absolute right-1 top-1 z-10 flex gap-0.5 rounded-md bg-card/95 p-0.5 opacity-0 shadow-sm ring-1 ring-border backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-70">
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
                    className="w-full break-words pr-6 font-medium text-foreground"
                    title={meal.name}
                  >
                    {meal.name}
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

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!selected) return;
              setOpen(false);
              onAssign(slot, selected, servings, alsoNext && !!next);
            }}
          >
            <div className="space-y-2">
              <Label>Repas</Label>
              <MealCombobox
                value={selected?.id}
                label={selected?.name}
                onSelect={setSelected}
                focusAfterSelect={submitRef}
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
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={alsoNext && !!next}
                disabled={!next}
                onChange={(e) => {
                  setAlsoNext(e.target.checked);
                  writeAlsoNext(e.target.checked);
                }}
                className="mt-0.5 size-4 accent-accent"
              />
              <span className={cn(!next && "text-muted-foreground")}>
                {next ? (
                  <>
                    Aussi pour {next.label}
                    {next.occupant && (
                      <span className="text-muted-foreground"> (remplace {next.occupant})</span>
                    )}
                  </>
                ) : (
                  "Dernier créneau du plan : rien après"
                )}
              </span>
            </label>

            <DialogFooter className="gap-2 sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setOpen(false);
                  onClear(slot);
                }}
                disabled={!meal}
              >
                Vider
              </Button>
              <Button ref={submitRef} type="submit" disabled={!selected}>
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
