"use client";

import { useRef } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShoppingListItem } from "@/lib/models";
import { type Aisle, aisleLabel } from "@/lib/aisles";
import { groupByAisle, quantityLabel, sortItems } from "./shopping-list-utils";

// Une ligne cochée laisse sa place à la suivante : sans ce délai, un double tap coche les deux.
const TAP_GUARD_MS = 400;

export function StoreModeList({
  items,
  aisleOrder,
  onSetChecked,
}: {
  items: ShoppingListItem[];
  aisleOrder: Aisle[];
  onSetChecked: (item: ShoppingListItem, checked: boolean) => void;
}) {
  const lastTap = useRef(0);
  function tap(item: ShoppingListItem, checked: boolean) {
    const now = Date.now();
    if (now - lastTap.current < TAP_GUARD_MS) return;
    lastTap.current = now;
    onSetChecked(item, checked);
  }
  const toBuy = groupByAisle(
    items.filter((i) => !i.checked),
    aisleOrder,
  );
  const inCart = sortItems(items.filter((i) => i.checked));

  return (
    <div className="space-y-4">
      {toBuy.length === 0 ? (
        <p className="py-6 text-center text-lg text-muted-foreground">Tout est dans le panier.</p>
      ) : (
        toBuy.map((section) => (
          <section key={section.aisle} aria-label={aisleLabel(section.aisle)}>
            <h2 className="sticky top-14 z-[5] bg-background py-1.5 text-sm font-medium text-muted-foreground">
              {aisleLabel(section.aisle)}
            </h2>
            <ul className="divide-y rounded-md border">
              {section.items.map((item) => (
                <StoreRow key={item.id} item={item} onSetChecked={tap} />
              ))}
            </ul>
          </section>
        ))
      )}
      {inCart.length > 0 ? (
        <details className="group rounded-md border">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-4 text-base text-muted-foreground">
            <span>
              Dans le panier (<span className="tnum">{inCart.length}</span>)
            </span>
            <ChevronDown className="size-5 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
          </summary>
          <ul className="divide-y border-t">
            {inCart.map((item) => (
              <StoreRow key={item.id} item={item} onSetChecked={tap} />
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
  const quantity = quantityLabel(item);
  return (
    <li>
      <button
        type="button"
        role="checkbox"
        aria-checked={item.checked}
        onClick={() => onSetChecked(item, !item.checked)}
        className="flex min-h-14 w-full touch-manipulation items-center gap-4 px-4 py-3 text-left text-lg active:bg-muted"
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
