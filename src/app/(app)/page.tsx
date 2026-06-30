import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Connecté</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        Le socle d&apos;authentification est en place. Le planner arrive au lot F2.
      </CardContent>
    </Card>
  );
}
