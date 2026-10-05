"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
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
import type { MealSummary, UpdateMealStateInput } from "@/lib/models";
import { deleteMeal, setMealState } from "./actions";
import { MealDialog } from "./meal-dialog";
import { MealDetailsDialog } from "./meal-details-dialog";
import { IncompleteBadge } from "@/components/incomplete-badge";
import { NativeSelect } from "@/components/ui/native-select";

const RATINGS = [1, 2, 3, 4, 5];

type StatePatch = { mealId: string; patch: UpdateMealStateInput };

function stateReducer(meals: MealSummary[], { mealId, patch }: StatePatch): MealSummary[] {
  return meals.map((meal) => (meal.id === mealId ? { ...meal, ...patch } : meal));
}

export function MealsTable({ meals, isAdmin }: { meals: MealSummary[]; isAdmin: boolean }) {
  const [optimisticMeals, patchOptimistic] = useOptimistic(meals, stateReducer);
  const [, startTransition] = useTransition();

  function updateState(mealId: string, patch: UpdateMealStateInput) {
    startTransition(async () => {
      patchOptimistic({ mealId, patch });
      const res = await setMealState(mealId, patch);
      if (!res.ok) toast.error(res.error);
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
          {isAdmin && (
            <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground">Actions</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {optimisticMeals.map((meal) => (
          <MealRow
            key={meal.id}
            meal={meal}
            isAdmin={isAdmin}
            onRate={(rating) => updateState(meal.id, { rating })}
          />
        ))}
      </TableBody>
    </Table>
  );
}

function RatingSelect({
  mealName,
  rating,
  onRate,
}: {
  mealName: string;
  rating: number | null;
  onRate: (rating: number | null) => void;
}) {
  return (
    <NativeSelect
      aria-label={`Note de ${mealName}`}
      className="ml-auto w-28 shrink-0"
      value={rating ?? ""}
      onChange={(e) => onRate(e.target.value ? Number(e.target.value) : null)}
    >
      <option value="">Non noté</option>
      {RATINGS.map((value) => (
        <option key={value} value={value}>
          {value}/5
        </option>
      ))}
    </NativeSelect>
  );
}

function MealRow({
  meal,
  isAdmin,
  onRate,
}: {
  meal: MealSummary;
  isAdmin: boolean;
  onRate: (rating: number | null) => void;
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        <span className="flex items-center gap-1">
          <MealDetailsDialog
            mealId={meal.id}
            trigger={
              <button
                type="button"
                className="rounded-sm text-left underline-offset-4 hover:underline focus-visible:outline-2 [@media(hover:none)]:underline focus-visible:outline-ring"
              >
                {meal.name}
              </button>
            }
          />
          <RatingSelect mealName={meal.name} rating={meal.rating} onRate={onRate} />
        </span>
      </TableCell>
      <TableCell>
        <span className="flex flex-wrap gap-1">
          {meal.ingredientCount === 0 ? <IncompleteBadge /> : null}
          {meal.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              render={<Link href={`/meals?tag=${encodeURIComponent(tag)}`} title={`Filtrer sur « ${tag} »`} />}
            >
              {tag}
            </Badge>
          ))}
        </span>
      </TableCell>
      {isAdmin && (
        <TableCell className="text-right">
          <span className="flex justify-end gap-1">
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
          </span>
        </TableCell>
      )}
    </TableRow>
  );
}
