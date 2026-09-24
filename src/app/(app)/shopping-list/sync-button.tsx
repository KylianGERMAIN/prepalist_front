"use client";

import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { syncShoppingList } from "./shopping-list-actions";

export function SyncButton() {
  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 size-4" />
          Synchroniser
        </Button>
      }
      title="Resynchroniser la liste ?"
      description="Les articles issus des plats sont recalculés : leurs coches et modifications sont perdues. Les articles ajoutés à la main sont conservés."
      confirmLabel="Synchroniser"
      onConfirm={async () => {
        const res = await syncShoppingList();
        if (res.ok) toast.success("Liste synchronisée depuis les plats");
        else toast.error(res.error);
      }}
    />
  );
}
