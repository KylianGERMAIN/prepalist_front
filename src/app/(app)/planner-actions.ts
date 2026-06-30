"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api";
import { type ActionResult, errorText } from "@/lib/action-result";
import type { MealSummary } from "@/lib/models";

/** Crée la semaine courante (POST /weeks, startDate par défaut = semaine en cours côté back). */
export async function createWeek(): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.POST("/weeks", { body: {} });
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/");
  return { ok: true };
}

/** Remplit automatiquement les créneaux de la semaine (POST /weeks/:id/generate). */
export async function generateWeek(weekId: string): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.POST("/weeks/{id}/generate", {
    params: { path: { id: weekId } },
  });
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/");
  return { ok: true };
}

/** Assigne (ou vide si mealId null) un repas sur un créneau, avec portions optionnelles. */
export async function assignSlot(
  weekId: string,
  slotId: string,
  mealId: string | null,
  servings?: number,
): Promise<ActionResult> {
  const api = await serverApi();
  const body: { mealId?: string | null; servings?: number } = { mealId };
  if (servings !== undefined) body.servings = servings;
  const { error } = await api.PATCH("/weeks/{id}/slots/{slotId}", {
    params: { path: { id: weekId, slotId } },
    body,
  });
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/");
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
