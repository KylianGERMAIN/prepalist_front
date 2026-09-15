import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MealSummary } from "@/lib/models";
import { MealsTable } from "./meals-table";

vi.mock("./actions", () => ({
  setMealState: vi.fn(),
  markCooked: vi.fn(),
  deleteMeal: vi.fn(),
}));

import { setMealState } from "./actions";

function meal(overrides: Partial<MealSummary> = {}): MealSummary {
  return {
    id: "m1",
    name: "Chili",
    userId: null,
    status: "PUBLISHED",
    rating: null,
    isFavorite: false,
    lastCookedAt: null,
    timesCooked: 0,
    tags: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("MealsTable", () => {
  beforeEach(() => {
    vi.mocked(setMealState).mockReset();
  });

  it("envoie le favori inversé", async () => {
    vi.mocked(setMealState).mockResolvedValue({ ok: true });
    render(<MealsTable meals={[meal({ isFavorite: true })]} isAdmin={false} />);

    fireEvent.click(screen.getByRole("button", { name: "Retirer des favoris" }));

    await waitFor(() =>
      expect(setMealState).toHaveBeenCalledWith("m1", { isFavorite: false }),
    );
  });

  it("bascule l’étoile avant la réponse du serveur", async () => {
    // La valeur optimiste ne survit pas à la résolution de l'action : sans promesse
    // en attente, React réconcilie sur la prop `meals` et l'étoile revient.
    vi.mocked(setMealState).mockReturnValue(new Promise(() => {}));
    render(<MealsTable meals={[meal()]} isAdmin={false} />);

    fireEvent.click(screen.getByRole("button", { name: "Ajouter aux favoris" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Retirer des favoris" })).toHaveAttribute(
        "aria-pressed",
        "true",
      ),
    );
  });

  it("n’invite pas un compte sans droit de création à créer un repas", () => {
    render(<MealsTable meals={[]} isAdmin={false} />);

    expect(screen.getByText("Aucun repas.")).toBeInTheDocument();
  });
});
