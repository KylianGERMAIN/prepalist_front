"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api";
import { type ActionResult, errorText } from "@/lib/action-result";

/** Met à jour le jour de courses (0 = dimanche … 6 = samedi) via PATCH /users/me. */
export async function updateShoppingDay(
  shoppingDay: number,
): Promise<ActionResult> {
  const api = await serverApi();
  const { error } = await api.PATCH("/users/me", { body: { shoppingDay } });
  if (error) return { ok: false, error: errorText(error) };
  revalidatePath("/settings");
  revalidatePath("/"); // le début de la semaine courante dépend du jour de courses
  return { ok: true };
}
