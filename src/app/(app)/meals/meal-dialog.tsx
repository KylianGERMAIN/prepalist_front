"use client";

import { useRef, useState, type ReactElement } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { CreateMealInput, Meal } from "@/lib/models";
import { asUnit, UNITS } from "@/lib/units";
import { UnitSelect } from "@/components/unit-select";
import { IngredientCombobox } from "./ingredient-combobox";
import { createMeal, getMeal, updateMeal } from "./actions";

const schema = z.object({
  name: z.string().min(1, "Nom requis."),
  tags: z.string(), // saisi en CSV, découpé à la soumission
  description: z.string().max(5000, "5 000 caractères au plus."),
  ingredients: z.array(
    z.object({
      ingredientId: z.string().min(1, "Ingrédient requis."),
      ingredientName: z.string(),
      quantity: z.number().positive("Quantité > 0."),
      // Saisi comme une chaîne, rendu comme une `Unit` : le formulaire doit
      // pouvoir porter le vide et une valeur héritée, pas la soumission.
      unit: z
        .string()
        .min(1, "Unité requise.")
        .pipe(z.enum(UNITS, { message: "Unité hors liste." })),
    }),
  ),
});

type FormValues = z.input<typeof schema>;
type SubmittedValues = z.output<typeof schema>;

const EMPTY: FormValues = { name: "", tags: "", description: "", ingredients: [] };

const NEW_LINE = (): FormValues["ingredients"][number] => ({
  ingredientId: "",
  ingredientName: "",
  quantity: 1,
  unit: "",
});

function toDefaults(meal: Meal): FormValues {
  return {
    name: meal.name,
    tags: meal.tags.join(", "),
    description: meal.description ?? "",
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
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues, unknown, SubmittedValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: EMPTY,
  });
  const lines = useFieldArray({ control, name: "ingredients" });
  const descriptionLength = useWatch({ control, name: "description" })?.length ?? 0;
  // Unité posée par le préremplissage, par ligne : elle suit l'ingrédient tant
  // que l'utilisateur ne l'a pas changée lui-même.
  const prefilledUnits = useRef(new Map<string, string>());

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

  async function onSubmit(values: SubmittedValues) {
    const payload: CreateMealInput = {
      name: values.name,
      tags: values.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      description: values.description.trim() || null,
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
              <Label htmlFor="meal-description">Description</Label>
              <Textarea
                id="meal-description"
                placeholder="Procédé, cuisson, astuces…"
                className="max-h-60 resize-y"
                {...register("description")}
              />
              {descriptionLength >= 4500 ? (
                <p className="text-right text-xs tabular-nums text-muted-foreground">
                  {descriptionLength} / 5000
                </p>
              ) : null}
              <FieldError message={errors.description?.message} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Ingrédients</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => lines.append(NEW_LINE())}
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
                      defaultUnit={asUnit(watch(`ingredients.${index}.unit`))}
                      onSelect={(ing) => {
                        setValue(`ingredients.${index}.ingredientId`, ing.id, {
                          shouldValidate: true,
                        });
                        setValue(`ingredients.${index}.ingredientName`, ing.name);
                        const unit = getValues(`ingredients.${index}.unit`);
                        if (!unit || unit === prefilledUnits.current.get(row.id)) {
                          const next = ing.defaultUnit ?? "";
                          setValue(`ingredients.${index}.unit`, next, {
                            shouldValidate: next !== "",
                          });
                          prefilledUnits.current.set(row.id, next);
                        }
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
                    <UnitSelect
                      current={watch(`ingredients.${index}.unit`)}
                      {...register(`ingredients.${index}.unit`)}
                    />
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
