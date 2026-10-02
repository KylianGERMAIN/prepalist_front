import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Meal } from "@/lib/models";
import { MealDetailsDialog } from "./meal-details-dialog";

vi.mock("./actions", () => ({ getMeal: vi.fn() }));

import { getMeal } from "./actions";

const MEAL = {
  id: "m1",
  name: "Porc à la crème",
  tags: ["hiver"],
  description: "Saisir le porc.\n<script>alert(1)</script>",
  ingredients: [
    { id: "mi1", ingredientId: "i1", ingredient: { id: "i1", name: "Crème" }, quantity: 2, unit: "c.à.s" },
  ],
} as unknown as Meal;

describe("MealDetailsDialog", () => {
  it("affiche ingrédients et description, sans interpréter le HTML", async () => {
    vi.mocked(getMeal).mockResolvedValue(MEAL);
    const user = userEvent.setup();
    render(<MealDetailsDialog mealId="m1" trigger={<button type="button">Ouvrir</button>} />);

    await user.click(screen.getByRole("button", { name: "Ouvrir" }));

    expect(await screen.findByRole("heading", { name: "Porc à la crème" })).toBeInTheDocument();
    expect(screen.getByText("Crème")).toBeInTheDocument();
    expect(screen.getByText(/<script>alert\(1\)<\/script>/)).toBeInTheDocument();
    expect(document.querySelector("script")).toBeNull();
  });

  it("signale un repas introuvable", async () => {
    vi.mocked(getMeal).mockResolvedValue(null);
    const user = userEvent.setup();
    render(<MealDetailsDialog mealId="zz" trigger={<button type="button">Ouvrir</button>} />);

    await user.click(screen.getByRole("button", { name: "Ouvrir" }));

    expect(await screen.findByText("Repas introuvable.")).toBeInTheDocument();
  });
});
