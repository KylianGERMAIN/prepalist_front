import { serverApi } from "@/lib/api";
import { LiveRefresh } from "./live-refresh";
import { ShoppingListView } from "./shopping-list-view";
import { SyncButton } from "./sync-button";

export default async function ShoppingListPage() {
  // Le back crée le plan au premier GET : pas d'état vide à distinguer d'une erreur.
  const api = await serverApi();
  const { data: list } = await api.GET("/plan/shopping-list", {});

  // `LiveRefresh` reste monté : après une erreur passagère, le tick suivant
  // ramène la liste sans rechargement manuel.
  if (!list) {
    return (
      <>
        <p className="text-destructive">
          Impossible de charger la liste de courses.
        </p>
        <LiveRefresh />
      </>
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
      <ShoppingListView items={list.items} />
      <LiveRefresh />
    </div>
  );
}
