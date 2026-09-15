"use client";

import { useState, type ReactElement } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
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
import { UNITS, type Unit } from "@/lib/units";
import { cn } from "@/lib/utils";
import { IngredientCombobox } from "./ingredient-combobox";
import { createMeal, getMeal, updateMeal } from "./actions";

const schema = z.object({
  name: z.string().min(1, "Nom requis."),
  tags: z.string(), // saisi en CSV, découpé à la soumission
  ingredients: z.array(
    z.object({
      ingredientId: z.string().min(1, "Ingrédient requis."),
      ingredientName: z.string(),
      quantity: z.number().positive("Quantité > 0."),
      unit: z.enum(UNITS, { message: "Unité requise." }),
    }),
  ),
});

type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = { name: "", tags: "", ingredients: [] };

// Unité vide au départ : c'est zod qui refuse la soumission. Lui donner une
// vraie unité par défaut ferait passer une ligne jamais renseignée.
const NEW_LINE = (): FormValues["ingredients"][number] => ({
  ingredientId: "",
  ingredientName: "",
  quantity: 1,
  unit: "" as Unit,
});

function toDefaults(meal: Meal): FormValues {
  return {
    name: meal.name,
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
  mealId,
  trigger,
}: {
  mode: "create" | "edit";
  mealId?: string;
  trigger?: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
    defaultValues: EMPTY,
  });
  const lines = useFieldArray({ control, name: "ingredients" });

  // En édition, un fetch du détail est nécessaire : la ligne de liste n'est qu'un
  // résumé, sans les `ingredients`.
  async function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) return;
    if (mode === "edit" && mealId) {
      setLoading(true);
      const full = await getMeal(mealId);
      setLoading(false);
      if (full) {
        reset(toDefaults(full));
      } else {
        toast.error("Repas introuvable.");
        setOpen(false);
      }
    } else {
      reset(EMPTY);
    }
  }

  async function onSubmit(values: FormValues) {
    const payload: CreateMealInput = {
      name: values.name,
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
      mode === "edit" && mealId ? await updateMeal(mealId, payload) : await createMeal(payload);

    if (res.ok) {
      toast.success(mode === "edit" ? "Repas mis à jour" : "Repas créé");
      setOpen(false);
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Chargement…
          </div>
        ) : (
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Ingrédients</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    lines.append(NEW_LINE())
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
                      // eslint-disable-next-line react-hooks/incompatible-library -- React Compiler n'est pas activé sur ce projet
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
                    <select
                      aria-label="Unité"
                      className={cn(
                        "h-8 w-full rounded-lg border border-input bg-transparent px-2 text-base outline-none transition-colors",
                        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                        "md:text-sm dark:bg-input/30",
                      )}
                      {...register(`ingredients.${index}.unit`)}
                    >
                      <option value="">Unité</option>
                      {UNITS.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
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
        )}
      </DialogContent>
    </Dialog>
  );
}
