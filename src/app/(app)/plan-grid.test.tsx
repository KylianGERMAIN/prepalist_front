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
  setSlotAway: vi.fn(),
  moveSlot: vi.fn(),
  searchMeals: vi.fn(),
  generatePlan: vi.fn(),
  clearPlan: vi.fn(),
}));

import { assignSlot, moveSlot, searchMeals, setSlotAway } from "./planner-actions";

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
      away: false,
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
    const pending = new Promise<{ ok: true }>((resolve) => {
      settle = () => resolve({ ok: true });
    });
    vi.mocked(assignSlot).mockReturnValue(pending);
    vi.mocked(setSlotAway).mockReturnValue(pending);
    vi.mocked(moveSlot).mockReturnValue(pending);
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

  it("affiche « Dehors » sur les deux cartes avant la réponse du serveur", async () => {
    const user = userEvent.setup();
    render(<PlanGrid plan={planOfDays(2)} todayIndex={null} />);

    const [firstLunch] = screen.getAllByRole("button", { name: /ajouter/i });
    await user.click(firstLunch);
    await user.click(await screen.findByRole("button", { name: "Je mange dehors" }));

    expect(setSlotAway).toHaveBeenCalledWith("0-LUNCH", true);
    const wednesday = screen.getByText("Mer").parentElement as HTMLElement;
    expect(within(wednesday).getAllByText("Dehors")).toHaveLength(2);
  });

  function planWithCarbo(): Plan {
    const plan = planOfDays(2);
    const lunch = plan.slots.find((x) => x.id === "0-LUNCH");
    if (lunch) Object.assign(lunch, { mealId: CARBO.id, meal: CARBO, servings: 2 });
    return plan;
  }

  it("ouvre toujours la modale d'une carte remplie sur un clic court", async () => {
    const user = userEvent.setup();
    render(<PlanGrid plan={planWithCarbo()} todayIndex={null} />);

    await user.click(screen.getByText("Pâtes carbo"));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("déplace un repas depuis la modale, avant la réponse du serveur", async () => {
    const user = userEvent.setup();
    render(<PlanGrid plan={planWithCarbo()} todayIndex={null} />);

    await user.click(screen.getByText("Pâtes carbo"));
    await user.selectOptions(await screen.findByLabelText("Déplacer vers"), "jeudi soir (vide)");
    expect(moveSlot).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Déplacer" }));

    expect(moveSlot).toHaveBeenCalledWith("0-LUNCH", "1-DINNER");
    const thursday = screen.getByText("Jeu").parentElement as HTMLElement;
    expect(within(thursday).getByText("Pâtes carbo")).toBeInTheDocument();
    const wednesday = screen.getByText("Mer").parentElement as HTMLElement;
    expect(within(wednesday).queryByText("Pâtes carbo")).not.toBeInTheDocument();
  });

  it("ouvre la modale d'une carte remplie au clavier, la poignée portant seule le glisser", async () => {
    const user = userEvent.setup();
    render(<PlanGrid plan={planWithCarbo()} todayIndex={null} />);

    expect(screen.getByRole("button", { name: "Déplacer mercredi midi (Pâtes carbo)" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Déplacer jeudi/ })).not.toBeInTheDocument();
    screen.getByText("Pâtes carbo").closest("button")?.focus();
    await user.keyboard("{Enter}");

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });
});
