"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { syncShoppingList } from "./shopping-list-actions";

/** Rien à restaurer : le bouton disparaît, la liste suit déjà le plan toute seule. */
export function SyncButton({ dismissedCount }: { dismissedCount: number }) {
  const [pending, startTransition] = useTransition();
  if (dismissedCount === 0) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await syncShoppingList();
          if (res.ok) toast.success("Articles supprimés restaurés");
          else toast.error(res.error);
        })
      }
    >
      <RotateCcw className="mr-2 size-4" />
      Restaurer ({dismissedCount})
    </Button>
  );
}
