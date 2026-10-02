"use client";

import { toast } from "sonner";
import { Share2 } from "lucide-react";
import type { ShoppingListItem } from "@/lib/models";
import { Button } from "@/components/ui/button";
import { formatListAsText } from "./shopping-list-utils";

export function ShareButton({ items }: { items: ShoppingListItem[] }) {
  async function share() {
    const text = formatListAsText(items);
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Liste de courses", text });
      } catch (err) {
        // Fermer la feuille de partage rejette avec AbortError : ce n'est pas une erreur.
        if ((err as Error).name !== "AbortError") toast.error("Partage impossible.");
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Liste copiée");
    } catch {
      toast.error("Copie impossible.");
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={share}>
      <Share2 className="mr-2 size-4" />
      Partager
    </Button>
  );
}
