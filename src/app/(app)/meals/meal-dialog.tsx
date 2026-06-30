"use client";

import { useState, type ReactElement } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { CreateMealInput, Meal } from "@/lib/models";
import { IngredientCombobox } from "./ingredient-combobox";
import { createMeal, updateMeal } from "./actions";

const schema = z.object({
  name: z.string().min(1, "Nom requis."),
  isFavorite: z.boolean(),
  tags: z.string(), // saisi en CSV, découpé à la soumission
  ingredients: z.array(
    z.object({
      ingredientId: z.string().min(1, "Ingrédient requis."),
      ingredientName: z.string(),
      quantity: z.number().positive("Quantité > 0."),
      unit: z.string().min(1, "Unité requise."),
    }),
  ),
});

type FormValues = z.infer<typeof schema>;

function toDefaults(meal?: Meal): FormValues {
  if (!meal) return { name: "", isFavorite: false, tags: "", ingredients: [] };
  return {
    name: meal.name,
    isFavorite: meal.isFavorite,
    tags: meal.tags.join(", "),
    ingredients: meal.ingredients.map((mi) => ({
      ingredientId: mi.ingredientId,
      ingredientName: mi.ingredient.name,
      quantity: mi.quantity,
      unit: mi.unit,
    })),
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function MealDialog({
  mode,
  meal,
  trigger,
}: {
  mode: "create" | "edit";
  meal?: Meal;
  trigger?: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: toDefaults(meal),
  });
  const lines = useFieldArray({ control, name: "ingredients" });

  async function onSubmit(values: FormValues) {
    const payload: CreateMealInput = {
      name: values.name,
      isFavorite: values.isFavorite,
      tags: values.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      ingredients: values.ingredients.map((l) => ({
        ingredientId: l.ingredientId,
        quantity: l.quantity,
        unit: l.unit,
      })),
    };

    const res =
      mode === "edit" && meal ? await updateMeal(meal.id, payload) : await createMeal(payload);

    if (res.ok) {
      toast.success(mode === "edit" ? "Repas mis à jour" : "Repas créé");
      setOpen(false);
      // En edit, la valeur fraîche (post-revalidate) sera réinjectée au prochain open ; on remet
      // simplement l'état au snapshot courant du `meal` plutôt que de figer la saisie brute.
      reset(toDefaults(meal));
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog
      open={open}
      // Resync du form à l'ouverture : `defaultValues` n'est lu qu'au montage, or chaque ligne monte
      // un dialog edit en permanence. Le reset on-open garantit des valeurs fraîches. À conserver si
      // ce pattern est repris en F2/F3.
      onOpenChange={(o) => {
        setOpen(o);
        if (o) reset(toDefaults(meal));
      }}
    >
      <DialogTrigger
        render={
          trigger ?? (
            <Button>
              <Plus className="mr-2 size-4" />
              Nouveau repas
            </Button>
          )
        }
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Modifier le repas" : "Nouveau repas"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meal-name">Nom</Label>
            <Input id="meal-name" placeholder="Ex. Poulet curry" {...register("name")} />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meal-tags">Tags</Label>
            <Input
              id="meal-tags"
              placeholder="rapide, batch, végé (séparés par des virgules)"
              {...register("tags")}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4" {...register("isFavorite")} />
            Favori
          </label>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Ingrédients</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  lines.append({ ingredientId: "", ingredientName: "", quantity: 1, unit: "" })
                }
              >
                <Plus className="mr-2 size-4" />
                Ligne
              </Button>
            </div>

            {lines.fields.map((row, index) => (
              <div key={row.id} className="flex items-start gap-2">
                <div className="flex-1">
                  <IngredientCombobox
                    value={watch(`ingredients.${index}.ingredientId`)}
                    label={watch(`ingredients.${index}.ingredientName`) || undefined}
                    onSelect={(ing) => {
                      setValue(`ingredients.${index}.ingredientId`, ing.id, {
                        shouldValidate: true,
                      });
                      setValue(`ingredients.${index}.ingredientName`, ing.name);
                    }}
                  />
                  <FieldError message={errors.ingredients?.[index]?.ingredientId?.message} />
                </div>
                <div className="w-20">
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="Qté"
                    {...register(`ingredients.${index}.quantity`, { valueAsNumber: true })}
                  />
                  <FieldError message={errors.ingredients?.[index]?.quantity?.message} />
                </div>
                <div className="w-24">
                  <Input placeholder="Unité" {...register(`ingredients.${index}.unit`)} />
                  <FieldError message={errors.ingredients?.[index]?.unit?.message} />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => lines.remove(index)}
                  title="Retirer la ligne"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
