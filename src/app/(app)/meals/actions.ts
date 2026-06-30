"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api";
import type { CreateMealInput, Ingredient, Meal, UpdateMealInput } from "@/lib/models";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Normalise un corps d'erreur NestJS (`message` string ou string[]) en texte affichable. */
function errorText(error: unknown): string {
  const msg = (error as { message?: unknown } | null)?.message;
  if (Array.isArray(msg)) return msg.join(", ");
  if (typeof msg === "string") return msg;
  return "Erreur inattendue.";
}

/** Détail d'un repas (avec ses ingrédients) — pour préremplir le dialog d'édition. */
export async function getMeal(id: string): Promise<Meal | null> {
  const api = await serverApi();
  const { data } = await api.GET("/meals/{id}", { params: { path: { id } } });
  return data ?? null;
}

export async function createMeal(input: CreateMealInput): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.POST("/meals", { body: input });
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/meals");
  return { ok: true };
}

export async function updateMeal(id: string, input: UpdateMealInput): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.PATCH("/meals/{id}", { params: { path: { id } }, body: input });
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/meals");
  return { ok: true };
}

export async function deleteMeal(id: string): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.DELETE("/meals/{id}", { params: { path: { id } } });
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/meals");
  return { ok: true };
}

export async function markCooked(id: string): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.POST("/meals/{id}/cooked", { params: { path: { id } } });
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/meals");
  return { ok: true };
}

/** Recherche d'ingrédients (pour la combobox des lignes de repas). */
export async function searchIngredients(search: string): Promise<Ingredient[]> {
  const api = await serverApi();
  const { data } = await api.GET("/ingredients", {
    params: { query: search ? { search } : {} },
  });
  return data ?? [];
}

/** Crée un ingrédient à la volée (depuis la combobox) et le renvoie, ou remonte l'erreur. */
export async function createIngredient(
  name: string,
): Promise<{ ok: true; ingredient: Ingredient } | { ok: false; error: string }> {
  const api = await serverApi();
  const { data, error } = await api.POST("/ingredients", { body: { name } });
  if (error || !data) return { ok: false, error: errorText(error) };
  return { ok: true, ingredient: data };
}
