"use client";

import { useState, useTransition, type ReactElement } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * Dialog de confirmation réutilisable (delete, actions destructives). Réutilisé F2/F3.
 * `onConfirm` peut être async (ex. Server Action) ; le bouton reste désactivé le temps de l'appel.
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirmer",
  onConfirm,
}: {
  trigger: ReactElement;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await onConfirm();
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={pending}>
            {pending ? "…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
