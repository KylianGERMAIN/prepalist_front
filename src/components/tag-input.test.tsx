import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { TagInput } from "./tag-input";

const SUGGESTIONS = [
  { name: "hiver", count: 3 },
  { name: "rapide", count: 2 },
];

function Harness({ initial = [] as string[] }) {
  const [tags, setTags] = useState(initial);
  return (
    <>
      <TagInput id="tags" value={tags} onChange={setTags} suggestions={SUGGESTIONS} />
      <output>{tags.join("|")}</output>
    </>
  );
}

const value = () => screen.getByRole("status").textContent;

describe("TagInput", () => {
  it("propose le tag existant quelle que soit la casse saisie", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByRole("combobox"), "HIV");

    expect(screen.getAllByRole("option")[0]).toHaveTextContent("hiver");
    await user.keyboard("{Enter}");
    expect(value()).toBe("hiver");
  });

  it("ne propose pas de créer un tag qui existe déjà", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByRole("combobox"), "Hiver");

    expect(screen.queryByRole("option", { name: /Créer/ })).not.toBeInTheDocument();
  });

  it("crée un tag absent, normalisé", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByRole("combobox"), "  Plat  du jour {Enter}");

    expect(value()).toBe("plat du jour");
  });

  it("ajoute avec la virgule et retire le dernier avec Retour arrière", async () => {
    const user = userEvent.setup();
    render(<Harness initial={["hiver"]} />);

    await user.type(screen.getByRole("combobox"), "rapide,");
    expect(value()).toBe("hiver|rapide");

    await user.keyboard("{Backspace}");
    expect(value()).toBe("hiver");
  });

  it("retire une puce par son bouton", async () => {
    const user = userEvent.setup();
    render(<Harness initial={["hiver", "rapide"]} />);

    await user.click(screen.getByRole("button", { name: "Retirer le tag hiver" }));

    expect(value()).toBe("rapide");
  });

  it("n'ajoute rien avec Entrée sur un champ vide", async () => {
    const user = userEvent.setup();
    render(<Harness initial={["hiver"]} />);

    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{Enter}");

    expect(value()).toBe("hiver");
  });
});
