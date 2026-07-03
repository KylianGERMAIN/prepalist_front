import { Suspense } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Footer } from "./footer";
import { LogoutButton } from "./logout-button";
import { BottomNav, NavLinks } from "./nav-links";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-sidebar-border bg-sidebar">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-heading text-xl tracking-tight">
              PrepaList<span className="text-accent-foreground">.</span>
            </Link>
            {/* Suspense : useSearchParams (conservation du ?week=) bail out de la génération statique. */}
            <Suspense>
              <NavLinks />
            </Suspense>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/settings"
              aria-label="Réglages"
              title="Réglages"
              className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Settings className="size-4" />
            </Link>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        {children}
      </main>
      <Footer />
      <Suspense>
        <BottomNav />
      </Suspense>
    </div>
  );
}
