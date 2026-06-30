import type { components } from "./api-types";

/**
 * Alias des modèles générés depuis le Swagger du back (source de vérité unique).
 * Module pur (aucun runtime) : importable depuis Server et Client Components.
 */
export type Meal = components["schemas"]["Meal"];
export type MealIngredient = components["schemas"]["MealIngredient"];
export type Ingredient = components["schemas"]["Ingredient"];
export type CreateMealInput = components["schemas"]["CreateMealDto"];
export type UpdateMealInput = components["schemas"]["UpdateMealDto"];
export type MealIngredientInput = components["schemas"]["MealIngredientDto"];
