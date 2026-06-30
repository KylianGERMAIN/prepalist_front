"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { ChefHat, Pencil, Star, Trash2 } from "lucide-react";
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
import type { Meal } from "@/lib/models";
import { deleteMeal, markCooked } from "./actions";
import { MealDialog } from "./meal-dialog";

export function MealsTable({ meals }: { meals: Meal[] }) {
  if (meals.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        Aucun repas. Crée ton premier repas pour commencer.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Tags</TableHead>
          <TableHead className="text-center">Ingrédients</TableHead>
          <TableHead className="text-center">Cuisiné</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {meals.map((meal) => (
          <MealRow key={meal.id} meal={meal} />
        ))}
      </TableBody>
    </Table>
  );
}

function MealRow({ meal }: { meal: Meal }) {
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
        <span className="flex items-center gap-2">
          {meal.isFavorite ? <Star className="size-4 fill-current text-yellow-500" /> : null}
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
      <TableCell className="text-center">{meal.ingredients.length}</TableCell>
      <TableCell className="text-center">{meal.timesCooked}×</TableCell>
      <TableCell className="text-right">
        <span className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={cook} disabled={pending} title="Marquer cuisiné">
            <ChefHat className="size-4" />
          </Button>
          <MealDialog
            mode="edit"
            meal={meal}
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
    </TableRow>
  );
}
