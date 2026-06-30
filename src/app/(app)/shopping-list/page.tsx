import Link from "next/link";
import { serverApi } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingListView } from "./shopping-list-view";

export default async function ShoppingListPage() {
  const api = await serverApi();
  const { data: week, response } = await api.GET("/weeks/current");

  // Même garde que la page planner : seul un vrai 404 = "pas de semaine", le reste est une erreur.
  if (!week && response.status !== 404) {
    return <p className="text-destructive">Impossible de charger la semaine.</p>;
  }

  if (!week) {
    return (
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Pas de semaine en cours</CardTitle>
          <CardDescription>Crée ta semaine et planifie des repas pour générer ta liste.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/" className={buttonVariants()}>
            Aller au planning
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Ici pas de 404 "métier" à distinguer (la semaine existe) : toute erreur est une vraie erreur.
  const { data: list, error } = await api.GET("/weeks/{id}/shopping-list", {
    params: { path: { id: week.id } },
  });

  if (error || !list) {
    return <p className="text-destructive">Impossible de charger la liste de courses.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Liste de courses</h1>
      {list.items.length === 0 ? (
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Liste vide</CardTitle>
            <CardDescription>
              Assigne des repas aux créneaux du planning pour remplir ta liste.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/" className={buttonVariants({ variant: "outline" })}>
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
