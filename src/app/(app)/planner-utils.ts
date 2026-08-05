import type { Meal, PlanSlot } from "@/lib/models";

export type SlotAction =
  | { type: "clear"; slotId: string }
  | { type: "assign"; slotId: string; meal: Meal; servings: number };

/** Reducer pur de l'état optimiste des créneaux : remplace (immutable) le slot ciblé. */
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

/**
 * Libellé d'un jour du plan : son nom, sans date. `startDate` sert d'ancre pour
 * savoir sur quel jour de la semaine tombe l'index 0.
 *
 * Au-delà de 7 jours les noms se répètent : on suffixe le numéro de tour
 * (« Mar +1 ») pour distinguer deux mardis du même plan.
 */
export function dayLabel(startDate: string, dayIndex: number): string {
  const startDay = new Date(`${startDate}T00:00:00`).getDay();
  const name = DAY_LABELS[(startDay + dayIndex) % 7];
  const lap = Math.floor(dayIndex / 7);
  return lap === 0 ? name : `${name} +${lap}`;
}

/**
 * Index du jour `today` dans le plan, ou `null` s'il tombe hors des bornes
 * (plan pas encore commencé, ou déjà écoulé).
 *
 * Fonction pure : les deux dates sont interprétées en UTC, donc arithmétique
 * calendaire seule, insensible aux journées de 23 ou 25 h.
 */
export function dayIndexOf(
  startDate: string,
  today: string,
  dayCount: number,
): number | null {
  // Deux minuits UTC : l'écart est toujours un multiple exact de 86 400 000,
  // donc pas d'arrondi à prévoir, contrairement à un calcul en heure locale.
  const diff =
    (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) /
    86_400_000;
  return diff >= 0 && diff < dayCount ? diff : null;
}

export const RECENT_DAYS = 7;

/** Vrai si le repas a été cuisiné dans les RECENT_DAYS derniers jours (signal "à varier"). */
export function cookedRecently(iso: string | null): boolean {
  if (!iso) return false;
  const days = (Date.now() - new Date(iso).getTime()) / 86_400_000;
  return days >= 0 && days < RECENT_DAYS;
}
