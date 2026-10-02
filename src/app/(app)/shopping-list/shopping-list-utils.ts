import type { ClearScope, ShoppingListItem } from "@/lib/models";
import { formatUnit } from "@/lib/units";
import type { Aisle } from "@/lib/aisles";

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

export function quantityLabel(item: ShoppingListItem): string {
  return [item.quantity, formatUnit(item.quantity, item.unit)].filter(Boolean).join(" ");
}

/** À acheter d'abord, achetés en bas ; ordre alphabétique dans chaque groupe. */
export function sortItems(items: ShoppingListItem[]): ShoppingListItem[] {
  return [...items].sort(
    (a, b) => Number(a.checked) - Number(b.checked) || a.name.localeCompare(b.name, "fr"),
  );
}

export type AisleSection = { aisle: Aisle; items: ShoppingListItem[]; remaining: number };

/**
 * Sections dans l'ordre de parcours, sections terminées en bas ; dans chacune,
 * à acheter d'abord puis par nom. `null` → « Autre ».
 */
export function groupByAisle(items: ShoppingListItem[], order: readonly Aisle[]): AisleSection[] {
  const byAisle = new Map<Aisle, ShoppingListItem[]>();
  for (const item of items) {
    const aisle = item.aisle ?? "OTHER";
    byAisle.set(aisle, [...(byAisle.get(aisle) ?? []), item]);
  }
  const rank = (aisle: Aisle) => {
    const i = order.indexOf(aisle);
    return i === -1 ? order.length : i;
  };
  return [...byAisle]
    .map(([aisle, list]) => ({
      aisle,
      items: sortItems(list),
      remaining: list.filter((i) => !i.checked).length,
    }))
    .sort((a, b) => Number(a.remaining === 0) - Number(b.remaining === 0) || rank(a.aisle) - rank(b.aisle));
}

const STORE_MODE_KEY = "prepalist:store-mode";
const storeModeListeners = new Set<() => void>();
// sessionStorage : le mode survit à un rechargement en magasin, pas à la réouverture
// de l'onglet chez soi, où il garderait l'écran allumé. Copie en mémoire car
// le stockage peut lever (navigation privée, stockage bloqué).
let storeMode: boolean | undefined;

export function subscribeStoreMode(listener: () => void): () => void {
  storeModeListeners.add(listener);
  return () => storeModeListeners.delete(listener);
}

export function readStoreMode(): boolean {
  if (storeMode === undefined) {
    try {
      storeMode = sessionStorage.getItem(STORE_MODE_KEY) === "true";
    } catch {
      storeMode = false;
    }
  }
  return storeMode;
}

export function writeStoreMode(value: boolean): void {
  storeMode = value;
  try {
    sessionStorage.setItem(STORE_MODE_KEY, String(value));
  } catch {}
  storeModeListeners.forEach((listener) => listener());
}

const QUANTITY = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

/** Texte à partager : articles encore à acheter seulement, quantités au format français. */
export function formatListAsText(items: ShoppingListItem[]): string {
  const toBuy = sortItems(items).filter((item) => !item.checked);
  if (toBuy.length === 0) return "Courses — rien à acheter";
  const lines = toBuy.map((item) => {
    if (item.quantity == null) return `- ${item.name}`;
    // L'accord suit le nombre affiché, arrondi : 1,999 s'écrit « 2 pièces ».
    const shown = Math.round(item.quantity * 100) / 100;
    return `- ${item.name} — ${`${QUANTITY.format(shown)} ${formatUnit(shown, item.unit)}`.trimEnd()}`;
  });
  const count = toBuy.length === 1 ? "1 article" : `${toBuy.length} articles`;
  return [`Courses — ${count}`, "", ...lines].join("\n");
}
