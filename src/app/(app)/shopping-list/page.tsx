import { serverApi } from "@/lib/api";
import { ShoppingListView } from "./shopping-list-view";
import { SyncButton } from "./sync-button";

export default async function ShoppingListPage() {
  // Le back crée le plan et initialise la liste au premier GET : pas d'état vide
  // à distinguer d'une erreur.
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
        <SyncButton />
      </div>
      <ShoppingListView items={list.items} />
    </div>
  );
}
