import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
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
            <NavLinks />
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-20 sm:px-6 md:pb-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
