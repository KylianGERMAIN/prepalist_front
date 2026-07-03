import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WeekGrid } from "./week-grid";
import { WeekNav } from "./week-nav";
import { CreateWeekButton } from "./week-actions";
import { resolveWeek } from "./week-resolver";
import { todayIso } from "./planner-utils";

export default async function PlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week: selected } = await searchParams;
  const { week, status } = await resolveWeek(selected);

  // On ne bascule en « état vide » que sur un vrai 404 (le back ne crée pas la semaine).
  // Toute autre erreur (500, etc.) doit se voir, pas se déguiser en « aucune semaine ».
  if (!week && status !== 404) {
    return <p className="text-destructive">Impossible de charger la semaine.</p>;
  }

  if (!week) {
    return (
      <div className="space-y-4">
        <WeekNav startDate={selected ?? todayIso()} basePath="/" />
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Aucune semaine planifiée</CardTitle>
            <CardDescription>Crée cette semaine pour planifier tes repas.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateWeekButton startDate={selected} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <WeekNav startDate={week.startDate} basePath="/" />
      <WeekGrid week={week} />
    </div>
  );
}
