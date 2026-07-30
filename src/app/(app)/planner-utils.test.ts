import { describe, expect, it } from "vitest";
import type { Meal, PlanSlot } from "@/lib/models";
import {
  cookedRecently,
  dayIndexOf,
  dayLabel,
  slotsReducer,
  todayInAppTimeZone,
} from "./planner-utils";

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

function slot(overrides: Partial<PlanSlot> = {}): PlanSlot {
  return {
    id: "s1",
    dayIndex: 0,
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

describe("dayLabel", () => {
  // 2026-06-30 est un mardi.
  it("nomme les jours à partir de startDate, sans date", () => {
    expect(dayLabel("2026-06-30", 0)).toBe("Mar");
    expect(dayLabel("2026-06-30", 1)).toBe("Mer");
    expect(dayLabel("2026-06-30", 6)).toBe("Lun");
  });

  it("désambiguïse au-delà de 7 jours (noms qui se répètent)", () => {
    expect(dayLabel("2026-06-30", 7)).toBe("Mar +1");
    expect(dayLabel("2026-06-30", 8)).toBe("Mer +1");
    expect(dayLabel("2026-06-30", 14)).toBe("Mar +2");
  });
});

describe("dayIndexOf", () => {
  it("situe un jour dans les bornes du plan", () => {
    expect(dayIndexOf("2026-06-30", "2026-06-30", 7)).toBe(0);
    expect(dayIndexOf("2026-06-30", "2026-07-03", 7)).toBe(3);
    expect(dayIndexOf("2026-06-30", "2026-07-06", 7)).toBe(6);
  });

  it("renvoie null hors des bornes", () => {
    expect(dayIndexOf("2026-06-30", "2026-06-29", 7)).toBeNull(); // pas commencé
    expect(dayIndexOf("2026-06-30", "2026-07-07", 7)).toBeNull(); // écoulé
  });

  // Le passage à l'heure d'été fait une journée de 23 h : l'arithmétique doit
  // rester calendaire, sinon l'index dérive d'un jour.
  it("traverse les changements d'heure sans dériver", () => {
    expect(dayIndexOf("2026-03-27", "2026-03-30", 7)).toBe(3); // +1 h
    expect(dayIndexOf("2026-10-23", "2026-10-26", 7)).toBe(3); // −1 h
  });
});

describe("todayInAppTimeZone", () => {
  it("renvoie une date calendaire au format YYYY-MM-DD", () => {
    expect(todayInAppTimeZone()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("suit le fuseau demandé et non celui du process", () => {
    // Deux fuseaux à cheval sur la ligne de date ne peuvent pas rendre le même jour.
    expect(todayInAppTimeZone("Pacific/Kiritimati")).not.toBe(
      todayInAppTimeZone("Pacific/Niue"),
    );
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
