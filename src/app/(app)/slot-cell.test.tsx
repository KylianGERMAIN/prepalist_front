import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MealSummary, PlanSlot } from "@/lib/models";
import { SlotCell, type NextSlotInfo } from "./slot-cell";

vi.mock("./meals/actions", () => ({ getMeal: vi.fn() }));

import { getMeal } from "./meals/actions";

vi.mock("./planner-actions", () => ({
  assignSlot: vi.fn(),
  searchMeals: vi.fn(),
}));

import { searchMeals } from "./planner-actions";

const CARBO = { id: "m1", name: "Pâtes carbo", tags: [] } as unknown as MealSummary;

const EMPTY_SLOT = {
  id: "s1",
  dayIndex: 0,
  slot: "LUNCH",
  mealId: null,
  meal: null,
  servings: 2,
} as unknown as PlanSlot;

const NEXT: NextSlotInfo = { label: "mercredi soir", occupant: null };

function renderCell(next: NextSlotInfo | null = NEXT) {
  const onAssign = vi.fn();
  render(
    <SlotCell slot={EMPTY_SLOT} next={next ?? undefined} onAssign={onAssign} onClear={vi.fn()} />,
  );
  return onAssign;
}

async function openDialogAndPick(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /ajouter/i }));
  await user.click(await screen.findByRole("combobox"));
  await user.type(screen.getByPlaceholderText("Rechercher un repas…"), "carbo");
  await screen.findByRole("option", { name: "Pâtes carbo" });
  await user.keyboard("{Enter}");
}

describe("SlotCell", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(searchMeals).mockResolvedValue([CARBO]);
  });

  it("enregistre avec Entrée pour choisir puis Entrée pour valider", async () => {
    const user = userEvent.setup();
    const onAssign = renderCell();
    await openDialogAndPick(user);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Enregistrer" })).toHaveFocus(),
    );
    await user.keyboard("{Enter}");

    expect(onAssign).toHaveBeenCalledTimes(1);
    expect(onAssign).toHaveBeenCalledWith(EMPTY_SLOT, CARBO, 2, true);
  });

  it("soumet avec Entrée depuis le champ Portions", async () => {
    const user = userEvent.setup();
    const onAssign = renderCell();
    await openDialogAndPick(user);

    await user.tripleClick(screen.getByLabelText("Portions"));
    await user.keyboard("3{Enter}");

    expect(onAssign).toHaveBeenCalledWith(EMPTY_SLOT, CARBO, 3, true);
  });

  it("rend le focus au déclencheur quand on ferme la liste avec Échap", async () => {
    const user = userEvent.setup();
    const onAssign = renderCell();
    await user.click(screen.getByRole("button", { name: /ajouter/i }));
    const trigger = await screen.findByRole("combobox");
    await user.click(trigger);
    await screen.findByPlaceholderText("Rechercher un repas…");

    await user.keyboard("{Escape}");

    await waitFor(() => expect(trigger).toHaveFocus());
    expect(onAssign).not.toHaveBeenCalled();
  });

  it("annonce le créneau suivant et le repas qu’il remplacerait", async () => {
    const user = userEvent.setup();
    renderCell({ label: "mercredi soir", occupant: { id: "m2", name: "Wraps" } });
    await user.click(screen.getByRole("button", { name: /ajouter/i }));

    const option = await screen.findByRole("checkbox", { name: /Aussi mercredi soir/ });
    expect(option).toBeChecked();
    expect(option).toHaveAccessibleName(/remplace Wraps/);
  });

  it("mémorise le choix d’une ouverture à l’autre", async () => {
    const user = userEvent.setup();
    const onAssign = renderCell();
    await user.click(screen.getByRole("button", { name: /ajouter/i }));
    await user.click(await screen.findByRole("checkbox", { name: /Aussi mercredi/ }));
    await user.keyboard("{Escape}");

    await openDialogAndPick(user);
    expect(screen.getByRole("checkbox", { name: /Aussi mercredi/ })).not.toBeChecked();
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(onAssign).toHaveBeenCalledWith(EMPTY_SLOT, CARBO, 2, false);
  });

  it("désactive l’option sur le dernier créneau du plan", async () => {
    const user = userEvent.setup();
    const onAssign = renderCell(null);
    await openDialogAndPick(user);

    expect(screen.getByRole("checkbox", { name: /Dernier créneau/ })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    expect(onAssign).toHaveBeenCalledWith(EMPTY_SLOT, CARBO, 2, false);
  });

  it("ouvre la fiche du repas choisi par-dessus la modale", async () => {
    vi.mocked(getMeal).mockResolvedValue({
      ...CARBO,
      ingredients: [],
      description: "Ne pas cuire la crème.",
    } as never);
    const user = userEvent.setup();
    renderCell();
    await user.click(screen.getByRole("button", { name: /ajouter/i }));
    expect(screen.queryByRole("button", { name: "Voir la fiche" })).not.toBeInTheDocument();

    await openDialogAndPickAgain(user);
    await user.click(screen.getByRole("button", { name: "Voir la fiche" }));

    expect(await screen.findByText("Ne pas cuire la crème.")).toBeInTheDocument();
    expect(getMeal).toHaveBeenCalledWith("m1");

    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByText("Ne pas cuire la crème.")).not.toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: "Enregistrer" })).toBeInTheDocument();
  });
});

async function openDialogAndPickAgain(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole("combobox"));
  await user.type(screen.getByPlaceholderText("Rechercher un repas…"), "carbo");
  await screen.findByRole("option", { name: "Pâtes carbo" });
  await user.keyboard("{Enter}");
}
