"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Eraser, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirmClear() {
    startTransition(async () => {
      const res = await clearPlan();
      if (res.ok) {
        setOpen(false);
        toast.success("Plan vidé");
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm">
            <Eraser className="mr-2 size-4" />
            Vider
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Vider le plan ?</DialogTitle>
          <DialogDescription>
            Tous les créneaux repassent à vide et les ingrédients déduits des
            plats sont retirés de la liste de courses. Les items que tu as
            ajoutés à la main sont conservés. Cette action est sans annulation.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-between">
          <DialogClose
            render={
              <Button variant="ghost" disabled={pending}>
                Annuler
              </Button>
            }
          />
          <Button variant="destructive" disabled={pending} onClick={confirmClear}>
            {pending ? "Vidage…" : "Vider"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
