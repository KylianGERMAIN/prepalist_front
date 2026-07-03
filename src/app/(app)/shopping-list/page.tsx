import Link from "next/link";
import { serverApi } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WeekNav } from "../week-nav";
import { resolveWeek } from "../week-resolver";
import { todayIso } from "../planner-utils";
import { ShoppingListView } from "./shopping-list-view";

export default async function ShoppingListPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week: selected } = await searchParams;
  const plannerHref = selected ? `/?week=${selected}` : "/";
  const { week, status } = await resolveWeek(selected);

  // Même garde que la page planner : seul un vrai 404 = "pas de semaine", le reste est une erreur.
  if (!week && status !== 404) {
    return <p className="text-destructive">Impossible de charger la semaine.</p>;
  }

  if (!week) {
    return (
      <div className="space-y-4">
        <WeekNav startDate={selected ?? todayIso()} basePath="/shopping-list" />
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Pas de semaine planifiée</CardTitle>
            <CardDescription>Crée cette semaine et planifie des repas pour générer ta liste.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={plannerHref} className={buttonVariants()}>
              Aller au planning
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ici pas de 404 "métier" à distinguer (la semaine existe) : toute erreur est une vraie erreur.
  const api = await serverApi();
  const { data: list, error } = await api.GET("/weeks/{id}/shopping-list", {
    params: { path: { id: week.id } },
  });

  if (error || !list) {
    return <p className="text-destructive">Impossible de charger la liste de courses.</p>;
  }

  return (
    <div className="space-y-4">
      <WeekNav startDate={week.startDate} basePath="/shopping-list" />
      <h1 className="font-heading text-2xl font-medium tracking-tight">Liste de courses</h1>
      {list.items.length === 0 ? (
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Liste vide</CardTitle>
            <CardDescription>
              Assigne des repas aux créneaux du planning pour remplir ta liste.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={plannerHref} className={buttonVariants({ variant: "outline" })}>
              Aller au planning
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ShoppingListView items={list.items} />
      )}
    </div>
  );
}
