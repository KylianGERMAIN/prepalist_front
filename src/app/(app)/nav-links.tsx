"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CalendarDays, ShoppingCart, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Planning", icon: CalendarDays },
  { href: "/meals", label: "Repas", icon: UtensilsCrossed },
  { href: "/shopping-list", label: "Courses", icon: ShoppingCart },
] as const;

/** Égalité de route stricte pour "/" (sinon il matcherait tout), prefix sinon. */
function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Conserve la semaine sélectionnée (`?week=`) entre planner et liste, seuls écrans qui la partagent. */
function withWeek(href: string, week: string | null) {
  if (!week || (href !== "/" && href !== "/shopping-list")) return href;
  return `${href}?week=${week}`;
}

/** Liens horizontaux de la barre supérieure (md+). Actif souligné en primary olive. */
export function NavLinks() {
  const pathname = usePathname();
  const week = useSearchParams().get("week");
  return (
    <nav className="hidden items-center gap-4 text-sm md:flex">
      {LINKS.map(({ href, label }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={withWeek(href, week)}
            className={cn(
              "border-b-2 border-transparent pb-0.5 transition-colors",
              active
                ? "border-primary font-medium text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Bottom-nav fixe (mobile only). Item actif marqué par un fond accent miel désaturé. */
export function BottomNav() {
  const pathname = usePathname();
  const week = useSearchParams().get("week");
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-3 border-t border-sidebar-border bg-sidebar md:hidden">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={withWeek(href, week)}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 text-xs transition-colors",
              active
                ? "bg-accent/15 font-medium text-accent-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
