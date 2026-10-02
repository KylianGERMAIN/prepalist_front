"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api";
import { type ActionResult, errorText } from "@/lib/action-result";
import type {
  AddShoppingItemInput,
  UpdateShoppingItemInput,
} from "@/lib/models";
import type { ClearScope } from "./shopping-list-utils";

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

/** Les ids qui ne sont pas dans la liste du compte sont ignorés par le back. */
export async function deleteItems(itemIds: string[]): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.POST("/plan/shopping-list/items/delete", {
    body: { itemIds },
  });
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/shopping-list");
  return { ok: true };
}

export async function clearList(scope: ClearScope): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.DELETE("/plan/shopping-list/items", {
    params: { query: { scope } },
  });
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/shopping-list");
  return { ok: true };
}

/** Ramène les items dérivés supprimés à la main ; coches et items manuels sont conservés. */
export async function syncShoppingList(): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.POST("/plan/shopping-list/sync", {});
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/shopping-list");
  return { ok: true };
}
