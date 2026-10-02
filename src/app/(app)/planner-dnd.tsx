"use client";

import type { ReactNode } from "react";
import { useDraggable, useDroppable, type KeyboardCoordinateGetter } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

const ARROWS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);

/**
 * Au clavier, une flèche saute au créneau voisin dans sa direction au lieu
 * d'avancer de 25 px (défaut dnd-kit) : un appui = un créneau.
 */
export const slotKeyboardCoordinates: KeyboardCoordinateGetter = (
  event,
  { context: { collisionRect, droppableRects, droppableContainers } },
) => {
  if (!ARROWS.has(event.code) || !collisionRect) return undefined;
  event.preventDefault();
  const cx = collisionRect.left + collisionRect.width / 2;
  const cy = collisionRect.top + collisionRect.height / 2;
  const horizontal = event.code === "ArrowLeft" || event.code === "ArrowRight";
  const sign = event.code === "ArrowRight" || event.code === "ArrowDown" ? 1 : -1;

  let best: { left: number; top: number; width: number; height: number } | undefined;
  let bestScore = Infinity;
  for (const container of droppableContainers.getEnabled()) {
    const rect = droppableRects.get(container.id);
    if (!rect) continue;
    const dx = rect.left + rect.width / 2 - cx;
    const dy = rect.top + rect.height / 2 - cy;
    const along = (horizontal ? dx : dy) * sign;
    if (along <= 1) continue;
    const score = along + Math.abs(horizontal ? dy : dx) * 2;
    if (score < bestScore) {
      best = rect;
      bestScore = score;
    }
  }
  if (!best) return undefined;
  return {
    x: best.left + (best.width - collisionRect.width) / 2,
    y: best.top + (best.height - collisionRect.height) / 2,
  };
};

/** Tout créneau accepte un dépôt ; seule la poignée lance le glisser, la carte reste un bouton normal. */
export function DndSlot({
  id,
  movable,
  label,
  children,
}: {
  id: string;
  movable: boolean;
  label: string;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({
    id,
    disabled: !movable,
  });
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        setDropRef(node);
      }}
      className={cn(
        "group/dnd relative flex flex-1 rounded-md",
        isDragging && "opacity-40",
        isOver && !isDragging && "ring-2 ring-accent",
      )}
    >
      {children}
      {movable ? (
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Déplacer ${label}`}
          title="Déplacer"
          // touch-none : sans lui le navigateur prend le geste pour un défilement.
          className="absolute right-0.5 bottom-0.5 z-10 touch-none rounded p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover/dnd:opacity-100 [@media(hover:none)]:opacity-70"
        >
          <GripVertical className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
