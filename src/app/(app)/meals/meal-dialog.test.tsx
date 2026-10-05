import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Meal } from "@/lib/models";
import { MealDialog } from "./meal-dialog";

vi.mock("./actions", () => ({
  getMeal: vi.fn(),
  createMeal: vi.fn(),
  updateMeal: vi.fn(),
  searchIngredients: vi.fn().mockResolvedValue([]),
  listTags: vi.fn().mockResolvedValue([{ name: "hiver", count: 3 }]),
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
    tags: [],
    description: null,
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
    vi.mocked(searchIngredients).mockResolvedValue([
      { id: "i2", name: "Tomate", defaultUnit: "g" },
      { id: "i4", name: "Tomme", defaultUnit: "tranche" },
    ] as never);
    vi.mocked(createIngredient).mockReset();
  });

  afterEach(() => {
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

describe("MealDialog — description", () => {
  beforeEach(() => {
    vi.mocked(getMeal).mockReset();
    vi.mocked(updateMeal).mockReset().mockResolvedValue({ ok: true });
  });

  async function openWith(description: string | null) {
    vi.mocked(getMeal).mockResolvedValue({ ...mealWith("tranche"), description } as Meal);
    render(<MealDialog mode="edit" mealId="m1" />);
    fireEvent.click(screen.getByRole("button"));
    return screen.findByLabelText("Description");
  }

  it("préremplit et envoie la description saisie", async () => {
    const field = await openWith("Saisir le porc.");
    expect(field).toHaveValue("Saisir le porc.");

    fireEvent.change(field, { target: { value: "Saisir le porc.\nDéglacer." } });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() =>
      expect(updateMeal).toHaveBeenCalledWith(
        "m1",
        expect.objectContaining({ description: "Saisir le porc.\nDéglacer." }),
      ),
    );
  });

  it("envoie null pour une description vide ou blanche", async () => {
    const field = await openWith("Astuce");

    fireEvent.change(field, { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() =>
      expect(updateMeal).toHaveBeenCalledWith("m1", expect.objectContaining({ description: null })),
    );
  });
});

describe("MealDialog — tags", () => {
  it("ferme la liste des tags avec Échap sans fermer la modale", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    render(<MealDialog mode="create" />);
    await user.click(screen.getByRole("button", { name: /Nouveau repas/ }));
    const tags = await screen.findByLabelText("Tags");

    await user.type(tags, "hi");
    await screen.findByRole("option", { name: /hiver/ });
    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("option", { name: /hiver/ })).not.toBeInTheDocument());
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Nom")).toBeInTheDocument();
  });

  it("garde les tags quand un second Échap ferme la modale", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    vi.mocked(getMeal).mockResolvedValue({ ...mealWith("tranche"), tags: ["hiver", "rapide"] } as Meal);
    const user = userEvent.setup();
    render(<MealDialog mode="edit" mealId="m1" />);
    await user.click(screen.getByRole("button"));
    const tags = await screen.findByLabelText("Tags");
    await user.click(tags);

    await user.keyboard("{Escape}");
    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await user.click(screen.getByRole("button"));
    await screen.findByLabelText("Tags");
    expect(screen.getByRole("button", { name: "Retirer le tag hiver" })).toBeInTheDocument();
  });
});
