import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { serverApi } from "@/lib/api";
import { ShoppingDayForm } from "./shopping-day-form";

export default async function SettingsPage() {
  const api = await serverApi();
  const { data: me } = await api.GET("/users/me");

  if (!me) {
    return <p className="text-destructive">Impossible de charger le profil.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl tracking-tight">Réglages</h1>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Semaine</CardTitle>
          <CardDescription>
            Le jour de courses borne ta semaine : elle va du dîner de ce jour au
            déjeuner du même jour la semaine suivante.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ShoppingDayForm current={me.shoppingDay} />
        </CardContent>
      </Card>
    </div>
  );
}
