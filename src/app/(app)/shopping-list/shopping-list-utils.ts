import type { ClearScope, ShoppingListItem } from "@/lib/models";
import { formatUnit } from "@/lib/units";

export type ShoppingItemAction =
  | { type: "setChecked"; itemId: string; checked: boolean }
  | { type: "remove"; itemIds: string[] }
  | { type: "clear"; scope: ClearScope }
  | { type: "setQuantity"; itemId: string; quantity: number };

/** L'ajout et la restauration passent par le serveur : il faut l'id et l'état qu'il attribue. */
export function shoppingItemsReducer(
  state: ShoppingListItem[],
  action: ShoppingItemAction,
): ShoppingListItem[] {
  switch (action.type) {
    // Valeur posée, pas inversée : rejouée sur une liste rafraîchie entre-temps,
    // une bascule annulerait la coche qu'un autre appareil vient de faire.
    case "setChecked":
      return state.map((item) =>
        item.id === action.itemId ? { ...item, checked: action.checked } : item,
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

const QUANTITY = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

/** Texte à partager : articles encore à acheter seulement, quantités au format français. */
export function formatListAsText(items: ShoppingListItem[]): string {
  const toBuy = sortItems(items).filter((item) => !item.checked);
  if (toBuy.length === 0) return "Courses — rien à acheter";
  const lines = toBuy.map((item) => {
    const amount = [
      item.quantity != null ? QUANTITY.format(item.quantity) : null,
      formatUnit(item.quantity, item.unit) || null,
    ]
      .filter(Boolean)
      .join(" ");
    return amount ? `- ${item.name} — ${amount}` : `- ${item.name}`;
  });
  const count = toBuy.length === 1 ? "1 article" : `${toBuy.length} articles`;
  return [`Courses — ${count}`, "", ...lines].join("\n");
}
