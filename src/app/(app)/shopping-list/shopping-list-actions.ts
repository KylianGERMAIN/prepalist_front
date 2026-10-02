"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api";
import { type ActionResult, errorText } from "@/lib/action-result";
import type { Aisle } from "@/lib/aisles";
import type {
  AddShoppingItemInput,
  ClearScope,
  UpdateShoppingItemInput,
} from "@/lib/models";

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

/** Admin : vaut pour toutes les listes, l'article issu des plats suivant le rayon de son ingrédient. */
export async function updateIngredientAisle(
  ingredientId: string,
  aisle: Aisle,
): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.PATCH("/ingredients/{id}", {
    params: { path: { id: ingredientId } },
    body: { aisle },
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
