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
  createQuickMeal: vi.fn(),
}));

import { createQuickMeal, searchMeals } from "./planner-actions";

const CARBO = { id: "m1", name: "Pâtes carbo", tags: [] } as unknown as MealSummary;

const EMPTY_SLOT = {
  id: "s1",
  dayIndex: 0,
  slot: "LUNCH",
  mealId: null,
  meal: null,
  servings: 2,
  away: false,
} as unknown as PlanSlot;

const NEXT: NextSlotInfo = { label: "mercredi soir", occupant: null, away: false };

function renderCell(next: NextSlotInfo | null = NEXT, canCreateMeals = false) {
  const onAssign = vi.fn();
  render(
    <SlotCell
      slot={EMPTY_SLOT}
      next={next ?? undefined}
      canCreateMeals={canCreateMeals}
      onAssign={onAssign}
      onAway={vi.fn()}
      onClear={vi.fn()}
    />,
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
    renderCell({ label: "mercredi soir", occupant: { id: "m2", name: "Wraps" }, away: false });
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

describe("SlotCell — création rapide", () => {
  beforeEach(() => {
    vi.mocked(searchMeals).mockResolvedValue([]);
  });

  async function search(user: ReturnType<typeof userEvent.setup>, text: string) {
    await user.click(screen.getByRole("button", { name: /ajouter/i }));
    await user.click(await screen.findByRole("combobox"));
    await user.type(screen.getByPlaceholderText("Rechercher un repas…"), text);
  }

  it("crée le repas par son nom et le sélectionne", async () => {
    const PORC = { id: "m9", name: "Porc à la crème", tags: [], ingredientCount: 0 } as unknown as MealSummary;
    vi.mocked(createQuickMeal).mockResolvedValue({ ok: true, meal: PORC });
    const user = userEvent.setup();
    const onAssign = renderCell(NEXT, true);
    await search(user, "Porc à la crème");

    await user.click(await screen.findByRole("option", { name: "Créer « Porc à la crème »" }));
    await user.click(await screen.findByRole("button", { name: "Enregistrer" }));

    expect(createQuickMeal).toHaveBeenCalledWith("Porc à la crème");
    expect(onAssign).toHaveBeenCalledWith(EMPTY_SLOT, PORC, 2, true);
  });

  it("ne propose pas la création quand le nom existe déjà", async () => {
    vi.mocked(searchMeals).mockResolvedValue([CARBO]);
    const user = userEvent.setup();
    renderCell(NEXT, true);
    await search(user, "pâtes carbo");

    await screen.findByRole("option", { name: "Pâtes carbo" });
    expect(screen.queryByRole("option", { name: /Créer/ })).not.toBeInTheDocument();
  });

  it("ne propose pas la création à un compte non admin", async () => {
    const user = userEvent.setup();
    renderCell(NEXT, false);
    await search(user, "Porc");

    expect(await screen.findByText("Aucun repas.")).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Créer/ })).not.toBeInTheDocument();
  });
});

async function openDialogAndPickAgain(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole("combobox"));
  await user.type(screen.getByPlaceholderText("Rechercher un repas…"), "carbo");
  await screen.findByRole("option", { name: "Pâtes carbo" });
  await user.keyboard("{Enter}");
}

describe("SlotCell — repas à compléter", () => {
  function renderFilled(ingredientCount: number) {
    const slot = { ...EMPTY_SLOT, mealId: "m1", meal: { ...CARBO, ingredientCount } } as PlanSlot;
    render(<SlotCell slot={slot} next={NEXT} onAssign={vi.fn()} onAway={vi.fn()} onClear={vi.fn()} />);
  }

  it("signale un repas sans ingrédient sur la carte", () => {
    renderFilled(0);
    expect(screen.getByRole("img", { name: "Ingrédients à compléter" })).toBeInTheDocument();
  });

  it("ne signale rien pour un repas complet", () => {
    renderFilled(2);
    expect(screen.queryByRole("img", { name: "Ingrédients à compléter" })).not.toBeInTheDocument();
  });
});

describe("SlotCell — dehors", () => {
  it("marque le créneau dehors depuis la modale, et le reporte si l'option est cochée", async () => {
    const onAway = vi.fn();
    const user = userEvent.setup();
    render(<SlotCell slot={EMPTY_SLOT} next={NEXT} onAssign={vi.fn()} onAway={onAway} onClear={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /ajouter/i }));
    await user.click(await screen.findByRole("button", { name: "Je mange dehors" }));

    expect(onAway).toHaveBeenCalledWith(EMPTY_SLOT, true);
  });

  it("affiche un créneau dehors comme décidé", () => {
    render(
      <SlotCell
        slot={{ ...EMPTY_SLOT, away: true }}
        next={NEXT}
        onAssign={vi.fn()}
        onAway={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByText("Dehors")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Vider le créneau" })).toBeInTheDocument();
  });
});
