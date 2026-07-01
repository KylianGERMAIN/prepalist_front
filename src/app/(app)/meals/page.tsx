import Link from "next/link";
import { serverApi } from "@/lib/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { MealsFilters } from "./meals-filters";
import { MealsTable } from "./meals-table";
import { MealDialog } from "./meal-dialog";

const LIMIT = 20;

type SearchParams = { page?: string; name?: string; tag?: string; favorite?: string };

export default async function MealsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const api = await serverApi();
  const { data, error } = await api.GET("/meals", {
    params: {
      query: {
        page,
        limit: LIMIT,
        ...(sp.favorite === "true" ? { favorite: true } : {}),
        ...(sp.tag ? { tag: sp.tag } : {}),
        ...(sp.name ? { name: sp.name } : {}),
      },
    },
  });

  if (error) {
    return <p className="text-destructive">Impossible de charger les repas.</p>;
  }

  const meals = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / LIMIT));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-medium tracking-tight">Mes repas</h1>
        <MealDialog mode="create" />
      </div>

      <MealsFilters />
      <MealsTable meals={meals} />

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-4">
          {page > 1 ? (
            <Link href={pageHref(sp, page - 1)} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Précédent
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Précédent
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={pageHref(sp, page + 1)} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Suivant
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Suivant
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}

/** Construit l'URL d'une page en conservant les filtres courants. */
function pageHref(sp: SearchParams, page: number): string {
  const q = new URLSearchParams();
  if (sp.name) q.set("name", sp.name);
  if (sp.tag) q.set("tag", sp.tag);
  if (sp.favorite === "true") q.set("favorite", "true");
  q.set("page", String(page));
  return `/meals?${q}`;
}
