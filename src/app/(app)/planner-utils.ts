import type { Meal, WeekSlot } from "@/lib/models";

export type SlotAction =
  | { type: "clear"; slotId: string }
  | { type: "assign"; slotId: string; meal: Meal; servings: number };

/** Reducer pur de l'état optimiste des créneaux : remplace (immutable) le slot ciblé. */
export function slotsReducer(
  state: WeekSlot[],
  action: SlotAction,
): WeekSlot[] {
  return state.map((s) => {
    if (s.id !== action.slotId) return s;
    if (action.type === "clear") return { ...s, meal: null, mealId: null };
    return {
      ...s,
      meal: action.meal,
      mealId: action.meal.id,
      servings: action.servings,
    };
  });
}

/** Ajoute n jours à une date ISO (YYYY-MM-DD) et renvoie la nouvelle date ISO, sans dérive de fuseau. */
export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Date du jour au format ISO local (YYYY-MM-DD). */
export function todayIso(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export const RECENT_DAYS = 7;

/** Vrai si le repas a été cuisiné dans les RECENT_DAYS derniers jours (signal "à varier"). */
export function cookedRecently(iso: string | null): boolean {
  if (!iso) return false;
  const days = (Date.now() - new Date(iso).getTime()) / 86_400_000;
  return days >= 0 && days < RECENT_DAYS;
}
