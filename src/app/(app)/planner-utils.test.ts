import { describe, expect, it } from "vitest";
import type { Meal, WeekSlot } from "@/lib/models";
import { addDays, cookedRecently, slotsReducer, todayIso } from "./planner-utils";

const DAY = 86_400_000;

function meal(overrides: Partial<Meal> = {}): Meal {
  return {
    id: "m1",
    name: "Chili",
    rating: 4,
    isFavorite: false,
    lastCookedAt: null,
    timesCooked: 0,
    tags: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    ingredients: [],
    ...overrides,
  };
}

function slot(overrides: Partial<WeekSlot> = {}): WeekSlot {
  return {
    id: "s1",
    date: "2026-06-29",
    slot: "LUNCH",
    mealId: null,
    meal: null,
    servings: 2,
    ...overrides,
  };
}

describe("slotsReducer", () => {
  it("vide le slot ciblé (clear)", () => {
    const state = [slot({ id: "s1", meal: meal(), mealId: "m1" })];
    const next = slotsReducer(state, { type: "clear", slotId: "s1" });
    expect(next[0].meal).toBeNull();
    expect(next[0].mealId).toBeNull();
    expect(next[0].servings).toBe(2);
  });

  it("assigne repas + portions sur le slot ciblé (assign)", () => {
    const state = [slot({ id: "s1" })];
    const m = meal({ id: "m9", name: "Curry" });
    const next = slotsReducer(state, {
      type: "assign",
      slotId: "s1",
      meal: m,
      servings: 3,
    });
    expect(next[0].meal).toBe(m);
    expect(next[0].mealId).toBe("m9");
    expect(next[0].servings).toBe(3);
  });

  it("laisse les autres slots inchangés (même référence)", () => {
    const other = slot({ id: "s2" });
    const state = [slot({ id: "s1", meal: meal() }), other];
    const next = slotsReducer(state, { type: "clear", slotId: "s1" });
    expect(next[1]).toBe(other);
  });

  it("ne mute pas l'état d'origine (immutabilité)", () => {
    const original = slot({ id: "s1", meal: meal(), mealId: "m1" });
    const state = [original];
    slotsReducer(state, { type: "clear", slotId: "s1" });
    expect(original.meal).not.toBeNull();
    expect(original.mealId).toBe("m1");
  });
});

describe("addDays", () => {
  it("ajoute une semaine (±7) sans dérive", () => {
    expect(addDays("2026-06-30", 7)).toBe("2026-07-07");
    expect(addDays("2026-06-30", -7)).toBe("2026-06-23");
  });

  it("passe la fin de mois", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("passe la fin d'année", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2027-01-01", -1)).toBe("2026-12-31");
  });

  it("gère une année bissextile (29 février)", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  });

  it("borne isCurrent : la semaine [startDate, startDate+7) couvre 7 jours", () => {
    // Base du repère "semaine courante" dans WeekNav.
    const start = "2026-06-30";
    const end = addDays(start, 7);
    expect(start >= start && start < end).toBe(true); // premier jour inclus
    expect(addDays(start, 6) < end).toBe(true); // dernier jour inclus
    expect(end < end).toBe(false); // jour +7 exclu
  });
});

describe("todayIso", () => {
  it("renvoie le format YYYY-MM-DD", () => {
    expect(todayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("cookedRecently", () => {
  it("false si jamais cuisiné (null)", () => {
    expect(cookedRecently(null)).toBe(false);
  });

  it("true si cuisiné il y a moins de 7 jours", () => {
    expect(cookedRecently(new Date(Date.now() - 3 * DAY).toISOString())).toBe(
      true,
    );
  });

  it("false si cuisiné il y a plus de 7 jours", () => {
    expect(cookedRecently(new Date(Date.now() - 8 * DAY).toISOString())).toBe(
      false,
    );
  });

  it("false pour une date future (horloge/saisie incohérente)", () => {
    expect(cookedRecently(new Date(Date.now() + DAY).toISOString())).toBe(
      false,
    );
  });
});
