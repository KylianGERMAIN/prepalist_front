import { serverApi } from "@/lib/api";
import { PlanGrid } from "./plan-grid";

export default async function PlannerPage() {
  const api = await serverApi();
  // Le back crée le plan à la volée : pas d'état vide à gérer, pas de date à passer.
  const { data: plan } = await api.GET("/plan", {});

  if (!plan) {
    return <p className="text-destructive">Impossible de charger le plan.</p>;
  }

  return <PlanGrid plan={plan} />;
}
