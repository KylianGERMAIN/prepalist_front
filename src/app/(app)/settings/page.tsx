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
          <CardTitle>Jour de courses</CardTitle>
          <CardDescription>
            Premier jour de ton plan : il sert à nommer les colonnes du planning.
            Le changement s’applique au prochain plan, c’est-à-dire au prochain
            vidage — ton plan en cours n’est pas déplacé.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ShoppingDayForm current={me.shoppingDay} />
        </CardContent>
      </Card>
    </div>
  );
}
