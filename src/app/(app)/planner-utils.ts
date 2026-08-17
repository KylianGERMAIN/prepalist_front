import type { Meal, PlanSlot } from "@/lib/models";

export type SlotAction =
  | { type: "clear"; slotId: string }
  | { type: "assign"; slotId: string; meal: Meal; servings: number };

export function slotsReducer(
  state: PlanSlot[],
  action: SlotAction,
): PlanSlot[] {
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

const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

/** Au-delà de 7 jours, le tour est suffixé (« Mar +1 ») pour lever l'ambiguïté. */
export function dayLabel(startDate: string, dayIndex: number): string {
  const startDay = new Date(`${startDate}T00:00:00`).getDay();
  const name = DAY_LABELS[(startDay + dayIndex) % 7];
  const lap = Math.floor(dayIndex / 7);
  return lap === 0 ? name : `${name} +${lap}`;
}

export function dayIndexOf(
  startDate: string,
  today: string,
  dayCount: number,
): number | null {
  // Deux minuits UTC : l'écart est un multiple exact de 86 400 000, donc insensible
  // aux journées de 23 ou 25 h.
  const diff =
    (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) /
    86_400_000;
  return diff >= 0 && diff < dayCount ? diff : null;
}

export const RECENT_DAYS = 7;

export function cookedRecently(iso: string | null): boolean {
  if (!iso) return false;
  const days = (Date.now() - new Date(iso).getTime()) / 86_400_000;
  return days >= 0 && days < RECENT_DAYS;
}
