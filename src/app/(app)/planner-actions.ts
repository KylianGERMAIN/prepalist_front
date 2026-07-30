"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api";
import { type ActionResult, errorText } from "@/lib/action-result";
import type { MealSummary } from "@/lib/models";

/**
 * Remplit les créneaux vides du plan, puis resynchronise la liste de courses.
 *
 * La synchro est explicite ici parce que l'init paresseuse du back ne se
 * déclenche que sur une liste totalement vide : un seul item manuel survivant
 * suffirait à ce que les ingrédients du nouveau plan n'apparaissent jamais.
 */
export async function generatePlan(): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.POST("/plan/generate", {});
  if (error) return { ok: false, error: errorText(error) };

  // La génération est acquise en base : on révalide dans tous les cas, y compris
  // si la resynchronisation échoue, sinon l'écran resterait sur l'ancien plan.
  // Le catch couvre le rejet réseau (back tombé entre les deux appels), qui
  // sinon remonterait jusqu'à error.tsx alors que le plan est bien généré.
  const synced = await api
    .POST("/plan/shopping-list/sync", {})
    .then((res) => !res.error)
    .catch(() => false);

  revalidatePath("/");
  revalidatePath("/shopping-list");

  if (!synced) {
    return {
      ok: false,
      error:
        "Plan généré, mais la liste de courses n'a pas pu être resynchronisée. Lance Synchroniser depuis la liste.",
    };
  }
  return { ok: true };
}

/** Vide tous les créneaux et les items dérivés ; les items manuels sont conservés. */
export async function clearPlan(): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.DELETE("/plan/slots", {});
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/");
  revalidatePath("/shopping-list");
  return { ok: true };
}

/** Assigne (ou vide si mealId null) un repas sur un créneau, avec portions optionnelles. */
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

/** Recherche de repas (résumé) pour la combobox d'assignation d'un créneau. */
export async function searchMeals(name: string): Promise<MealSummary[]> {
  const api = await serverApi();
  const { data } = await api.GET("/meals", {
    params: { query: name ? { name, limit: 20 } : { limit: 20 } },
  });
  return data?.items ?? [];
}
