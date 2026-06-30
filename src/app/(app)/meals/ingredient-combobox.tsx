"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { Ingredient } from "@/lib/models";
import { createIngredient, searchIngredients } from "./actions";

/**
 * Combobox d'ingrédient : recherche serveur (debouncée) dans GET /ingredients
 * + création à la volée (POST /ingredients) si le terme tapé n'existe pas.
 */
export function IngredientCombobox({
  value,
  label,
  onSelect,
}: {
  value?: string;
  label?: string;
  onSelect: (ingredient: Ingredient) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Ingredient[]>([]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const term = query.trim();
    // `stale` ignore une réponse périmée arrivant après une frappe plus récente (race last-write-wins).
    let stale = false;
    const timer = setTimeout(() => {
      startTransition(async () => {
        const results = term.length < 1 ? [] : await searchIngredients(term);
        if (!stale) setItems(results);
      });
    }, 200);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [query, open]);

  function handleCreate() {
    const name = query.trim();
    if (!name) return;
    startTransition(async () => {
      const res = await createIngredient(name);
      if (res.ok) {
        onSelect(res.ingredient);
        setOpen(false);
        setQuery("");
      } else {
        toast.error(res.error);
      }
    });
  }

  const trimmed = query.trim();
  const exactExists = items.some((i) => i.name.toLowerCase() === trimmed.toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button type="button" variant="outline" role="combobox" className="w-full justify-between font-normal">
            <span className={cn(!label && "text-muted-foreground")}>{label ?? "Ingrédient"}</span>
            <ChevronsUpDown className="ml-2 size-4 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Rechercher un ingrédient…" value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>
              {pending ? "Recherche…" : trimmed ? "Aucun résultat." : "Tape pour rechercher."}
            </CommandEmpty>
            <CommandGroup>
              {items.map((ing) => (
                <CommandItem
                  key={ing.id}
                  value={ing.id}
                  onSelect={() => {
                    onSelect(ing);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 size-4", value === ing.id ? "opacity-100" : "opacity-0")} />
                  {ing.name}
                </CommandItem>
              ))}
              {trimmed && !exactExists ? (
                <CommandItem value={`__create__${trimmed}`} onSelect={handleCreate}>
                  <Plus className="mr-2 size-4" />
                  Créer « {trimmed} »
                </CommandItem>
              ) : null}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
