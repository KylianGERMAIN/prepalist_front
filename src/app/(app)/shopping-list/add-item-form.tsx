"use client";

import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UnitSelect } from "@/components/unit-select";
import { AisleSelect } from "@/components/aisle-select";
import { AISLES } from "@/lib/aisles";
import type { AddShoppingItemInput } from "@/lib/models";
import { UNITS } from "@/lib/units";
import { addManualItem } from "./shopping-list-actions";

const schema = z.object({
  name: z.string().min(1, "Nom requis."),
  quantity: z
    .union([z.number().positive("Quantité > 0."), z.nan()])
    .optional(),
  unit: z.enum(UNITS, { message: "Unité requise." }),
  aisle: z.enum(AISLES),
});

type FormValues = z.infer<typeof schema>;

export function AddItemForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { name: "", quantity: undefined, aisle: "OTHER" },
  });

  async function onSubmit(values: FormValues) {
    const payload: AddShoppingItemInput = { name: values.name, unit: values.unit, aisle: values.aisle };
    if (values.quantity && !Number.isNaN(values.quantity)) payload.quantity = values.quantity;

    const res = await addManualItem(payload);
    if (res.ok) {
      toast.success("Article ajouté");
      reset();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <Input placeholder="Ajouter un article…" aria-label="Nom" {...register("name")} />
        </div>
        <div className="w-20">
          <Input
            type="number"
            step="any"
            min="0"
            placeholder="Qté"
            aria-label="Quantité"
            {...register("quantity", { valueAsNumber: true })}
          />
        </div>
        <div className="w-24">
          <UnitSelect defaultValue="" {...register("unit")} />
        </div>
        <div className="w-36">
          <AisleSelect {...register("aisle")} />
        </div>
        <Button type="submit" disabled={isSubmitting} title="Ajouter">
          <Plus className="size-4" />
        </Button>
      </div>
      {errors.name?.message ? (
        <p className="text-sm text-destructive">{errors.name.message}</p>
      ) : null}
      {errors.quantity?.message ? (
        <p className="text-sm text-destructive">{errors.quantity.message}</p>
      ) : null}
      {errors.unit?.message ? (
        <p className="text-sm text-destructive">{errors.unit.message}</p>
      ) : null}
    </form>
  );
}
