"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { CalendarPlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createWeek, generateWeek } from "./planner-actions";

export function CreateWeekButton() {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await createWeek();
          if (!res.ok) toast.error(res.error);
        })
      }
    >
      <CalendarPlus className="mr-2 size-4" />
      {pending ? "Création…" : "Créer la semaine"}
    </Button>
  );
}

export function GenerateWeekButton({ weekId }: { weekId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await generateWeek(weekId);
          if (res.ok) toast.success("Semaine générée");
          else toast.error(res.error);
        })
      }
    >
      <Sparkles className="mr-2 size-4" />
      {pending ? "Génération…" : "Générer"}
    </Button>
  );
}
