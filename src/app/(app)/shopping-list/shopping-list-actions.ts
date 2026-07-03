"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api";
import { type ActionResult, errorText } from "@/lib/action-result";
import type { AddShoppingItemInput, UpdateShoppingItemInput } from "@/lib/models";

/** Coche/décoche un item (PATCH) ; togglable sur tout item, dérivé comme manuel. */
export async function toggleChecked(
  weekId: string,
  itemId: string,
  checked: boolean,
): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.PATCH("/weeks/{id}/shopping-list/items/{itemId}", {
    params: { path: { id: weekId, itemId } },
    body: { checked },
  });
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/shopping-list");
  return { ok: true };
}

/** Ajoute un item manuel (POST). */
export async function addManualItem(
  weekId: string,
  input: AddShoppingItemInput,
): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.POST("/weeks/{id}/shopping-list/items", {
    params: { path: { id: weekId } },
    body: input,
  });
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/shopping-list");
  return { ok: true };
}

/** Édite un item (PATCH) : checked et/ou contenu (name/quantity/unit), dérivé comme manuel. */
export async function updateItem(
  weekId: string,
  itemId: string,
  patch: UpdateShoppingItemInput,
): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.PATCH("/weeks/{id}/shopping-list/items/{itemId}", {
    params: { path: { id: weekId, itemId } },
    body: patch,
  });
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/shopping-list");
  return { ok: true };
}

/** Supprime un item (DELETE), dérivé comme manuel. */
export async function deleteItem(
  weekId: string,
  itemId: string,
): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.DELETE("/weeks/{id}/shopping-list/items/{itemId}", {
    params: { path: { id: weekId, itemId } },
  });
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/shopping-list");
  return { ok: true };
}

/** Resynchronise les items dérivés depuis les plats (POST /sync) ; préserve cochés et manuels. */
export async function syncShoppingList(weekId: string): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.POST("/weeks/{id}/shopping-list/sync", {
    params: { path: { id: weekId } },
  });
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/shopping-list");
  return { ok: true };
}
