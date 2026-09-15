"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { ChefHat, Pencil, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { MealSummary } from "@/lib/models";
import { deleteMeal, markCooked, setMealState } from "./actions";
import { MealDialog } from "./meal-dialog";

function favoriteReducer(meals: MealSummary[], mealId: string): MealSummary[] {
  return meals.map((meal) =>
    meal.id === mealId ? { ...meal, isFavorite: !meal.isFavorite } : meal,
  );
}

export function MealsTable({ meals, isAdmin }: { meals: MealSummary[]; isAdmin: boolean }) {
  const [optimisticMeals, toggleOptimistic] = useOptimistic(meals, favoriteReducer);
  const [, startTransition] = useTransition();

  function toggleFavorite(meal: MealSummary) {
    startTransition(async () => {
      toggleOptimistic(meal.id);
      const res = await setMealState(meal.id, { isFavorite: !meal.isFavorite });
      if (res.ok) toast.success(meal.isFavorite ? "Retiré des favoris" : "Ajouté aux favoris");
      else toast.error(res.error);
    });
  }

  if (optimisticMeals.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        {isAdmin ? "Aucun repas. Crée ton premier repas pour commencer." : "Aucun repas."}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Nom</TableHead>
          <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Tags</TableHead>
          <TableHead className="text-center text-xs uppercase tracking-wider text-muted-foreground">Cuisiné</TableHead>
          <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {optimisticMeals.map((meal) => (
          <MealRow
            key={meal.id}
            meal={meal}
            isAdmin={isAdmin}
            onToggleFavorite={() => toggleFavorite(meal)}
          />
        ))}
      </TableBody>
    </Table>
  );
}

function FavoriteToggle({ isFavorite, onToggle }: { isFavorite: boolean; onToggle: () => void }) {
  const label = isFavorite ? "Retirer des favoris" : "Ajouter aux favoris";

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={onToggle}
      aria-pressed={isFavorite}
      aria-label={label}
      title={label}
    >
      <Star
        className={cn("size-4", isFavorite ? "fill-current text-accent" : "text-muted-foreground")}
      />
    </Button>
  );
}

function MealRow({
  meal,
  isAdmin,
  onToggleFavorite,
}: {
  meal: MealSummary;
  isAdmin: boolean;
  onToggleFavorite: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function cook() {
    startTransition(async () => {
      const res = await markCooked(meal.id);
      if (res.ok) toast.success(`« ${meal.name} » marqué cuisiné`);
      else toast.error(res.error);
    });
  }

  return (
    <TableRow>
      <TableCell className="font-medium">
        <span className="flex items-center gap-1">
          <FavoriteToggle isFavorite={meal.isFavorite} onToggle={onToggleFavorite} />
          {meal.name}
        </span>
      </TableCell>
      <TableCell>
        <span className="flex flex-wrap gap-1">
          {meal.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </span>
      </TableCell>
      <TableCell className="text-center">{meal.timesCooked}×</TableCell>
      <TableCell className="text-right">
        <span className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={cook} disabled={pending} title="Marquer cuisiné">
            <ChefHat className="size-4" />
          </Button>
          {isAdmin && (
            <>
              <MealDialog
                mode="edit"
                mealId={meal.id}
                trigger={
                  <Button variant="ghost" size="sm" title="Modifier">
                    <Pencil className="size-4" />
                  </Button>
                }
              />
              <ConfirmDialog
                title="Supprimer ce repas ?"
                description={`« ${meal.name} » sera définitivement supprimé.`}
                confirmLabel="Supprimer"
                onConfirm={async () => {
                  const res = await deleteMeal(meal.id);
                  if (res.ok) toast.success("Repas supprimé");
                  else toast.error(res.error);
                }}
                trigger={
                  <Button variant="ghost" size="sm" title="Supprimer">
                    <Trash2 className="size-4" />
                  </Button>
                }
              />
            </>
          )}
        </span>
      </TableCell>
    </TableRow>
  );
}
