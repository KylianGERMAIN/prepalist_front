import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { TagInput } from "./tag-input";

const SUGGESTIONS = [
  { name: "hiver", count: 3 },
  { name: "riz cantonais", count: 2 },
];

function Harness({ initial = [] as string[] }) {
  const [tags, setTags] = useState(initial);
  return (
    <>
      <TagInput id="tags" value={tags} onChange={setTags} suggestions={SUGGESTIONS} />
      <output data-testid="tags">{tags.join("|")}</output>
    </>
  );
}

const value = () => screen.getByTestId("tags").textContent;

describe("TagInput", () => {
  it("choisit avec Entrée le tag existant qui correspond, quelle que soit la casse", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByRole("combobox"), "HIV");
    await screen.findByRole("option", { name: /hiver/ });
    await user.keyboard("{Enter}");

    expect(value()).toBe("hiver");
  });

  it("ne propose pas de créer un tag qui existe déjà", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByRole("combobox"), "Hiver");

    await screen.findByRole("option", { name: /hiver/ });
    expect(screen.queryByRole("option", { name: /Créer/ })).not.toBeInTheDocument();
  });

  it("crée un tag absent, normalisé", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByRole("combobox"), "  Plat  du jour");
    await user.click(await screen.findByRole("option", { name: "Créer « plat du jour »" }));

    expect(value()).toBe("plat du jour");
  });

  it("ajoute le texte tapé avec la virgule, pas la suggestion", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByRole("combobox"), "riz,");

    expect(value()).toBe("riz");
  });

  it("retire une puce par son bouton", async () => {
    const user = userEvent.setup();
    render(<Harness initial={["hiver", "rapide"]} />);

    await user.click(screen.getByRole("button", { name: "Retirer le tag hiver" }));

    await waitFor(() => expect(value()).toBe("rapide"));
  });

  it("crée au clavier un tag absent, via l'option Créer", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByRole("combobox"), "batch");
    await screen.findByRole("option", { name: "Créer « batch »" });
    await user.keyboard("{Enter}");

    expect(value()).toBe("batch");
  });

  it("retire la dernière puce avec Retour arrière sur un champ vide", async () => {
    const user = userEvent.setup();
    render(<Harness initial={["hiver", "rapide"]} />);

    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{Backspace}");

    await waitFor(() => expect(value()).toBe("hiver"));
  });

  it("ajoute chaque tag d'un collage séparé par des virgules", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("combobox"));
    await user.paste("rapide, batch");

    expect(value()).toBe("rapide");
    expect(screen.getByRole("combobox")).toHaveValue(" batch");
  });
});
