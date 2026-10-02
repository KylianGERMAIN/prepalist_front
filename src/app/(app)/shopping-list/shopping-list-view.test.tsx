import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ShoppingListItem } from "@/lib/models";
import { ShoppingListView } from "./shopping-list-view";

vi.mock("./shopping-list-actions", () => ({
  toggleChecked: vi.fn(),
  deleteItem: vi.fn(),
  deleteItems: vi.fn(),
  clearList: vi.fn(),
  addManualItem: vi.fn(),
  updateItem: vi.fn(),
}));

import { clearList, deleteItems, toggleChecked, updateItem } from "./shopping-list-actions";

const pending = () => new Promise<never>(() => {});

const progress = () =>
  screen.getByText((_, el) => el?.tagName === "P" && /achetés$/.test(el.textContent ?? ""));

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
    vi.clearAllMocks();
  });

  it("compte les articles cochés", () => {
    render(
      <ShoppingListView
        items={[item(), item({ id: "2", name: "Crème", checked: true })]}
      />,
    );

    expect(progress()).toHaveTextContent("1 / 2 achetés");
  });

  it("coche l'article avant la réponse du serveur", async () => {
    // La valeur optimiste ne survit pas à la résolution de l'action : sans promesse
    // en attente, React réconcilie sur la prop `items` et la case se décoche.
    vi.mocked(toggleChecked).mockReturnValue(new Promise(() => {}));
    render(<ShoppingListView items={[item()]} />);
    const checkbox = screen.getByRole("checkbox");

    fireEvent.click(checkbox);

    await waitFor(() => expect(checkbox).toBeChecked());
    expect(progress()).toHaveTextContent("1 / 1 achetés");
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

  it("retire une sélection avant la réponse du serveur", async () => {
    vi.mocked(deleteItems).mockReturnValue(pending());
    const user = userEvent.setup();
    render(
      <ShoppingListView
        items={[
          item({ id: "1", name: "Beurre" }),
          item({ id: "2", name: "Crème" }),
          item({ id: "3", name: "Œufs" }),
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Sélectionner" }));
    await user.click(screen.getByRole("checkbox", { name: "Sélectionner Beurre" }));
    await user.click(screen.getByRole("checkbox", { name: "Sélectionner Œufs" }));
    await user.click(screen.getByRole("button", { name: "Retirer (2)" }));

    expect(deleteItems).toHaveBeenCalledWith(["1", "3"]);
    expect(screen.queryByText("Beurre")).not.toBeInTheDocument();
    expect(screen.queryByText("Œufs")).not.toBeInTheDocument();
    expect(screen.getByText("Crème")).toBeInTheDocument();
  });

  it("quitte la sélection avec Échap sans rien retirer", async () => {
    const user = userEvent.setup();
    render(<ShoppingListView items={[item()]} />);

    await user.click(screen.getByRole("button", { name: "Sélectionner" }));
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("group", { name: "Sélection" })).not.toBeInTheDocument();
    expect(deleteItems).not.toHaveBeenCalled();
  });

  it("retire les achetés en un geste", async () => {
    vi.mocked(clearList).mockReturnValue(pending());
    const user = userEvent.setup();
    render(
      <ShoppingListView items={[item({ id: "1", checked: true }), item({ id: "2", name: "Crème" })]} />,
    );

    await user.click(screen.getByRole("button", { name: "Retirer les achetés" }));

    expect(clearList).toHaveBeenCalledWith("checked");
    expect(screen.queryByText("Beurre")).not.toBeInTheDocument();
    expect(screen.getByText("Crème")).toBeInTheDocument();
  });

  it("modifie la quantité en place avec Entrée", async () => {
    vi.mocked(updateItem).mockReturnValue(pending());
    const user = userEvent.setup();
    render(<ShoppingListView items={[item()]} />);

    await user.click(screen.getByRole("button", { name: /Modifier la quantité de Beurre/ }));
    const input = screen.getByRole("textbox", { name: "Quantité de Beurre" });
    await user.clear(input);
    await user.type(input, "0,5{Enter}");

    expect(updateItem).toHaveBeenCalledTimes(1);
    expect(updateItem).toHaveBeenCalledWith("1", { quantity: 0.5 });
    expect(screen.getByRole("button", { name: /Modifier la quantité de Beurre \(0.5 g\)/ })).toBeInTheDocument();
  });

  it("annule l'édition de quantité avec Échap", async () => {
    const user = userEvent.setup();
    render(<ShoppingListView items={[item()]} />);

    await user.click(screen.getByRole("button", { name: /Modifier la quantité/ }));
    await user.type(screen.getByRole("textbox", { name: "Quantité de Beurre" }), "9{Escape}");

    expect(updateItem).not.toHaveBeenCalled();
  });

  it("en mode magasin, coche d'un tap sur la ligne et masque la navigation", async () => {
    vi.mocked(toggleChecked).mockReturnValue(pending());
    const user = userEvent.setup();
    render(<ShoppingListView items={[item(), item({ id: "2", name: "Crème", checked: true })]} />);

    await user.click(screen.getByRole("button", { name: /Mode magasin/ }));

    expect(document.body).toHaveAttribute("data-store-mode");
    expect(screen.queryByRole("button", { name: /Retirer/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Dans le panier \(/)).toHaveTextContent("Dans le panier (1)");
    await user.click(screen.getByRole("button", { name: /Beurre/ }));
    expect(toggleChecked).toHaveBeenCalledWith("1", true);

    await user.click(screen.getByRole("button", { name: "Terminer" }));
    expect(document.body).not.toHaveAttribute("data-store-mode");
    expect(screen.getByRole("button", { name: /Mode magasin/ })).toBeInTheDocument();
  });
});
