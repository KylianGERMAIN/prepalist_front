import type { components } from "./api-types";

// Module purement typé, sans runtime : importable côté Server comme côté Client.

/** Porte les `ingredients`, contrairement à `MealSummary`. */
export type Meal = components["schemas"]["Meal"];
/** Items de la liste GET /meals, sans les `ingredients`. */
export type MealSummary = components["schemas"]["MealSummaryDto"];
export type MealIngredient = components["schemas"]["MealIngredient"];
export type Ingredient = components["schemas"]["Ingredient"];
export type CreateMealInput = components["schemas"]["CreateMealDto"];
export type UpdateMealInput = components["schemas"]["UpdateMealDto"];
export type MealIngredientInput = components["schemas"]["MealIngredientDto"];

export type Me = components["schemas"]["MeDto"];

/** Un seul par utilisateur. */
export type Plan = components["schemas"]["Plan"];
export type PlanSlot = components["schemas"]["PlanSlot"];

export type ShoppingList = components["schemas"]["ShoppingListDto"];
export type ShoppingListItem = components["schemas"]["ShoppingListItemDto"];
/** DERIVED = issu d'un plat, MANUAL = ajouté à la main. */
export type ShoppingItemSource = ShoppingListItem["source"];
export type AddShoppingItemInput = components["schemas"]["CreateShoppingListItemDto"];
export type UpdateShoppingItemInput = components["schemas"]["UpdateShoppingListItemDto"];
