import Link from "next/link";
import { serverApi } from "@/lib/api";
import { ShoppingListView } from "./shopping-list-view";
import { SyncButton } from "./sync-button";

export default async function ShoppingListPage() {
  // Le back crée le plan au premier GET : pas d'état vide à distinguer d'une erreur.
  const api = await serverApi();
  const { data: list } = await api.GET("/plan/shopping-list", {});

  if (!list) {
    return (
      <p className="text-destructive">
        Impossible de charger la liste de courses.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-medium tracking-tight">
          Liste de courses
        </h1>
        <SyncButton dismissedCount={list.dismissedCount} />
      </div>
      {list.incompleteMeals.length > 0 ? (
        <p role="status" className="rounded-md bg-warning px-3 py-2 text-sm text-warning-foreground">
          {list.incompleteMeals.length === 1
            ? "1 repas planifié n’a pas d’ingrédients et manque à cette liste : "
            : `${list.incompleteMeals.length} repas planifiés n’ont pas d’ingrédients et manquent à cette liste : `}
          {list.incompleteMeals.map((meal) => meal.name).join(", ")}.{" "}
          <Link href="/meals?incomplete=true" className="font-medium underline underline-offset-4">
            Les compléter
          </Link>
        </p>
      ) : null}
      <ShoppingListView items={list.items} />
    </div>
  );
}
