import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MealSummary, Plan } from "@/lib/models";
import { toast } from "sonner";
import { PlanGrid } from "./plan-grid";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("./meals/actions", () => ({ getMeal: vi.fn() }));

vi.mock("./planner-actions", () => ({
  assignSlot: vi.fn(),
  searchMeals: vi.fn(),
  generatePlan: vi.fn(),
  clearPlan: vi.fn(),
}));

import { assignSlot, searchMeals } from "./planner-actions";

const CARBO = { id: "m1", name: "Pâtes carbo", tags: [] } as unknown as MealSummary;

function planOfDays(dayCount: number): Plan {
  const slots = Array.from({ length: dayCount }, (_, dayIndex) =>
    (["LUNCH", "DINNER"] as const).map((slot) => ({
      id: `${dayIndex}-${slot}`,
      dayIndex,
      slot,
      mealId: null,
      meal: null,
      servings: 1,
    })),
  ).flat();
  return { id: "p1", startDate: "2026-09-30", dayCount, slots } as unknown as Plan;
}

describe("PlanGrid — aussi pour le créneau suivant", () => {
  // React 19 regroupe les transitions asynchrones en cours : une action jamais
  // résolue retiendrait le retour optimiste des tests suivants.
  let settle: () => void;

  beforeEach(() => {
    localStorage.clear();
    vi.mocked(searchMeals).mockResolvedValue([CARBO]);
    vi.mocked(assignSlot).mockReturnValue(
      new Promise((resolve) => {
        settle = () => resolve({ ok: true });
      }),
    );
  });

  afterEach(() => settle());

  it("affiche le repas sur les deux cartes avant la réponse du serveur", async () => {
    const user = userEvent.setup();
    render(<PlanGrid plan={planOfDays(2)} todayIndex={null} />);

    const [firstLunch] = screen.getAllByRole("button", { name: /ajouter/i });
    await user.click(firstLunch);
    await user.click(await screen.findByRole("combobox"));
    await user.type(screen.getByPlaceholderText("Rechercher un repas…"), "carbo");
    await user.click(await screen.findByRole("option", { name: "Pâtes carbo" }));
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(assignSlot).toHaveBeenCalledWith("0-LUNCH", "m1", 1, true);
    const wednesday = screen.getByText("Mer").parentElement as HTMLElement;
    expect(within(wednesday).getAllByText("Pâtes carbo")).toHaveLength(2);
  });

  it("revient à l'état serveur et prévient si l'enregistrement échoue", async () => {
    vi.mocked(assignSlot).mockResolvedValue({ ok: false, error: "Créneau introuvable" });
    const user = userEvent.setup();
    render(<PlanGrid plan={planOfDays(2)} todayIndex={null} />);

    const [firstLunch] = screen.getAllByRole("button", { name: /ajouter/i });
    await user.click(firstLunch);
    await user.click(await screen.findByRole("combobox"));
    await user.type(screen.getByPlaceholderText("Rechercher un repas…"), "carbo");
    await user.click(await screen.findByRole("option", { name: "Pâtes carbo" }));
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Créneau introuvable"));
    await waitFor(() => expect(screen.queryAllByText("Pâtes carbo")).toHaveLength(0));
  });
});
