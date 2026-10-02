import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ShoppingListItem } from "@/lib/models";
import { ShareButton } from "./share-button";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { toast } from "sonner";

const ITEMS = [
  { id: "1", source: "DERIVED", ingredientId: "i1", name: "Crème", unit: "c.à.s", quantity: 2, checked: false },
] as ShoppingListItem[];

describe("ShareButton", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    Reflect.deleteProperty(navigator, "share");
  });

  it("ouvre la feuille de partage native quand elle existe", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { value: share, configurable: true });
    const user = userEvent.setup();
    render(<ShareButton items={ITEMS} />);

    await user.click(screen.getByRole("button", { name: "Partager" }));

    expect(share).toHaveBeenCalledWith({
      title: "Liste de courses",
      text: expect.stringContaining("- Crème — 2 c.à.s"),
    });
  });

  it("ne signale pas d'erreur quand on ferme la feuille", async () => {
    const abort = Object.assign(new Error("closed"), { name: "AbortError" });
    Object.defineProperty(navigator, "share", { value: vi.fn().mockRejectedValue(abort), configurable: true });
    const user = userEvent.setup();
    render(<ShareButton items={ITEMS} />);

    await user.click(screen.getByRole("button", { name: "Partager" }));

    expect(toast.error).not.toHaveBeenCalled();
  });

  it("copie dans le presse-papiers sans partage natif", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    render(<ShareButton items={ITEMS} />);

    await user.click(screen.getByRole("button", { name: "Partager" }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Liste copiée"));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("Courses — 1 article"));
  });
});
