"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ShoppingListItem } from "@/lib/models";

/** Clé d'une ligne : un ingrédient peut apparaître en plusieurs unités (g / pièce). */
const itemKey = (item: ShoppingListItem) => `${item.ingredientId}_${item.unit}`;

export function ShoppingListView({ items }: { items: ShoppingListItem[] }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name, "fr"));

  function toggle(key: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {checked.size} / {items.length} cochés
      </p>
      <ul className="divide-y rounded-md border">
        {sorted.map((item) => {
          const key = itemKey(item);
          const done = checked.has(key);
          return (
            <li key={key}>
              <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-muted/50">
                <input
                  type="checkbox"
                  checked={done}
                  onChange={() => toggle(key)}
                  className="size-4"
                />
                <span className={cn("flex-1", done && "text-muted-foreground line-through")}>
                  {item.name}
                </span>
                <span
                  className={cn(
                    "text-sm tabular-nums text-muted-foreground",
                    done && "line-through",
                  )}
                >
                  {item.quantity} {item.unit}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
