"use client";

import { useState, type ReactElement } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ShoppingListItem, UpdateShoppingItemInput } from "@/lib/models";
import { updateItem } from "./shopping-list-actions";

const schema = z.object({
  name: z.string().min(1, "Nom requis."),
  quantity: z.union([z.number().positive("Quantité > 0."), z.nan()]).optional(),
  unit: z.string(),
});

type FormValues = z.infer<typeof schema>;

export function EditItemDialog({
  weekId,
  item,
  trigger,
}: {
  weekId: string;
  item: ShoppingListItem;
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: {
      name: item.name,
      quantity: item.quantity ?? undefined,
      unit: item.unit ?? "",
    },
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      reset({
        name: item.name,
        quantity: item.quantity ?? undefined,
        unit: item.unit ?? "",
      });
    }
  }

  async function onSubmit(values: FormValues) {
    const patch: UpdateShoppingItemInput = {
      name: values.name,
      quantity: values.quantity && !Number.isNaN(values.quantity) ? values.quantity : undefined,
      unit: values.unit.trim() || undefined,
    };
    const res = await updateItem(weekId, item.id, patch);
    if (res.ok) {
      toast.success("Article mis à jour");
      setOpen(false);
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Modifier l&apos;article</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-item-name">Nom</Label>
            <Input id="edit-item-name" {...register("name")} />
            {errors.name?.message ? (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <div className="w-24 space-y-2">
              <Label htmlFor="edit-item-quantity">Quantité</Label>
              <Input
                id="edit-item-quantity"
                type="number"
                step="any"
                min="0"
                {...register("quantity", { valueAsNumber: true })}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="edit-item-unit">Unité</Label>
              <Input id="edit-item-unit" {...register("unit")} />
            </div>
          </div>
          {errors.quantity?.message ? (
            <p className="text-sm text-destructive">{errors.quantity.message}</p>
          ) : null}
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
