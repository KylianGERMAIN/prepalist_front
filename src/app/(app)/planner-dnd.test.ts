import { describe, expect, it, vi } from "vitest";
import type { KeyboardCoordinateGetter } from "@dnd-kit/core";
import { slotKeyboardCoordinates } from "./planner-dnd";

type Args = Parameters<KeyboardCoordinateGetter>[1];

// Grille 2 × 2 de créneaux de 100 × 50, espacés de 10 px.
const RECTS = new Map([
  ["a", { left: 0, top: 0, width: 100, height: 50 }],
  ["b", { left: 110, top: 0, width: 100, height: 50 }],
  ["c", { left: 0, top: 60, width: 100, height: 50 }],
  ["d", { left: 110, top: 60, width: 100, height: 50 }],
]);

function press(code: string, from: string) {
  const event = { code, preventDefault: vi.fn() } as unknown as KeyboardEvent;
  const args = {
    active: "x",
    currentCoordinates: { x: 0, y: 0 },
    context: {
      collisionRect: RECTS.get(from),
      droppableRects: RECTS,
      droppableContainers: { getEnabled: () => [...RECTS.keys()].map((id) => ({ id })) },
    },
  } as unknown as Args;
  return slotKeyboardCoordinates(event, args);
}

describe("slotKeyboardCoordinates", () => {
  it("saute au créneau voisin vers la droite", () => {
    expect(press("ArrowRight", "a")).toEqual({ x: 110, y: 0 });
  });

  it("saute au créneau voisin vers le bas, pas en diagonale", () => {
    expect(press("ArrowDown", "a")).toEqual({ x: 0, y: 60 });
  });

  it("ne bouge pas en bord de grille", () => {
    expect(press("ArrowRight", "b")).toBeUndefined();
    expect(press("ArrowUp", "a")).toBeUndefined();
  });

  it("laisse passer les autres touches", () => {
    expect(press("Space", "a")).toBeUndefined();
  });
});
