"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatUnit } from "@/lib/units";
import type { ShoppingListItem } from "@/lib/models";

export function StoreModeList({
  items,
  onSetChecked,
}: {
  items: ShoppingListItem[];
  onSetChecked: (item: ShoppingListItem, checked: boolean) => void;
}) {
  const toBuy = items.filter((i) => !i.checked);
  const inCart = items.filter((i) => i.checked);

  return (
    <div className="space-y-4">
      {toBuy.length === 0 ? (
        <p className="py-6 text-center text-lg text-muted-foreground">Tout est dans le panier.</p>
      ) : (
        <ul className="divide-y rounded-md border">
          {toBuy.map((item) => (
            <StoreRow key={item.id} item={item} onSetChecked={onSetChecked} />
          ))}
        </ul>
      )}
      {inCart.length > 0 ? (
        <details className="rounded-md border">
          <summary className="flex min-h-14 cursor-pointer items-center px-4 text-base text-muted-foreground">
            Dans le panier (<span className="tnum">{inCart.length}</span>)
          </summary>
          <ul className="divide-y border-t">
            {inCart.map((item) => (
              <StoreRow key={item.id} item={item} onSetChecked={onSetChecked} />
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

function StoreRow({
  item,
  onSetChecked,
}: {
  item: ShoppingListItem;
  onSetChecked: (item: ShoppingListItem, checked: boolean) => void;
}) {
  const quantity = [item.quantity, formatUnit(item.quantity, item.unit)].filter(Boolean).join(" ");
  return (
    <li>
      <button
        type="button"
        aria-pressed={item.checked}
        onClick={() => onSetChecked(item, !item.checked)}
        className="flex min-h-14 w-full items-center gap-4 px-4 py-3 text-left text-lg active:bg-muted"
      >
        <span
          aria-hidden
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded border-2",
            item.checked ? "border-accent bg-accent text-accent-foreground" : "border-muted-foreground",
          )}
        >
          {item.checked ? <Check className="size-4" /> : null}
        </span>
        <span className={cn("flex-1", item.checked && "text-muted-foreground line-through")}>{item.name}</span>
        {quantity ? (
          <span className={cn("tabular-nums text-muted-foreground", item.checked && "line-through")}>
            {quantity}
          </span>
        ) : null}
      </button>
    </li>
  );
}
