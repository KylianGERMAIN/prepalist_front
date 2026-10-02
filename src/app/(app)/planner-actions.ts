"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api";
import { type ActionResult, errorText } from "@/lib/action-result";
import type { MealSummary } from "@/lib/models";

/**
 * Ne remplit que les créneaux vides : une assignation manuelle n'est jamais écrasée.
 * Le back met la liste de courses à jour dans la même transaction.
 */
export async function generatePlan(): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.POST("/plan/generate", {});
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/");
  revalidatePath("/shopping-list");
  return { ok: true };
}

/** Réancre `startDate` sur le jour de courses — seul appel qui le déplace. Les items manuels survivent. */
export async function clearPlan(): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.DELETE("/plan/slots", {});
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/");
  revalidatePath("/shopping-list");
  return { ok: true };
}

/** `mealId` à `null` vide le créneau ; `alsoNext` recopie le résultat sur le créneau suivant. */
export async function assignSlot(
  slotId: string,
  mealId: string | null,
  servings?: number,
  alsoNext?: boolean,
): Promise<ActionResult> {
  const api = await serverApi();
  const body: { mealId?: string | null; servings?: number; alsoNext?: boolean } = { mealId };
  if (servings !== undefined) body.servings = servings;
  if (alsoNext) body.alsoNext = true;
  const { error } = await api.PATCH("/plan/slots/{slotId}", {
    params: { path: { slotId } },
    body,
  });
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/");
  revalidatePath("/shopping-list");
  return { ok: true };
}

/** Repas créé avec son seul nom, depuis le planning : ses ingrédients se complètent plus tard. */
export async function createQuickMeal(
  name: string,
): Promise<{ ok: true; meal: MealSummary } | { ok: false; error: string }> {
  const api = await serverApi();
  const { data, error } = await api.POST("/meals", { body: { name } });
  if (error || !data) return { ok: false, error: errorText(error) };
  revalidatePath("/meals");
  return { ok: true, meal: data };
}

export async function searchMeals(name: string): Promise<MealSummary[]> {
  const api = await serverApi();
  const { data } = await api.GET("/meals", {
    params: { query: name ? { name, limit: 20 } : { limit: 20 } },
  });
  return data?.items ?? [];
}
