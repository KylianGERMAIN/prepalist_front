"use client";

import { useState, type ReactElement } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatUnit } from "@/lib/units";
import type { Meal } from "@/lib/models";
import { getMeal } from "./actions";

/** Fiche en lecture, ouverte à tous les comptes : la liste ne porte qu'un résumé. */
export function MealDetailsDialog({
  mealId,
  trigger,
}: {
  mealId: string;
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [meal, setMeal] = useState<Meal | null>(null);
  const [failed, setFailed] = useState(false);

  async function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) return;
    setFailed(false);
    const full = await getMeal(mealId);
    setMeal(full);
    setFailed(!full);
  }

  const loading = open && !failed && meal?.id !== mealId;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{meal?.id === mealId ? meal.name : "Fiche repas"}</DialogTitle>
        </DialogHeader>
        {failed ? (
          <p className="text-sm text-destructive">Repas introuvable.</p>
        ) : loading || !meal ? (
          <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Chargement…
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            {meal.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {meal.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
            <section className="space-y-1.5">
              <h3 className="font-medium">Ingrédients (pour une portion)</h3>
              {meal.ingredients.length === 0 ? (
                <p className="text-muted-foreground">Aucun ingrédient pour l’instant.</p>
              ) : (
                <ul className="space-y-0.5">
                  {meal.ingredients.map((line) => (
                    <li key={line.id} className="flex justify-between gap-4">
                      <span>{line.ingredient.name}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {line.quantity} {formatUnit(line.quantity, line.unit)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            {meal.description ? (
              <section className="space-y-1.5">
                <h3 className="font-medium">Description</h3>
                <p className="whitespace-pre-line text-muted-foreground">{meal.description}</p>
              </section>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
