import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ShoppingItemSource, ShoppingListItem } from "@/lib/models";
import { EditItemDialog } from "./edit-item-dialog";

vi.mock("./shopping-list-actions", () => ({ updateItem: vi.fn() }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { updateItem } from "./shopping-list-actions";

function openFor(source: ShoppingItemSource, unit: string | null) {
  const item = {
    id: "it1",
    source,
    ingredientId: source === "DERIVED" ? "i1" : null,
    name: "Avocat",
    unit,
    quantity: 5,
    checked: false,
  } as ShoppingListItem;
  render(<EditItemDialog item={item} trigger={<button>Modifier</button>} />);
  fireEvent.click(screen.getByRole("button", { name: "Modifier" }));
}

describe("EditItemDialog — unité", () => {
  beforeEach(() => {
    vi.mocked(updateItem).mockReset().mockResolvedValue({ ok: true });
  });

  it.each(["DERIVED", "MANUAL"] as const)(
    "propose le jeu fermé pour un article %s",
    async (source) => {
      openFor(source, "pièce");

      const select = await waitFor(() => screen.getByRole("combobox", { name: "Unité" }));
      expect(select).toHaveValue("pièce");
      expect(screen.getByRole("option", { name: "gousse" })).toBeInTheDocument();
    },
  );

  it("garde visible l'unité libre d'un article manuel antérieur", async () => {
    openFor("MANUAL", "sachet");

    const select = await waitFor(() => screen.getByRole("combobox", { name: "Unité" }));
    expect(select).toHaveValue("sachet");
  });

  it("envoie l'unité choisie dans la liste", async () => {
    openFor("DERIVED", "pièce");
    const select = await waitFor(() => screen.getByRole("combobox", { name: "Unité" }));

    fireEvent.change(select, { target: { value: "gousse" } });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() =>
      expect(updateItem).toHaveBeenCalledWith("it1", {
        name: "Avocat",
        quantity: 5,
        unit: "gousse",
      }),
    );
  });

  it("refuse d'enregistrer sans unité", async () => {
    openFor("MANUAL", null);
    await waitFor(() => screen.getByRole("combobox", { name: "Unité" }));

    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(await screen.findByText("Unité requise.")).toBeInTheDocument();
    expect(updateItem).not.toHaveBeenCalled();
  });
});
