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

/** Profil de l'utilisateur courant (GET /users/me). */
export type Me = components["schemas"]["MeDto"];

/** Plan de repas courant (un seul par utilisateur) avec ses créneaux. */
export type Plan = components["schemas"]["Plan"];
/** Créneau d'un jour du plan : midi (LUNCH) ou soir (DINNER), repas assigné (ou null) + portions. */
export type PlanSlot = components["schemas"]["PlanSlot"];

/** Liste de courses agrégée du plan. */
export type ShoppingList = components["schemas"]["ShoppingListDto"];
/** Ligne de la liste : nom, quantité, unité, état coché ; éditable et supprimable. */
export type ShoppingListItem = components["schemas"]["ShoppingListItemDto"];
/** Origine d'un item (indicateur seul) : DERIVED (issu d'un plat) ou MANUAL (ajouté à la main). */
export type ShoppingItemSource = ShoppingListItem["source"];
export type AddShoppingItemInput = components["schemas"]["CreateShoppingListItemDto"];
export type UpdateShoppingItemInput = components["schemas"]["UpdateShoppingListItemDto"];
