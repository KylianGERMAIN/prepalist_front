import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Meal } from "@/lib/models";
import { MealDialog } from "./meal-dialog";

vi.mock("./actions", () => ({
  getMeal: vi.fn(),
  createMeal: vi.fn(),
  updateMeal: vi.fn(),
  searchIngredients: vi.fn().mockResolvedValue([]),
  createIngredient: vi.fn(),
}));

import { createIngredient, getMeal, searchIngredients, updateMeal } from "./actions";

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

describe("MealDialog — unité par défaut de l’ingrédient", () => {
  async function pickIngredient(unitBefore?: string) {
    render(<MealDialog mode="create" />);
    fireEvent.click(screen.getByRole("button", { name: /Nouveau repas/ }));
    fireEvent.click(await screen.findByRole("button", { name: /Ligne/ }));
    if (unitBefore) {
      fireEvent.change(screen.getByRole("combobox", { name: "Unité" }), {
        target: { value: unitBefore },
      });
    }
    fireEvent.click(screen.getByText("Ingrédient"));
    fireEvent.change(await screen.findByPlaceholderText(/Rechercher/), {
      target: { value: "Tom" },
    });
  }

  beforeEach(() => {
    // cmdk mesure et fait défiler sa liste, deux API absentes de jsdom.
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    Element.prototype.scrollIntoView = vi.fn();
    vi.mocked(searchIngredients).mockResolvedValue([
      { id: "i2", name: "Tomate", defaultUnit: "g" },
      { id: "i4", name: "Tomme", defaultUnit: "tranche" },
    ] as never);
    vi.mocked(createIngredient).mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete (Element.prototype as Partial<Element>).scrollIntoView;
    vi.mocked(searchIngredients).mockResolvedValue([]);
  });

  it("préremplit l’unité vide avec celle de l’ingrédient", async () => {
    await pickIngredient();
    fireEvent.click(await screen.findByRole("option", { name: /Tomate/ }));

    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: "Unité" })).toHaveValue("g"),
    );
  });

  it("fait suivre l’unité préremplie quand on change d’ingrédient", async () => {
    const unitSelect = () => screen.getByRole("combobox", { name: "Unité" });
    await pickIngredient();
    fireEvent.click(await screen.findByRole("option", { name: /Tomate/ }));
    await waitFor(() => expect(unitSelect()).toHaveValue("g"));

    fireEvent.click(screen.getByText("Tomate"));
    fireEvent.change(await screen.findByPlaceholderText(/Rechercher/), {
      target: { value: "Tom" },
    });
    fireEvent.click(await screen.findByRole("option", { name: /Tomme/ }));

    await waitFor(() => expect(unitSelect()).toHaveValue("tranche"));
  });

  it("n’écrase pas une unité déjà choisie", async () => {
    await pickIngredient("pièce");
    fireEvent.click(await screen.findByRole("option", { name: /Tomate/ }));

    await waitFor(() => expect(screen.getByText("Tomate")).toBeInTheDocument());
    expect(screen.getByRole("combobox", { name: "Unité" })).toHaveValue("pièce");
  });

  it("enregistre l’unité de la ligne sur un ingrédient créé à la volée", async () => {
    vi.mocked(searchIngredients).mockResolvedValue([]);
    vi.mocked(createIngredient).mockResolvedValue({
      ok: true,
      ingredient: { id: "i3", name: "Tom", defaultUnit: "pièce" },
    } as never);
    await pickIngredient("pièce");
    fireEvent.click(await screen.findByRole("option", { name: /Créer/ }));

    await waitFor(() => expect(createIngredient).toHaveBeenCalledWith("Tom", "pièce"));
  });
});
