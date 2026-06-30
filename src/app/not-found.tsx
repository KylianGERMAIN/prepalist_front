import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">404</p>
      <h1 className="text-2xl font-bold tracking-tight">Page introuvable</h1>
      <p className="max-w-sm text-muted-foreground">Cette page n&apos;existe pas ou a été déplacée.</p>
      <Link href="/" className={buttonVariants()}>
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
