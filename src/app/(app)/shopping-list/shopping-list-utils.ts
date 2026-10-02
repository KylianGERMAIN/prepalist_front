import type { ClearScope, ShoppingListItem } from "@/lib/models";

export type ShoppingItemAction =
  | { type: "toggle"; itemId: string }
  | { type: "remove"; itemIds: string[] }
  | { type: "clear"; scope: ClearScope }
  | { type: "setQuantity"; itemId: string; quantity: number };

/** L'ajout et la restauration passent par le serveur : il faut l'id et l'état qu'il attribue. */
export function shoppingItemsReducer(
  state: ShoppingListItem[],
  action: ShoppingItemAction,
): ShoppingListItem[] {
  switch (action.type) {
    case "toggle":
      return state.map((item) =>
        item.id === action.itemId ? { ...item, checked: !item.checked } : item,
      );
    case "remove": {
      const ids = new Set(action.itemIds);
      return state.filter((item) => !ids.has(item.id));
    }
    case "clear":
      return action.scope === "all" ? [] : state.filter((item) => !item.checked);
    case "setQuantity":
      return state.map((item) =>
        item.id === action.itemId ? { ...item, quantity: action.quantity } : item,
      );
  }
}

/** À acheter d'abord, achetés en bas ; ordre alphabétique dans chaque groupe. */
export function sortItems(items: ShoppingListItem[]): ShoppingListItem[] {
  return [...items].sort(
    (a, b) => Number(a.checked) - Number(b.checked) || a.name.localeCompare(b.name, "fr"),
  );
}
