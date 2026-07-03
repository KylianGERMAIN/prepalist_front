import { serverApi } from "@/lib/api";
import type { Week } from "@/lib/models";

/**
 * Résout la semaine à afficher depuis le `?week=` de l'URL (source de vérité,
 * partagée planner ↔ liste) : `GET /weeks?startDate=` si présent, sinon la
 * semaine courante. `status` permet aux pages de distinguer un vrai 404
 * (« aucune semaine, propose la création ») d'une vraie erreur.
 */
export async function resolveWeek(
  week?: string,
): Promise<{ week: Week | undefined; status: number }> {
  const api = await serverApi();
  const { data, response } = week
    ? await api.GET("/weeks", { params: { query: { startDate: week } } })
    : await api.GET("/weeks/current");
  return { week: data, status: response.status };
}
