import type { components } from "./api-types";

export type Aisle = components["schemas"]["ShoppingListDto"]["aisleOrder"][number];

// `Record<Aisle, …>` casse à la compilation au prochain `gen:api` si l'API a gagné un rayon.
const LABELS: Record<Aisle, string> = {
  PRODUCE: "Fruits et légumes",
  BAKERY: "Boulangerie",
  MEAT_FISH: "Boucherie, poissonnerie",
  DAIRY: "Crèmerie",
  CHEESE_DELI: "Fromage, charcuterie",
  PANTRY_SAVORY: "Épicerie salée",
  PANTRY_SWEET: "Épicerie sucrée",
  FROZEN: "Surgelés",
  DRINKS: "Boissons",
  HOUSEHOLD: "Maison",
  OTHER: "Autre",
};

export const AISLES = Object.keys(LABELS) as [Aisle, ...Aisle[]];

/** `null` = rayon inconnu, rangé avec « Autre ». */
export function aisleLabel(aisle: Aisle | null): string {
  return LABELS[aisle ?? "OTHER"];
}
