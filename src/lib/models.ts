import type { components } from "./api-types";

/**
 * Alias des modèles générés depuis le Swagger du back (source de vérité unique).
 * Module pur (aucun runtime) : importable depuis Server et Client Components.
 */
/** Repas complet (détail GET /meals/:id) — porte les `ingredients`. */
export type Meal = components["schemas"]["Meal"];
/** Repas résumé (items de la liste GET /meals) — sans `ingredients`. */
export type MealSummary = components["schemas"]["MealSummaryDto"];
export type MealIngredient = components["schemas"]["MealIngredient"];
export type Ingredient = components["schemas"]["Ingredient"];
export type CreateMealInput = components["schemas"]["CreateMealDto"];
export type UpdateMealInput = components["schemas"]["UpdateMealDto"];
export type MealIngredientInput = components["schemas"]["MealIngredientDto"];

/** Semaine de planning (détail) avec ses créneaux. */
export type Week = components["schemas"]["Week"];
/** Créneau d'un jour : midi (LUNCH) ou soir (DINNER), repas assigné (ou null) + portions. */
export type WeekSlot = components["schemas"]["WeekSlot"];
