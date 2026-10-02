import { describe, expect, it } from "vitest";
import { aisleLabel } from "./aisles";

describe("aisleLabel", () => {
  it("range un rayon inconnu avec « Autre »", () => {
    expect(aisleLabel(null)).toBe("Autre");
  });
});
