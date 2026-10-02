"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Même forme canonique que l'API (minuscules, espaces réduits) : « Hiver » retrouve « hiver ». */
export function normalizeTag(tag: string): string {
  return tag.normalize("NFC").trim().replace(/\s+/g, " ").toLowerCase();
}

export function TagInput({
  id,
  value,
  onChange,
  suggestions,
}: {
  id?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: { name: string; count: number }[];
}) {
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();

  const query = normalizeTag(draft);
  const matches = suggestions
    .filter((s) => !value.includes(s.name) && s.name.includes(query))
    .slice(0, 8);
  const canCreate = query !== "" && !value.includes(query) && !matches.some((m) => m.name === query);
  const options = [...matches.map((m) => m.name), ...(canCreate ? [query] : [])];
  const shown = open && options.length > 0;

  function add(tag: string) {
    const tagName = normalizeTag(tag);
    if (tagName && !value.includes(tagName)) onChange([...value, tagName]);
    setDraft("");
    setActive(0);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      if (query === "") return;
      e.preventDefault();
      add(options[active] ?? query);
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    } else if (e.key === "ArrowDown" && shown) {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp" && shown) {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Escape" && shown) {
      e.stopPropagation();
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <div className="flex min-h-9 flex-wrap items-center gap-1 rounded-lg border border-input px-2 py-1 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-0.5 pr-0.5">
            {tag}
            <button
              type="button"
              aria-label={`Retirer le tag ${tag}`}
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="rounded-full p-0.5 hover:bg-muted-foreground/20"
            >
              <X />
            </button>
          </Badge>
        ))}
        <input
          id={id}
          role="combobox"
          aria-expanded={shown}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={shown ? `${listId}-${active}` : undefined}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          placeholder={value.length === 0 ? "hiver, rapide…" : ""}
          className="min-w-24 flex-1 bg-transparent py-0.5 text-sm outline-none"
        />
      </div>
      {shown ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-lg bg-popover p-1 text-sm shadow-md ring-1 ring-foreground/10"
        >
          {options.map((option, index) => {
            const suggestion = matches.find((m) => m.name === option);
            return (
              <li
                key={option}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                // mousedown et non click : le blur de l'input fermerait la liste avant.
                onMouseDown={(e) => {
                  e.preventDefault();
                  add(option);
                }}
                className={cn(
                  "flex cursor-pointer justify-between rounded-md px-2 py-1.5",
                  index === active && "bg-muted",
                )}
              >
                <span>{suggestion ? option : `Créer « ${option} »`}</span>
                {suggestion ? (
                  <span className="tabular-nums text-muted-foreground">{suggestion.count}</span>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
