"use client";

import { useEffect, useOptimistic, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { toast } from "sonner";
import { CheckSquare, Eraser, ListChecks, Pencil, ShoppingCart, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { asUnit, formatUnit } from "@/lib/units";
import type { ShoppingListItem } from "@/lib/models";
import type { ActionResult } from "@/lib/action-result";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useWakeLock } from "@/hooks/use-wake-lock";
import {
  addManualItem,
  clearList,
  deleteItem,
  deleteItems,
  toggleChecked,
  updateItem,
} from "./shopping-list-actions";
import {
  type ShoppingItemAction,
  readStoreMode,
  shoppingItemsReducer,
  sortItems,
  subscribeStoreMode,
  writeStoreMode,
} from "./shopping-list-utils";
import { AddItemForm } from "./add-item-form";
import { EditItemDialog } from "./edit-item-dialog";
import { ShareButton } from "./share-button";
import { StoreModeList } from "./store-mode-list";

export function ShoppingListView({ items }: { items: ShoppingListItem[] }) {
  const [optimisticItems, dispatch] = useOptimistic(items, shoppingItemsReducer);
  const [, startTransition] = useTransition();
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const selectButtonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const storeMode = useSyncExternalStore(subscribeStoreMode, readStoreMode, () => false);
  const wakeLockSupported = useWakeLock(storeMode);

  // L'attribut masque la navigation du layout (variante `store:`) ; il part avec la page.
  useEffect(() => {
    document.body.toggleAttribute("data-store-mode", storeMode);
    return () => document.body.removeAttribute("data-store-mode");
  }, [storeMode]);

  const sorted = sortItems(optimisticItems);
  // Un autre appareil peut retirer un article sélectionné pendant la sélection.
  const selectedIds = optimisticItems.filter((i) => selected.has(i.id)).map((i) => i.id);
  const checkedCount = optimisticItems.filter((i) => i.checked).length;
  const progress =
    optimisticItems.length === 0 ? 0 : Math.round((checkedCount / optimisticItems.length) * 100);

  useEffect(() => {
    if (!selecting) return;
    listRef.current?.querySelector("input")?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") stopSelecting();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selecting]);

  function stopSelecting() {
    setSelecting(false);
    setSelected(new Set());
    // Le bouton est démonté pendant la sélection : il faut attendre son retour.
    requestAnimationFrame(() => selectButtonRef.current?.focus());
  }

  function removeOne(item: ShoppingListItem) {
    startTransition(async () => {
      dispatch({ type: "remove", itemIds: [item.id] });
      const res = await deleteItem(item.id);
      if (!res.ok) {
        toast.error(res.error);
      } else if (item.source === "MANUAL") {
        // Un article manuel supprimé ne revient pas avec Restaurer : seul ce toast le rattrape.
        toast.success(`« ${item.name} » retiré`, {
          action: {
            label: "Annuler",
            onClick: () => {
              void addManualItem({
                name: item.name,
                unit: asUnit(item.unit ?? "") ?? "pièce",
                ...(item.quantity != null ? { quantity: item.quantity } : {}),
              });
            },
          },
        });
      }
    });
  }

  function run(action: ShoppingItemAction, call: () => Promise<ActionResult>, success?: string) {
    startTransition(async () => {
      dispatch(action);
      const res = await call();
      if (!res.ok) toast.error(res.error);
      else if (success) toast.success(success);
    });
  }

  function setChecked(item: ShoppingListItem, checked: boolean) {
    run({ type: "setChecked", itemId: item.id, checked }, () => toggleChecked(item.id, checked));
  }

  function checkInStore(item: ShoppingListItem, checked: boolean) {
    setChecked(item, checked);
    if (checked) {
      toast.success(`« ${item.name} » dans le panier`, {
        duration: 4000,
        action: { label: "Annuler", onClick: () => setChecked(item, false) },
      });
    }
  }

  function toggleSelected(itemId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (!next.delete(itemId)) next.add(itemId);
      return next;
    });
  }

  function removeSelected() {
    const itemIds = selectedIds;
    stopSelecting();
    run({ type: "remove", itemIds }, () => deleteItems(itemIds), `${itemIds.length} article(s) retiré(s)`);
  }

  if (storeMode) {
    return (
      <div className="space-y-3">
        {wakeLockSupported ? null : (
          <p className="text-sm text-muted-foreground">L’écran peut se mettre en veille sur ce navigateur.</p>
        )}
        <StoreModeList items={sorted} onSetChecked={checkInStore} />
        <div className="sticky bottom-2 z-10 flex items-center justify-between gap-3 rounded-md border bg-card p-2 shadow-sm">
          <span className="px-2 text-base text-muted-foreground">
            <span className="tnum">{checkedCount}</span> / <span className="tnum">{optimisticItems.length}</span>{" "}
            dans le panier
          </span>
          <Button size="lg" onClick={() => writeStoreMode(false)}>
            Terminer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            <span className="tnum">{checkedCount}</span> /{" "}
            <span className="tnum">{optimisticItems.length}</span> achetés
          </p>
          {optimisticItems.length > 0 && !selecting ? (
            <div className="flex flex-wrap items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => writeStoreMode(true)}>
                <ShoppingCart className="mr-2 size-4" />
                Mode magasin
              </Button>
              <ShareButton items={optimisticItems} />
              <Button ref={selectButtonRef} variant="ghost" size="sm" onClick={() => setSelecting(true)}>
                <ListChecks className="mr-2 size-4" />
                Sélectionner
              </Button>
              {checkedCount > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    run({ type: "clear", scope: "checked" }, () => clearList("checked"), "Articles achetés retirés")
                  }
                >
                  <CheckSquare className="mr-2 size-4" />
                  Retirer les achetés
                </Button>
              ) : null}
              <ConfirmDialog
                title="Vider la liste ?"
                description="Tous les articles sont retirés. Ceux issus des plats reviennent avec Restaurer."
                confirmLabel="Vider"
                onConfirm={() => run({ type: "clear", scope: "all" }, () => clearList("all"), "Liste vidée")}
                trigger={
                  <Button variant="ghost" size="sm">
                    <Eraser className="mr-2 size-4" />
                    Vider
                  </Button>
                }
              />
            </div>
          ) : null}
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all motion-reduce:transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Liste vide. Planifie des repas ou ajoute un article.
        </p>
      ) : (
        <ul ref={listRef} className="divide-y rounded-md border">
          {sorted.map((item) => (
            <li key={item.id} className="flex items-center gap-2 pr-2 hover:bg-muted/50">
              <label className="flex flex-1 cursor-pointer items-center gap-3 px-4 py-2.5">
                {selecting ? (
                  <input
                    type="checkbox"
                    aria-label={`Sélectionner ${item.name}`}
                    checked={selected.has(item.id)}
                    onChange={() => toggleSelected(item.id)}
                    className="size-4 accent-primary"
                  />
                ) : (
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => setChecked(item, !item.checked)}
                    className="size-4 accent-accent"
                  />
                )}
                <span
                  className={cn(
                    "flex flex-1 items-center gap-2",
                    item.checked && "text-muted-foreground line-through",
                  )}
                >
                  {item.name}
                  {selecting && item.checked ? <span className="sr-only">(acheté)</span> : null}
                  {item.source === "MANUAL" ? (
                    <Badge variant="secondary" className="font-normal">
                      Manuel
                    </Badge>
                  ) : null}
                </span>
              </label>
              <QuantityEditor
                item={item}
                disabled={selecting}
                onSave={(quantity) =>
                  run({ type: "setQuantity", itemId: item.id, quantity }, () =>
                    updateItem(item.id, { quantity }),
                  )
                }
              />
              {selecting ? null : (
                <div className="flex items-center gap-0.5">
                  <EditItemDialog
                    item={item}
                    trigger={
                      <Button variant="ghost" size="sm" title="Modifier" aria-label={`Modifier ${item.name}`}>
                        <Pencil className="size-4" />
                      </Button>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Retirer"
                    aria-label={`Retirer ${item.name}`}
                    onClick={() => removeOne(item)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {selecting ? (
        <div
          role="group"
          aria-label="Sélection"
          className="sticky bottom-16 z-10 flex flex-wrap items-center justify-between gap-2 rounded-md border bg-card p-2 shadow-sm md:bottom-2"
        >
          <span className="px-2 text-sm text-muted-foreground">
            <span className="tnum">{selectedIds.length}</span> sélectionné(s)
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected(new Set(optimisticItems.map((i) => i.id)))}
            >
              Tout sélectionner
            </Button>
            <Button variant="destructive" size="sm" disabled={selectedIds.length === 0} onClick={removeSelected}>
              <Trash2 className="mr-2 size-4" />
              Retirer ({selectedIds.length})
            </Button>
            <Button variant="ghost" size="sm" onClick={stopSelecting} aria-label="Annuler la sélection">
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <AddItemForm />
      )}
    </div>
  );
}

function QuantityEditor({
  item,
  disabled,
  onSave,
}: {
  item: ShoppingListItem;
  disabled: boolean;
  onSave: (quantity: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const label = [item.quantity, formatUnit(item.quantity, item.unit)].filter(Boolean).join(" ");

  function close() {
    setEditing(false);
    requestAnimationFrame(() => buttonRef.current?.focus());
  }

  function commit() {
    close();
    const quantity = Number(draft.replace(",", "."));
    if (!Number.isFinite(quantity) || quantity <= 0) {
      if (draft.trim() !== "") toast.error("Quantité invalide : un nombre supérieur à 0.");
      return;
    }
    if (quantity !== item.quantity) onSave(quantity);
  }

  if (editing) {
    return (
      <span className="flex items-center gap-1">
        <Input
          autoFocus
          type="text"
          inputMode="decimal"
          aria-label={`Quantité de ${item.name}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              e.stopPropagation();
              close();
            }
          }}
          className="h-7 w-16 text-right tabular-nums"
        />
        <span className="text-sm text-muted-foreground">{formatUnit(item.quantity, item.unit)}</span>
      </span>
    );
  }

  if (!label) return null;
  return (
    <button
      ref={buttonRef}
      type="button"
      disabled={disabled}
      aria-label={`Modifier la quantité de ${item.name} (${label})`}
      onClick={() => {
        setDraft(item.quantity != null ? String(item.quantity) : "");
        setEditing(true);
      }}
      className={cn(
        "rounded px-1 text-sm tabular-nums text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none",
        item.checked && "line-through",
      )}
    >
      {label}
    </button>
  );
}
