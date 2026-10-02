"use client";

import { useRef, useState } from "react";
import { CircleAlert, MapPin, Moon, Plus, Star, Sun, X } from "lucide-react";
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
import { Input, inputClassName } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { MealSummary, PlanSlot } from "@/lib/models";
import { MealCombobox } from "./meal-combobox";
import { MealDetailsDialog } from "./meals/meal-details-dialog";
import { readAlsoNext, writeAlsoNext } from "./planner-utils";

const SLOT_LABEL = { LUNCH: "Midi", DINNER: "Soir" } as const;

export type NextSlotInfo = {
  label: string;
  occupant: Pick<MealSummary, "id" | "name"> | null;
  away: boolean;
};

export function SlotCell({
  slot,
  next,
  canCreateMeals = false,
  moveTargets,
  onAssign,
  onAway,
  onMove,
  onClear,
}: {
  slot: PlanSlot;
  canCreateMeals?: boolean;
  /** Absent : dernier créneau du plan, rien après. */
  next?: NextSlotInfo;
  onAssign: (slot: PlanSlot, meal: MealSummary, servings: number, alsoNext: boolean) => void;
  onAway: (slot: PlanSlot, alsoNext: boolean) => void;
  /** Alternative au glisser-déposer : sur petit écran ou au clavier. */
  moveTargets: { id: string; label: string }[];
  onMove: (slotId: string, targetSlotId: string) => void;
  onClear: (slot: PlanSlot) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<MealSummary | null>(slot.meal ?? null);
  const [servings, setServings] = useState(slot.servings);
  const [alsoNext, setAlsoNext] = useState(true);
  const [moveTo, setMoveTo] = useState("");
  const submitRef = useRef<HTMLButtonElement>(null);

  function reset() {
    setSelected(slot.meal ?? null);
    setServings(slot.servings);
    setAlsoNext(readAlsoNext());
    setMoveTo("");
  }

  const meal = slot.meal;
  const firstTag = meal?.tags[0];
  const MomentIcon = slot.slot === "LUNCH" ? Sun : Moon;

  return (
    <div className="group relative flex-1">
      {(meal || slot.away) && (
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
                slot.away
                  ? "border border-transparent bg-muted text-muted-foreground hover:bg-muted/70"
                  : meal
                    ? "border border-l-4 border-border border-l-accent bg-card shadow-sm hover:bg-muted/40"
                    : "border border-dashed border-border text-muted-foreground hover:border-l-4 hover:border-l-accent hover:bg-muted/40",
              )}
            >
              {slot.away ? (
                <span className="flex items-center gap-1 pr-6">
                  <MomentIcon className="size-3.5 shrink-0" />
                  <MapPin className="size-3.5 shrink-0" />
                  Dehors
                </span>
              ) : meal ? (
                <>
                  <span
                    className="w-full break-words pr-6 font-medium text-foreground"
                    title={meal.name}
                  >
                    {meal.name}
                  </span>
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 pr-6 text-xs text-muted-foreground">
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
                    {meal.ingredientCount === 0 && (
                      <span title="Ingrédients à compléter" className="text-warning-foreground">
                        <CircleAlert role="img" aria-label="Ingrédients à compléter" className="size-3.5" />
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
                canCreate={canCreateMeals}
              />
              {selected ? (
                <MealDetailsDialog
                  mealId={selected.id}
                  trigger={
                    <button type="button" className="text-xs text-muted-foreground underline-offset-4 hover:underline">
                      Voir la fiche
                    </button>
                  }
                />
              ) : null}
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
                    Aussi {next.label}
                    {next.away && <span className="text-muted-foreground"> (prévu dehors)</span>}
                    {next.occupant && (
                      <span className="text-muted-foreground">
                        {next.occupant.id === selected?.id
                          ? " (déjà prévu)"
                          : ` (remplace ${next.occupant.name})`}
                      </span>
                    )}
                  </>
                ) : (
                  "Dernier créneau du plan : rien après"
                )}
              </span>
            </label>

            {meal || slot.away ? (
              <div className="space-y-2">
                <Label htmlFor={`move-${slot.id}`}>Déplacer vers</Label>
                {/* Validation par bouton : sur Windows, une flèche sur un select fermé
                    change déjà sa valeur. */}
                <div className="flex gap-2">
                  <select
                    id={`move-${slot.id}`}
                    value={moveTo}
                    onChange={(e) => setMoveTo(e.target.value)}
                    className={cn(inputClassName, "flex-1")}
                  >
                    <option value="">Choisir un créneau…</option>
                    {moveTargets
                      .filter((t) => t.id !== slot.id)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!moveTo}
                    onClick={() => {
                      setOpen(false);
                      onMove(slot.id, moveTo);
                    }}
                  >
                    Déplacer
                  </Button>
                </div>
              </div>
            ) : null}

            <DialogFooter className="gap-2 sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setOpen(false);
                  onClear(slot);
                }}
                disabled={!meal && !slot.away}
              >
                Vider
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  onAway(slot, alsoNext && !!next);
                }}
                disabled={slot.away}
              >
                <MapPin className="mr-2 size-4" />
                Je mange dehors
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
