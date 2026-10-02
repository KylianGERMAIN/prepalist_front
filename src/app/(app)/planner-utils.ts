import type { MealSummary, PlanSlot } from "@/lib/models";

export type SlotAction =
  | { type: "clear"; slotId: string }
  | { type: "assign"; slotId: string; meal: MealSummary; servings: number };

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
const DAY_NAMES = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

function dayOf(names: string[], startDate: string, dayIndex: number): string {
  const startDay = new Date(`${startDate}T00:00:00`).getDay();
  const name = names[(startDay + dayIndex) % 7];
  const lap = Math.floor(dayIndex / 7);
  return lap === 0 ? name : `${name} +${lap}`;
}

/** Au-delà de 7 jours, le tour est suffixé (« Mar +1 ») pour lever l'ambiguïté. */
export function dayLabel(startDate: string, dayIndex: number): string {
  return dayOf(DAY_LABELS, startDate, dayIndex);
}

/** Nom complet en minuscules, pour une phrase (« jeudi soir »). */
export function dayName(startDate: string, dayIndex: number): string {
  return dayOf(DAY_NAMES, startDate, dayIndex);
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

/** Midi → soir du même jour, soir → midi du lendemain : même règle que l'API. */
export function nextSlotOf(slots: PlanSlot[], slot: PlanSlot): PlanSlot | undefined {
  const [dayIndex, moment] =
    slot.slot === "LUNCH" ? [slot.dayIndex, "DINNER"] : [slot.dayIndex + 1, "LUNCH"];
  return slots.find((s) => s.dayIndex === dayIndex && s.slot === moment);
}

const ALSO_NEXT_KEY = "prepalist:also-next";

// localStorage peut lever (navigation privée, stockage bloqué) : l'option reste
// alors activée par défaut.
export function readAlsoNext(): boolean {
  try {
    return localStorage.getItem(ALSO_NEXT_KEY) !== "false";
  } catch {
    return true;
  }
}

export function writeAlsoNext(value: boolean): void {
  try {
    localStorage.setItem(ALSO_NEXT_KEY, String(value));
  } catch {
    // Préférence d'appareil : la perdre n'empêche pas l'enregistrement.
  }
}
