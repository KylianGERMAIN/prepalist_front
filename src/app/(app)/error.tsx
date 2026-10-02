"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // Une erreur serveur (avec digest) est déjà capturée par `onRequestError`.
  useEffect(() => {
    if (!error.digest) Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
      <h1 className="text-2xl font-bold tracking-tight">Une erreur est survenue</h1>
      <p className="max-w-sm text-muted-foreground">
        Impossible de charger cette page pour le moment. Réessaie dans un instant.
      </p>
      {error.digest ? (
        <p className="text-xs text-muted-foreground">
          Code : <span className="font-mono">{error.digest}</span>
        </p>
      ) : null}
      <Button onClick={reset}>Réessayer</Button>
    </div>
  );
}
