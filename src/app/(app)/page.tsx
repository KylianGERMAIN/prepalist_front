import { serverApi } from "@/lib/api";
import { PlanGrid } from "./plan-grid";
import { todayInAppTimeZone } from "./planner-today";
import { dayIndexOf } from "./planner-utils";

export default async function PlannerPage() {
  const api = await serverApi();
  // Le back crée le plan à la volée : pas d'état vide à gérer, pas de date à passer.
  const { data: plan } = await api.GET("/plan", {});

  if (!plan) {
    return <p className="text-destructive">Impossible de charger le plan.</p>;
  }

  // Résolu côté serveur : avec le fuseau du navigateur, SSR et hydratation peuvent
  // désigner deux jours différents.
  const todayIndex = dayIndexOf(
    plan.startDate,
    todayInAppTimeZone(),
    plan.dayCount,
  );

  return <PlanGrid plan={plan} todayIndex={todayIndex} />;
}
