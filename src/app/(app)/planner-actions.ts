"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api";
import { type ActionResult, errorText } from "@/lib/action-result";
import type { MealSummary } from "@/lib/models";

/** Remplit automatiquement les créneaux vides du plan (POST /plan/generate). */
export async function generatePlan(): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.POST("/plan/generate", {});
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/");
  revalidatePath("/shopping-list");
  return { ok: true };
}

/** Vide tous les créneaux et purge la liste de courses (DELETE /plan/slots). */
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
