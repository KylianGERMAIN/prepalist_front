import { describe, expect, it } from "vitest";
import type { ShoppingListItem } from "@/lib/models";
import { shoppingItemsReducer, sortItems } from "./shopping-list-utils";

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
  it("coche l'item ciblé (toggle depuis false)", () => {
    const state = [item({ id: "i1", checked: false })];
    const next = shoppingItemsReducer(state, { type: "toggle", itemId: "i1" });
    expect(next[0].checked).toBe(true);
  });

  it("décoche l'item ciblé (toggle depuis true)", () => {
    const state = [item({ id: "i1", checked: true })];
    const next = shoppingItemsReducer(state, { type: "toggle", itemId: "i1" });
    expect(next[0].checked).toBe(false);
  });

  it("laisse les autres items inchangés (même référence)", () => {
    const other = item({ id: "i2" });
    const state = [item({ id: "i1" }), other];
    const next = shoppingItemsReducer(state, { type: "toggle", itemId: "i1" });
    expect(next[1]).toBe(other);
  });

  it("ne mute pas l'état d'origine (immutabilité)", () => {
    const original = item({ id: "i1", checked: false });
    const state = [original];
    shoppingItemsReducer(state, { type: "toggle", itemId: "i1" });
    expect(original.checked).toBe(false);
  });

  it("ne touche à rien si l'itemId est inconnu", () => {
    const state = [item({ id: "i1", checked: false })];
    const next = shoppingItemsReducer(state, { type: "toggle", itemId: "zzz" });
    expect(next[0].checked).toBe(false);
  });
});

describe("sortItems", () => {
  it("trie par nom (fr) sans muter l'entrée", () => {
    const input = [item({ id: "a", name: "Œufs" }), item({ id: "b", name: "Ail" })];
    const sorted = sortItems(input);
    expect(sorted.map((i) => i.name)).toEqual(["Ail", "Œufs"]);
    expect(input[0].name).toBe("Œufs");
  });
});
