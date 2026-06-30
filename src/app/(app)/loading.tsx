import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center py-20 text-muted-foreground">
      <Loader2 className="size-5 animate-spin" />
      <span className="sr-only">Chargement…</span>
    </div>
  );
}
