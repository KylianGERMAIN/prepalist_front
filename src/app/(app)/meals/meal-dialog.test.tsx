import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Meal } from "@/lib/models";
import { MealDialog } from "./meal-dialog";

vi.mock("./actions", () => ({
  getMeal: vi.fn(),
  createMeal: vi.fn(),
  updateMeal: vi.fn(),
  searchIngredients: vi.fn().mockResolvedValue([]),
  createIngredient: vi.fn(),
}));

import { getMeal, updateMeal } from "./actions";

function mealWith(unit: string): Meal {
  return {
    id: "m1",
    name: "Croque",
    userId: null,
    status: "PUBLISHED",
    rating: null,
    isFavorite: false,
    lastCookedAt: null,
    timesCooked: 0,
    tags: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    ingredients: [
      {
        id: "mi1",
        ingredientId: "i1",
        ingredient: { id: "i1", name: "Jambon", defaultUnit: null },
        quantity: 2,
        unit,
      },
    ],
  } as unknown as Meal;
}

async function openEditDialog(unit: string) {
  vi.mocked(getMeal).mockResolvedValue(mealWith(unit));
  render(<MealDialog mode="edit" mealId="m1" />);
  fireEvent.click(screen.getByRole("button"));
  return waitFor(() => screen.getByRole("combobox", { name: "Unité" }));
}

describe("MealDialog — unité", () => {
  beforeEach(() => {
    vi.mocked(getMeal).mockReset();
    vi.mocked(updateMeal).mockReset();
  });

  it("présélectionne une unité du jeu fermé", async () => {
    const select = await openEditDialog("tranche");

    expect(select).toHaveValue("tranche");
  });

  // Sans option de secours, le select se viderait sans rien dire et l'unité
  // d'origine ne serait plus consultable nulle part.
  it("garde une unité héritée visible et sélectionnée", async () => {
    const select = await openEditDialog("sachet");

    expect(select).toHaveValue("sachet");
    expect(screen.getByRole("option", { name: "sachet" })).toBeInTheDocument();
  });

  it("refuse la soumission d’une unité héritée", async () => {
    await openEditDialog("sachet");

    fireEvent.submit(screen.getByRole("button", { name: /Enregistrer|Modifier/i }));

    await waitFor(() => expect(screen.getByText("Unité hors liste.")).toBeInTheDocument());
    expect(updateMeal).not.toHaveBeenCalled();
  });
});
