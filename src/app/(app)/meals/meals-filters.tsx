"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/** Barre de filtres : pilote les query params lus par la page serveur (`/meals?name=&tag=&favorite=`). */
export function MealsFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const [name, setName] = useState(sp.get("name") ?? "");
  const [tag, setTag] = useState(sp.get("tag") ?? "");
  const [favorite, setFavorite] = useState(sp.get("favorite") === "true");

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (name) q.set("name", name);
    if (tag) q.set("tag", tag);
    if (favorite) q.set("favorite", "true");
    const qs = q.toString();
    router.push(qs ? `/meals?${qs}` : "/meals");
  }

  function reset() {
    setName("");
    setTag("");
    setFavorite(false);
    router.push("/meals");
  }

  return (
    <form onSubmit={apply} className="flex flex-wrap items-center gap-2">
      <Input
        placeholder="Nom"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="max-w-[200px]"
      />
      <Input
        placeholder="Tag"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        className="max-w-[160px]"
      />
      <Button
        type="button"
        variant={favorite ? "default" : "outline"}
        onClick={() => setFavorite((v) => !v)}
      >
        <Star className="mr-2 size-4" />
        Favoris
      </Button>
      <Button type="submit">Filtrer</Button>
      <Button type="button" variant="ghost" onClick={reset}>
        Réinitialiser
      </Button>
    </form>
  );
}
