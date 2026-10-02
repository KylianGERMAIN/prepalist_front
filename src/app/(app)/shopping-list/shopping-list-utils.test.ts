import { describe, expect, it } from "vitest";
import type { ShoppingListItem } from "@/lib/models";
import { formatListAsText, shoppingItemsReducer, sortItems } from "./shopping-list-utils";

function item(overrides: Partial<ShoppingListItem> = {}): ShoppingListItem {
  return {
    id: "i1",
    source: "DERIVED",
    ingredientId: "ing1",
    name: "Tomates",
    unit: "g",
    quantity: 500,
    checked: false,
    ...overrides,
  };
}

describe("shoppingItemsReducer", () => {
  it("coche l'item ciblé", () => {
    const state = [item({ id: "i1", checked: false })];
    const next = shoppingItemsReducer(state, { type: "setChecked", itemId: "i1", checked: true });
    expect(next[0].checked).toBe(true);
  });

  it("décoche l'item ciblé", () => {
    const state = [item({ id: "i1", checked: true })];
    const next = shoppingItemsReducer(state, { type: "setChecked", itemId: "i1", checked: false });
    expect(next[0].checked).toBe(false);
  });

  it("pose la valeur même si l'item a déjà changé ailleurs", () => {
    const state = [item({ id: "i1", checked: true })];
    const next = shoppingItemsReducer(state, { type: "setChecked", itemId: "i1", checked: true });
    expect(next[0].checked).toBe(true);
  });

  it("laisse les autres items inchangés (même référence)", () => {
    const other = item({ id: "i2" });
    const state = [item({ id: "i1" }), other];
    const next = shoppingItemsReducer(state, { type: "setChecked", itemId: "i1", checked: true });
    expect(next[1]).toBe(other);
  });

  it("ne mute pas l'état d'origine (immutabilité)", () => {
    const original = item({ id: "i1", checked: false });
    const state = [original];
    shoppingItemsReducer(state, { type: "setChecked", itemId: "i1", checked: true });
    expect(original.checked).toBe(false);
  });

  it("ne touche à rien si l'itemId est inconnu", () => {
    const state = [item({ id: "i1", checked: false })];
    const next = shoppingItemsReducer(state, { type: "setChecked", itemId: "zzz", checked: true });
    expect(next[0].checked).toBe(false);
  });
});

describe("shoppingItemsReducer — suppressions et quantité", () => {
  const state = [
    item({ id: "a", checked: true }),
    item({ id: "b" }),
    item({ id: "c", checked: true }),
  ];

  it("retire les items sélectionnés", () => {
    const next = shoppingItemsReducer(state, { type: "remove", itemIds: ["a", "c"] });
    expect(next.map((i) => i.id)).toEqual(["b"]);
  });

  it("retire seulement les achetés", () => {
    const next = shoppingItemsReducer(state, { type: "clear", scope: "checked" });
    expect(next.map((i) => i.id)).toEqual(["b"]);
  });

  it("vide tout", () => {
    expect(shoppingItemsReducer(state, { type: "clear", scope: "all" })).toEqual([]);
  });

  it("change la quantité de l'item ciblé", () => {
    const next = shoppingItemsReducer(state, {
      type: "setQuantity",
      itemId: "b",
      quantity: 3,
    });
    expect(next[1].quantity).toBe(3);
    expect(next[0]).toBe(state[0]);
  });
});

describe("sortItems", () => {
  it("trie par nom (fr) sans muter l'entrée", () => {
    const input = [item({ id: "a", name: "Œufs" }), item({ id: "b", name: "Ail" })];
    const sorted = sortItems(input);
    expect(sorted.map((i) => i.name)).toEqual(["Ail", "Œufs"]);
    expect(input[0].name).toBe("Œufs");
  });

  it("range les achetés en bas, chaque groupe par ordre alphabétique", () => {
    const sorted = sortItems([
      item({ id: "1", name: "Ail", checked: true }),
      item({ id: "2", name: "Œufs" }),
      item({ id: "3", name: "Beurre" }),
      item({ id: "4", name: "Crème", checked: true }),
    ]);
    expect(sorted.map((i) => i.name)).toEqual(["Beurre", "Œufs", "Ail", "Crème"]);
  });
});

describe("formatListAsText", () => {
  it("liste les articles à acheter, triés, quantités au format français", () => {
    const text = formatListAsText([
      item({ id: "1", name: "Oignon", quantity: 0.5, unit: "pièce" }),
      item({ id: "2", name: "Crème", quantity: 20, unit: "c.à.s" }),
      item({ id: "3", name: "Beurre", checked: true }),
      item({ id: "4", name: "Sel", quantity: null, unit: null, source: "MANUAL" }),
    ]);

    expect(text).toBe(
      ["Courses — 3 articles", "", "- Crème — 20 c.à.s", "- Oignon — 0,5 pièce", "- Sel"].join("\n"),
    );
  });

  it("dit qu'il n'y a rien à acheter quand tout est coché", () => {
    expect(formatListAsText([item({ checked: true })])).toBe("Courses — rien à acheter");
    expect(formatListAsText([])).toBe("Courses — rien à acheter");
  });
});
