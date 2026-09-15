"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api";
import { type ActionResult, errorText } from "@/lib/action-result";
import type {
  AddShoppingItemInput,
  UpdateShoppingItemInput,
} from "@/lib/models";

// `toggleChecked`, `updateItem` et `deleteItem` valent pour un item DERIVED comme
// pour un MANUAL : le back n'oppose les deux sources qu'à la synchro.

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

export async function deleteItem(itemId: string): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.DELETE("/plan/shopping-list/items/{itemId}", {
    params: { path: { itemId } },
  });
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/shopping-list");
  return { ok: true };
}

/** Préserve les items cochés et les manuels. */
export async function syncShoppingList(): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.POST("/plan/shopping-list/sync", {});
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/shopping-list");
  return { ok: true };
}
