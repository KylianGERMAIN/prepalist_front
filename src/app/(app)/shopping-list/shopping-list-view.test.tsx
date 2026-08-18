import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ShoppingListItem } from "@/lib/models";
import { ShoppingListView } from "./shopping-list-view";

vi.mock("./shopping-list-actions", () => ({
  toggleChecked: vi.fn(),
  deleteItem: vi.fn(),
  addManualItem: vi.fn(),
  updateItem: vi.fn(),
}));

import { toggleChecked } from "./shopping-list-actions";

function item(overrides: Partial<ShoppingListItem> = {}): ShoppingListItem {
  return {
    id: "1",
    source: "DERIVED",
    ingredientId: "i1",
    name: "Beurre",
    unit: "g",
    quantity: 250,
    checked: false,
    ...overrides,
  };
}

describe("ShoppingListView", () => {
  beforeEach(() => {
    vi.mocked(toggleChecked).mockReset();
  });

  it("compte les articles cochés", () => {
    render(
      <ShoppingListView
        items={[item(), item({ id: "2", name: "Crème", checked: true })]}
      />,
    );

    expect(screen.getByText(/achetés/)).toHaveTextContent("1 / 2 achetés");
  });

  it("coche l'article avant la réponse du serveur", async () => {
    // La valeur optimiste ne survit pas à la résolution de l'action : sans promesse
    // en attente, React réconcilie sur la prop `items` et la case se décoche.
    vi.mocked(toggleChecked).mockReturnValue(new Promise(() => {}));
    render(<ShoppingListView items={[item()]} />);
    const checkbox = screen.getByRole("checkbox");

    fireEvent.click(checkbox);

    await waitFor(() => expect(checkbox).toBeChecked());
    expect(screen.getByText(/achetés/)).toHaveTextContent("1 / 1 achetés");
    expect(toggleChecked).toHaveBeenCalledWith("1", true);
  });

  it("marque les articles ajoutés à la main", () => {
    render(<ShoppingListView items={[item({ source: "MANUAL" })]} />);

    expect(screen.getByText("Manuel")).toBeInTheDocument();
  });

  it("invite à remplir une liste vide", () => {
    render(<ShoppingListView items={[]} />);

    expect(screen.getByText(/Liste vide/)).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });
});
