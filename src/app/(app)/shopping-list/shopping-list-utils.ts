import type { ShoppingListItem } from "@/lib/models";

export type ShoppingItemAction = { type: "toggle"; itemId: string };

/** Seul le cochage est optimiste : ajout, suppression et synchro passent par le serveur. */
export function shoppingItemsReducer(
  state: ShoppingListItem[],
  action: ShoppingItemAction,
): ShoppingListItem[] {
  return state.map((item) =>
    item.id === action.itemId ? { ...item, checked: !item.checked } : item,
  );
}

export function sortItems(items: ShoppingListItem[]): ShoppingListItem[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, "fr"));
}
