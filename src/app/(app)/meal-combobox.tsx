"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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
import type { MealSummary } from "@/lib/models";
import { searchMeals } from "./planner-actions";

/** Combobox de sélection d'un repas (recherche serveur debouncée), pour assigner un créneau. */
export function MealCombobox({
  value,
  label,
  onSelect,
}: {
  value?: string;
  label?: string;
  onSelect: (meal: MealSummary) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<MealSummary[]>([]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    // À l'ouverture (query vide) on charge les repas récents (limit 20 côté action) ; sinon on filtre.
    let stale = false;
    const timer = setTimeout(() => {
      startTransition(async () => {
        const results = await searchMeals(query.trim());
        if (!stale) setItems(results);
      });
    }, 200);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [query, open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button type="button" variant="outline" role="combobox" className="w-full justify-between font-normal">
            <span className={cn(!label && "text-muted-foreground")}>{label ?? "Choisir un repas"}</span>
            <ChevronsUpDown className="ml-2 size-4 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Rechercher un repas…" value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>{pending ? "Recherche…" : "Aucun repas."}</CommandEmpty>
            <CommandGroup>
              {items.map((meal) => (
                <CommandItem
                  key={meal.id}
                  value={meal.id}
                  onSelect={() => {
                    onSelect(meal);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 size-4", value === meal.id ? "opacity-100" : "opacity-0")} />
                  {meal.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
