"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShoppingListItem } from "@/lib/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { deleteItem, toggleChecked } from "./shopping-list-actions";
import { shoppingItemsReducer, sortItems } from "./shopping-list-utils";
import { AddItemForm } from "./add-item-form";
import { EditItemDialog } from "./edit-item-dialog";

export function ShoppingListView({
  items,
}: {
  items: ShoppingListItem[];
}) {
  const [optimisticItems, dispatch] = useOptimistic(items, shoppingItemsReducer);
  const [, startTransition] = useTransition();
  const sorted = sortItems(optimisticItems);
  const checkedCount = optimisticItems.filter((i) => i.checked).length;
  const progress =
    optimisticItems.length === 0 ? 0 : Math.round((checkedCount / optimisticItems.length) * 100);

  function handleToggle(item: ShoppingListItem) {
    startTransition(async () => {
      dispatch({ type: "toggle", itemId: item.id });
      const res = await toggleChecked(item.id, !item.checked);
      if (!res.ok) toast.error(res.error);
    });
  }

  function handleDelete(item: ShoppingListItem) {
    startTransition(async () => {
      const res = await deleteItem(item.id);
      if (res.ok) toast.success("Article supprimé");
      else toast.error(res.error);
    });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <p className="text-sm text-muted-foreground">
          <span className="tnum">{checkedCount}</span> /{" "}
          <span className="tnum">{optimisticItems.length}</span> achetés
        </p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Liste vide. Ajoute un article ou synchronise depuis tes plats planifiés.
        </p>
      ) : (
      <ul className="divide-y rounded-md border">
        {sorted.map((item) => {
          const isManual = item.source === "MANUAL";
          return (
            <li key={item.id} className="flex items-center gap-2 pr-2 hover:bg-muted/50">
              <label className="flex flex-1 cursor-pointer items-center gap-3 px-4 py-2.5">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleToggle(item)}
                  className="size-4 accent-accent"
                />
                <span
                  className={cn(
                    "flex flex-1 items-center gap-2",
                    item.checked && "text-muted-foreground line-through",
                  )}
                >
                  {item.name}
                  {isManual ? (
                    <Badge variant="secondary" className="font-normal">
                      Manuel
                    </Badge>
                  ) : null}
                </span>
                {item.quantity != null || item.unit ? (
                  <span
                    className={cn(
                      "text-sm tabular-nums text-muted-foreground",
                      item.checked && "line-through",
                    )}
                  >
                    {[item.quantity, item.unit].filter(Boolean).join(" ")}
                  </span>
                ) : null}
              </label>
              <div className="flex items-center gap-0.5">
                <EditItemDialog
                  item={item}
                  trigger={
                    <Button variant="ghost" size="sm" title="Modifier" aria-label="Modifier l'article">
                      <Pencil className="size-4" />
                    </Button>
                  }
                />
                <ConfirmDialog
                  title="Supprimer l'article ?"
                  description={`« ${item.name} » sera retiré de la liste.`}
                  confirmLabel="Supprimer"
                  onConfirm={() => handleDelete(item)}
                  trigger={
                    <Button variant="ghost" size="sm" title="Supprimer" aria-label="Supprimer l'article">
                      <Trash2 className="size-4" />
                    </Button>
                  }
                />
              </div>
            </li>
          );
        })}
      </ul>
      )}

      <AddItemForm />
    </div>
  );
}
