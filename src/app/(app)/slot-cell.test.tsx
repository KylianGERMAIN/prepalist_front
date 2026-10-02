import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MealSummary, PlanSlot } from "@/lib/models";
import { SlotCell } from "./slot-cell";

vi.mock("./planner-actions", () => ({
  assignSlot: vi.fn().mockResolvedValue({ ok: true }),
  searchMeals: vi.fn(),
}));

import { assignSlot, searchMeals } from "./planner-actions";

const CARBO = { id: "m1", name: "Pâtes carbo", tags: [] } as unknown as MealSummary;

const EMPTY_SLOT = {
  id: "s1",
  dayIndex: 0,
  slot: "LUNCH",
  mealId: null,
  meal: null,
  servings: 2,
} as unknown as PlanSlot;

async function openDialogAndPick(user: ReturnType<typeof userEvent.setup>) {
  render(<SlotCell slot={EMPTY_SLOT} onClear={vi.fn()} />);
  await user.click(screen.getByRole("button", { name: /ajouter/i }));
  await user.click(await screen.findByRole("combobox"));
  await user.type(screen.getByPlaceholderText("Rechercher un repas…"), "carbo");
  await screen.findByRole("option", { name: "Pâtes carbo" });
  await user.keyboard("{Enter}");
}

describe("SlotCell — validation au clavier", () => {
  beforeEach(() => {
    vi.mocked(assignSlot).mockClear();
    vi.mocked(searchMeals).mockResolvedValue([CARBO]);
  });

  it("enregistre avec Entrée pour choisir puis Entrée pour valider", async () => {
    const user = userEvent.setup();
    await openDialogAndPick(user);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Enregistrer" })).toHaveFocus(),
    );
    await user.keyboard("{Enter}");

    await waitFor(() => expect(assignSlot).toHaveBeenCalledTimes(1));
    expect(assignSlot).toHaveBeenCalledWith("s1", "m1", 2);
  });

  it("soumet avec Entrée depuis le champ Portions", async () => {
    const user = userEvent.setup();
    await openDialogAndPick(user);

    const servings = screen.getByLabelText("Portions");
    await user.tripleClick(servings);
    await user.keyboard("3{Enter}");

    await waitFor(() => expect(assignSlot).toHaveBeenCalledWith("s1", "m1", 3));
  });

  it("rend le focus au déclencheur quand on ferme la liste avec Échap", async () => {
    const user = userEvent.setup();
    render(<SlotCell slot={EMPTY_SLOT} onClear={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /ajouter/i }));
    const trigger = await screen.findByRole("combobox");
    await user.click(trigger);
    await screen.findByPlaceholderText("Rechercher un repas…");

    await user.keyboard("{Escape}");

    await waitFor(() => expect(trigger).toHaveFocus());
    expect(assignSlot).not.toHaveBeenCalled();
  });
});
