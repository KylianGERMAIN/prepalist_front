"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Combobox } from "@base-ui/react/combobox";
import { Check, Plus, X } from "lucide-react";
import type { TagCount } from "@/lib/models";

/** Même forme canonique que l'API (minuscules, espaces réduits) : « Hiver » retrouve « hiver ». */
export function normalizeTag(tag: string): string {
  return tag.normalize("NFC").trim().replace(/\s+/g, " ").toLowerCase();
}

export const TAG_MAX_LENGTH = 40;

type Option = { value: string; count?: number; creatable?: boolean };

export function TagInput({
  id,
  value,
  onChange,
  suggestions,
}: {
  id?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: TagCount[];
}) {
  const [query, setQuery] = useState("");
  const highlighted = useRef<Option | undefined>(undefined);
  const typed = normalizeTag(query);

  const selected = useMemo(() => value.map((tag) => ({ value: tag })), [value]);
  const known = useMemo(() => suggestions.map((s) => ({ value: s.name, count: s.count })), [suggestions]);
  const exists = typed === "" || value.includes(typed) || known.some((o) => o.value === typed);
  const items: Option[] = exists ? known : [...known, { value: typed, creatable: true }];

  function addAll(tags: string[]) {
    const added = tags.map((t) => normalizeTag(t).slice(0, TAG_MAX_LENGTH)).filter(Boolean);
    onChange([...new Set([...value, ...added])]);
    setQuery("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    // La virgule sépare des tags : elle valide le texte tapé, jamais une suggestion.
    if (e.key === ",") {
      e.preventDefault();
      if (typed !== "") addAll([typed]);
    } else if (e.key === "Enter" && typed !== "" && !highlighted.current) {
      e.preventDefault();
      addAll([typed]);
    }
  }

  return (
    <Combobox.Root
      multiple
      autoHighlight
      items={items}
      value={selected}
      onValueChange={(next: Option[], details) => {
        // Échap sur la liste fermée viderait toutes les puces : on laisse l'événement
        // remonter jusqu'à la modale, qui se ferme.
        if (details.reason === "escape-key") {
          details.cancel();
          details.allowPropagation();
          return;
        }
        onChange([...new Set(next.map((o) => normalizeTag(o.value)))]);
        setQuery("");
      }}
      inputValue={query}
      onInputValueChange={(next) => {
        // Un collage « a, b » ajoute deux tags plutôt qu'un tag contenant une virgule.
        if (next.includes(",")) {
          const parts = next.split(",");
          addAll(parts.slice(0, -1));
          setQuery(parts.at(-1) ?? "");
        } else {
          setQuery(next);
        }
      }}
      onItemHighlighted={(item: Option | undefined) => {
        highlighted.current = item;
      }}
      isItemEqualToValue={(a: Option, b: Option) => a.value === b.value}
      itemToStringLabel={(o: Option) => o.value}
      filter={(o: Option, q: string) => o.creatable === true || o.value.includes(normalizeTag(q))}
    >
      <Combobox.InputGroup className="flex min-h-9 cursor-text flex-wrap items-center gap-1 rounded-lg border border-input px-2 py-1 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
        <Combobox.Chips className="flex w-full flex-wrap items-center gap-1">
          <Combobox.Value>
            {(chosen: Option[]) => (
              <>
                {chosen.map((tag) => (
                  <Combobox.Chip
                    key={tag.value}
                    aria-label={tag.value}
                    className="flex h-6 items-center gap-0.5 rounded-full bg-secondary pr-0.5 pl-2 text-xs text-secondary-foreground outline-none focus-within:ring-2 focus-within:ring-ring/50 data-highlighted:bg-muted"
                  >
                    {tag.value}
                    <Combobox.ChipRemove
                      aria-label={`Retirer le tag ${tag.value}`}
                      className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                    >
                      <X className="size-3" />
                    </Combobox.ChipRemove>
                  </Combobox.Chip>
                ))}
                <Combobox.Input
                  id={id}
                  maxLength={TAG_MAX_LENGTH}
                  placeholder={chosen.length === 0 ? "hiver, rapide…" : ""}
                  onKeyDown={onKeyDown}
                  className="h-6 min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </>
            )}
          </Combobox.Value>
        </Combobox.Chips>
      </Combobox.InputGroup>
      <Combobox.Portal>
        <Combobox.Positioner className="z-50 outline-none" sideOffset={4}>
          <Combobox.Popup
            aria-label="Tags existants"
            className="max-h-56 w-(--anchor-width) overflow-y-auto rounded-lg bg-popover p-1 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10"
          >
            <Combobox.Empty className="px-2 py-1.5 text-muted-foreground empty:hidden">
              Aucun tag.
            </Combobox.Empty>
            <Combobox.List>
              {(item: Option) => (
                <Combobox.Item
                  key={item.creatable ? `create:${item.value}` : item.value}
                  value={item}
                  className="flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 outline-none select-none data-highlighted:bg-muted"
                >
                  {item.creatable ? (
                    <>
                      <Plus className="size-4" />
                      Créer « {item.value} »
                    </>
                  ) : (
                    <>
                      <Combobox.ItemIndicator className="w-4">
                        <Check className="size-4" />
                      </Combobox.ItemIndicator>
                      <span className="flex-1">{item.value}</span>
                      <span className="tabular-nums text-muted-foreground">{item.count}</span>
                    </>
                  )}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
