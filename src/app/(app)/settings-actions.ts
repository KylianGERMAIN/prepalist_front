"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api";
import { type ActionResult, errorText } from "@/lib/action-result";

/** `shoppingDay` : 0 = dimanche … 6 = samedi. */
export async function updateShoppingDay(
  shoppingDay: number,
): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.PATCH("/users/me", { body: { shoppingDay } });
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/settings");
  return { ok: true };
}
