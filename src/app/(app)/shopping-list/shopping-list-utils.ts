import type { ShoppingListItem } from "@/lib/models";

export type ShoppingItemAction = { type: "toggle"; itemId: string };

/**
 * Reducer pur de l'état optimiste des items : flip immutable du `checked` de la ligne ciblée.
 * Seul le cochage est optimiste ; ajout/suppression/synchro repassent par le serveur (revalidatePath).
 */
export function shoppingItemsReducer(
  state: ShoppingListItem[],
  action: ShoppingItemAction,
): ShoppingListItem[] {
  return state.map((item) =>
    item.id === action.itemId ? { ...item, checked: !item.checked } : item,
  );
}

/** Tri d'affichage alphabétique (fr). */
export function sortItems(items: ShoppingListItem[]): ShoppingListItem[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, "fr"));
}
