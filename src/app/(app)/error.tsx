"use client";

import { Button } from "@/components/ui/button";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
      <h1 className="text-2xl font-bold tracking-tight">Une erreur est survenue</h1>
      <p className="max-w-sm text-muted-foreground">
        Impossible de charger cette page pour le moment. Réessaie dans un instant.
      </p>
      <Button onClick={reset}>Réessayer</Button>
    </div>
  );
}
