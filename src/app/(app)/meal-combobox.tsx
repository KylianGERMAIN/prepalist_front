"use client";

import { useEffect, useState, useTransition, type RefObject } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { toast } from "sonner";
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
import { createQuickMeal, searchMeals } from "./planner-actions";

export function MealCombobox({
  value,
  label,
  onSelect,
  focusAfterSelect,
  canCreate = false,
}: {
  value?: string;
  label?: string;
  onSelect: (meal: MealSummary) => void;
  focusAfterSelect?: RefObject<HTMLElement | null>;
  canCreate?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<MealSummary[]>([]);
  const [itemsFor, setItemsFor] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [creating, startCreating] = useTransition();
  const trimmed = query.trim();
  // Proposée seulement sur les résultats de la saisie en cours : sinon un Entrée
  // tapé avant leur retour créerait un doublon d'un repas existant.
  const canOfferCreate =
    canCreate &&
    trimmed !== "" &&
    itemsFor === trimmed &&
    !items.some((meal) => meal.name.toLocaleLowerCase("fr") === trimmed.toLocaleLowerCase("fr"));

  function pick(meal: MealSummary) {
    setPicked(true);
    onSelect(meal);
    setOpen(false);
  }

  function create() {
    startCreating(async () => {
      const res = await createQuickMeal(trimmed);
      if (res.ok) {
        toast.success(`« ${res.meal.name} » créé, ingrédients à compléter`);
        pick(res.meal);
      } else {
        toast.error(res.error);
      }
    });
  }

  useEffect(() => {
    if (!open) return;
    // Query vide = les repas récents, pas une liste vide.
    let stale = false;
    const timer = setTimeout(() => {
      startTransition(async () => {
        const results = await searchMeals(query.trim());
        if (!stale) {
          setItems(results);
          setItemsFor(query.trim());
        }
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
                  onSelect={() => pick(meal)}
                >
                  <Check className={cn("mr-2 size-4", value === meal.id ? "opacity-100" : "opacity-0")} />
                  {meal.name}
                </CommandItem>
              ))}
              {canOfferCreate ? (
                <CommandItem value={`__create__${trimmed}`} onSelect={create} disabled={creating}>
                  <Plus className="mr-2 size-4" />
                  {creating ? "Création…" : `Créer « ${trimmed} »`}
                </CommandItem>
              ) : null}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
