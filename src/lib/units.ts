import type { components } from "./api-types";

export type Unit = components["schemas"]["MealIngredientDto"]["unit"];

// Une table et non une règle : `rouleau` fait `rouleaux`, et les symboles sont
// invariables. `Record<Unit, …>` casse à la compilation si l'API ajoute une unité.
const PLURAL: Record<Unit, string> = {
  g: "g",
  "pièce": "pièces",
  ml: "ml",
  tranche: "tranches",
  gousse: "gousses",
  feuille: "feuilles",
  "boîte": "boîtes",
  rouleau: "rouleaux",
  boule: "boules",
  "c.à.s": "c.à.s",
  "c.à.c": "c.à.c",
};

export const UNITS = Object.keys(PLURAL) as [Unit, ...Unit[]];

/**
 * Accord au rendu : pluriel au-delà de 1 seulement, `0,25 pièce` reste au
 * singulier. Une unité d'item manuel est du texte libre, rendue telle quelle.
 */
export function formatUnit(quantity: number | null, unit: string | null): string {
  if (!unit) return "";
  if (quantity == null || quantity <= 1) return unit;
  return PLURAL[unit as Unit] ?? unit;
}
