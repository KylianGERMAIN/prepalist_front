import { describe, expect, it } from "vitest";
import { AISLES, aisleLabel } from "./aisles";

describe("aisleLabel", () => {
  it("donne un libellé à chaque rayon", () => {
    for (const aisle of AISLES) expect(aisleLabel(aisle)).not.toBe("");
  });

  it("range un rayon inconnu avec « Autre »", () => {
    expect(aisleLabel(null)).toBe("Autre");
  });
});
