"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { syncShoppingList } from "./shopping-list-actions";

export function SyncButton() {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await syncShoppingList();
          if (res.ok) toast.success("Liste synchronisée depuis les plats");
          else toast.error(res.error);
        })
      }
    >
      <RefreshCw className={pending ? "mr-2 size-4 animate-spin" : "mr-2 size-4"} />
      {pending ? "Synchronisation…" : "Synchroniser"}
    </Button>
  );
}
