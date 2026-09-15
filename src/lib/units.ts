import type { components } from "./api-types";

export type Unit = components["schemas"]["MealIngredientDto"]["unit"];

// Une table et non une règle : `rouleau` fait `rouleaux`, et les symboles sont
// invariables. `Record<Unit, …>` casse à la compilation au prochain `gen:api`
// si l'enum de l'API a gagné une valeur — rien ne le détecte avant.
const PLURAL: Record<Unit, string> = {
  g: "g",
  ml: "ml",
  "pièce": "pièces",
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

// `Intl.PluralRules` plutôt qu'un seuil écrit à la main : en français le
// singulier tient jusqu'à 2 exclu, donc « 1,5 tranche » et non « 1,5 tranches ».
const plural = new Intl.PluralRules("fr");

/** Une unité d'item manuel est du texte libre, rendue telle quelle. */
export function formatUnit(quantity: number | null, unit: string | null): string {
  if (!unit) return "";
  if (quantity == null || plural.select(quantity) !== "other") return unit;
  return PLURAL[unit as Unit] ?? unit;
}
