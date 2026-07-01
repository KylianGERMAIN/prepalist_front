import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { serverApi } from "@/lib/api";
import { WeekGrid } from "./week-grid";
import { CreateWeekButton } from "./week-actions";

export default async function PlannerPage() {
  const api = await serverApi();
  const { data: week, response } = await api.GET("/weeks/current");

  // On ne bascule en « état vide » que sur un vrai 404 (le back ne crée pas la semaine).
  // Toute autre erreur (500, etc.) doit se voir, pas se déguiser en « aucune semaine ».
  if (!week && response.status !== 404) {
    return <p className="text-destructive">Impossible de charger la semaine.</p>;
  }

  if (!week) {
    return (
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Aucune semaine en cours</CardTitle>
          <CardDescription>Crée la semaine courante pour planifier tes repas.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateWeekButton />
        </CardContent>
      </Card>
    );
  }

  return <WeekGrid week={week} />;
}
