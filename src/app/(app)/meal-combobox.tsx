"use client";

import { useEffect, useState, useTransition, type RefObject } from "react";
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

export function MealCombobox({
  value,
  label,
  onSelect,
  focusAfterSelect,
}: {
  value?: string;
  label?: string;
  onSelect: (meal: MealSummary) => void;
  focusAfterSelect?: RefObject<HTMLElement | null>;
}) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<MealSummary[]>([]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    // Query vide = les repas récents, pas une liste vide.
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
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setPicked(false);
        setOpen(next);
      }}
    >
      <PopoverTrigger
        render={
          <Button type="button" variant="outline" role="combobox" className="w-full justify-between font-normal">
            <span className={cn(!label && "text-muted-foreground")}>{label ?? "Choisir un repas"}</span>
            <ChevronsUpDown className="ml-2 size-4 opacity-50" />
          </Button>
        }
      />
      <PopoverContent
        className="w-[280px] p-0"
        align="start"
        // Une fonction court-circuiterait la garde de base-ui qui laisse le focus
        // là où l'utilisateur l'a mis : seul le cas « sélection » le redirige.
        finalFocus={picked && focusAfterSelect ? focusAfterSelect : true}
      >
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
                    setPicked(true);
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
