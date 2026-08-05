"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api";
import { type ActionResult, errorText } from "@/lib/action-result";
import type {
  AddShoppingItemInput,
  UpdateShoppingItemInput,
} from "@/lib/models";

/** Coche/décoche un item (PATCH) ; togglable sur tout item, dérivé comme manuel. */
export async function toggleChecked(
  itemId: string,
  checked: boolean,
): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.PATCH("/plan/shopping-list/items/{itemId}", {
    params: { path: { itemId } },
    body: { checked },
  });
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/shopping-list");
  return { ok: true };
}

/** Ajoute un item manuel (POST). */
export async function addManualItem(
  input: AddShoppingItemInput,
): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.POST("/plan/shopping-list/items", {
    body: input,
  });
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/shopping-list");
  return { ok: true };
}

/** Édite un item (PATCH) : checked et/ou contenu (name/quantity/unit), dérivé comme manuel. */
export async function updateItem(
  itemId: string,
  patch: UpdateShoppingItemInput,
): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.PATCH("/plan/shopping-list/items/{itemId}", {
    params: { path: { itemId } },
    body: patch,
  });
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/shopping-list");
  return { ok: true };
}

/** Supprime un item (DELETE), dérivé comme manuel. */
export async function deleteItem(itemId: string): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.DELETE("/plan/shopping-list/items/{itemId}", {
    params: { path: { itemId } },
  });
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/shopping-list");
  return { ok: true };
}

/** Resynchronise les items dérivés depuis les plats (POST /sync) ; préserve cochés et manuels. */
export async function syncShoppingList(): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.POST("/plan/shopping-list/sync", {});
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/shopping-list");
  return { ok: true };
}
