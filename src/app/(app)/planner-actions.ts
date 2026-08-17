"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api";
import { type ActionResult, errorText } from "@/lib/action-result";
import type { MealSummary } from "@/lib/models";

/**
 * Ne remplit que les créneaux vides : une assignation manuelle n'est jamais écrasée.
 *
 * Synchronise ensuite la liste explicitement, car l'init paresseuse du back n'agit
 * que sur une liste vide : un seul item manuel survivant masquerait le nouveau plan.
 */
export async function generatePlan(): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.POST("/plan/generate", {});
  if (error) return { ok: false, error: errorText(error) };

  // La génération est déjà acquise en base : un rejet réseau de la synchro (back
  // tombé entre les deux appels) ne doit pas remonter jusqu'à error.tsx.
  const synced = await api
    .POST("/plan/shopping-list/sync", {})
    .then((res) => !res.error)
    .catch(() => false);

  revalidatePath("/");
  revalidatePath("/shopping-list");

  if (!synced) {
    return {
      ok: true,
      warning:
        "Plan généré, mais la liste de courses n'a pas pu être resynchronisée. Lance Synchroniser depuis la liste.",
    };
  }
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

/** `mealId` à `null` vide le créneau. */
export async function assignSlot(
  slotId: string,
  mealId: string | null,
  servings?: number,
): Promise<ActionResult> {
  const api = await serverApi();
  const body: { mealId?: string | null; servings?: number } = { mealId };
  if (servings !== undefined) body.servings = servings;
  const { error } = await api.PATCH("/plan/slots/{slotId}", {
    params: { path: { slotId } },
    body,
  });
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/");
  revalidatePath("/shopping-list");
  return { ok: true };
}

export async function searchMeals(name: string): Promise<MealSummary[]> {
  const api = await serverApi();
  const { data } = await api.GET("/meals", {
    params: { query: name ? { name, limit: 20 } : { limit: 20 } },
  });
  return data?.items ?? [];
}
