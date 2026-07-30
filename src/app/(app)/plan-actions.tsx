"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Eraser, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearPlan, generatePlan } from "./planner-actions";

export function GeneratePlanButton() {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await generatePlan();
          if (res.ok) toast.success("Plan généré");
          else toast.error(res.error);
        })
      }
    >
      <Sparkles className="mr-2 size-4" />
      {pending ? "Génération…" : "Générer"}
    </Button>
  );
}

export function ClearPlanButton() {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => {
        // Destructif et sans annulation : la liste de courses part aussi, items
        // manuels compris.
        if (!confirm("Vider le plan et la liste de courses ?")) return;
        startTransition(async () => {
          const res = await clearPlan();
          if (res.ok) toast.success("Plan vidé");
          else toast.error(res.error);
        });
      }}
    >
      <Eraser className="mr-2 size-4" />
      {pending ? "Vidage…" : "Vider"}
    </Button>
  );
}
