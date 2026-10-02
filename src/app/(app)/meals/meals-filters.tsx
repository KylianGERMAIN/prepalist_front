"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import type { TagCount } from "@/lib/models";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";

/** Pilote les query params que la page serveur relit (`?name=&tag=&incomplete=`). */
export function MealsFilters({ tags }: { tags: TagCount[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [name, setName] = useState(sp.get("name") ?? "");
  const [tag, setTag] = useState(sp.get("tag") ?? "");
  const [incomplete, setIncomplete] = useState(sp.get("incomplete") === "true");

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (name) q.set("name", name);
    if (tag) q.set("tag", tag);
    if (incomplete) q.set("incomplete", "true");
    const qs = q.toString();
    router.push(qs ? `/meals?${qs}` : "/meals");
  }

  function reset() {
    setName("");
    setTag("");
    setIncomplete(false);
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
      <NativeSelect
        aria-label="Tag"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        className="w-auto max-w-[200px]"
      >
        <option value="">Tous les tags</option>
        {tag && !tags.some((t) => t.name === tag) ? <option value={tag}>{tag}</option> : null}
        {tags.map((t) => (
          <option key={t.name} value={t.name}>
            {t.name} ({t.count})
          </option>
        ))}
      </NativeSelect>
      <Button
        type="button"
        variant={incomplete ? "default" : "outline"}
        aria-pressed={incomplete}
        onClick={() => setIncomplete((v) => !v)}
      >
        À compléter
      </Button>
      <Button type="submit">Filtrer</Button>
      <Button type="button" variant="ghost" onClick={reset}>
        Réinitialiser
      </Button>
    </form>
  );
}
