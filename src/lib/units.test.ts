import { describe, expect, it } from "vitest";
import { formatUnit } from "./units";

describe("formatUnit", () => {
  it("laisse le singulier sous 2", () => {
    expect(formatUnit(0.25, "pièce")).toBe("pièce");
    expect(formatUnit(1, "tranche")).toBe("tranche");
    expect(formatUnit(1.5, "tranche")).toBe("tranche");
    expect(formatUnit(1.99, "tranche")).toBe("tranche");
  });

  it("accorde à partir de 2", () => {
    expect(formatUnit(2, "tranche")).toBe("tranches");
    expect(formatUnit(3, "gousse")).toBe("gousses");
  });

  it("met un x à rouleau, pas un s", () => {
    expect(formatUnit(2, "rouleau")).toBe("rouleaux");
  });

  it("laisse les symboles invariables", () => {
    expect(formatUnit(150, "g")).toBe("g");
    expect(formatUnit(200, "ml")).toBe("ml");
    expect(formatUnit(2, "c.à.s")).toBe("c.à.s");
  });

  it("rend une unité inconnue telle quelle", () => {
    expect(formatUnit(3, "sachet")).toBe("sachet");
  });

  it("rend une chaîne vide quand il n'y a pas d'unité", () => {
    expect(formatUnit(2, null)).toBe("");
  });
});
