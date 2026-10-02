import { describe, expect, it } from "vitest";
import type { MealSummary, PlanSlot } from "@/lib/models";
import { dayIndexOf, dayLabel, dayName, nextSlotOf, slotsReducer } from "./planner-utils";

function meal(overrides: Partial<MealSummary> = {}): MealSummary {
  return {
    id: "m1",
    name: "Chili",
    userId: null,
    status: "PUBLISHED",
    rating: 4,
    tags: [],
    ingredientCount: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
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
    away: false,
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

  // Un retour à un calcul en heure locale ferait dériver ces deux cas.
  it("reste exact autour des changements d'heure", () => {
    expect(dayIndexOf("2026-03-27", "2026-03-30", 7)).toBe(3); // +1 h
    expect(dayIndexOf("2026-10-23", "2026-10-26", 7)).toBe(3); // −1 h
  });
});

describe("nextSlotOf", () => {
  const slots = [0, 1].flatMap((dayIndex) =>
    (["LUNCH", "DINNER"] as const).map(
      (slot) => ({ id: `${dayIndex}-${slot}`, dayIndex, slot }) as unknown as PlanSlot,
    ),
  );
  const at = (id: string) => slots.find((s) => s.id === id) as PlanSlot;

  it("passe du midi au soir du même jour", () => {
    expect(nextSlotOf(slots, at("0-LUNCH"))?.id).toBe("0-DINNER");
  });

  it("passe du soir au midi du lendemain", () => {
    expect(nextSlotOf(slots, at("0-DINNER"))?.id).toBe("1-LUNCH");
  });

  it("n’a rien après le dernier dîner", () => {
    expect(nextSlotOf(slots, at("1-DINNER"))).toBeUndefined();
  });
});

describe("dayName", () => {
  it("donne le nom complet en minuscules, suffixé au-delà de 7 jours", () => {
    expect(dayName("2026-09-30", 1)).toBe("jeudi");
    expect(dayName("2026-09-30", 8)).toBe("jeudi +1");
  });
});

describe("slotsReducer — dehors", () => {
  it("marque le créneau dehors en retirant le repas", () => {
    const filled = slot({ id: "s1", mealId: "m1", meal: { id: "m1" } as MealSummary });
    const [next] = slotsReducer([filled], { type: "setAway", slotId: "s1" });
    expect(next).toMatchObject({ away: true, mealId: null, meal: null });
  });

  it("sort du mode dehors quand on assigne un repas", () => {
    const away = slot({ id: "s1", away: true });
    const meal = { id: "m1" } as MealSummary;
    const [next] = slotsReducer([away], { type: "assign", slotId: "s1", meal, servings: 2 });
    expect(next).toMatchObject({ away: false, mealId: "m1" });
  });
});

describe("slotsReducer — déplacement", () => {
  const meal = { id: "m1", name: "Carbo" } as MealSummary;
  const a = slot({ id: "a", mealId: "m1", meal, servings: 3 });
  const b = slot({ id: "b", away: true });
  const c = slot({ id: "c" });

  it("échange le contenu de deux créneaux", () => {
    const [na, nb] = slotsReducer([a, b], { type: "move", slotId: "a", targetSlotId: "b" });
    expect(na).toMatchObject({ id: "a", away: true, mealId: null });
    expect(nb).toMatchObject({ id: "b", mealId: "m1", servings: 3, away: false });
  });

  it("déplace vers un créneau vide", () => {
    const [na, nc] = slotsReducer([a, c], { type: "move", slotId: "a", targetSlotId: "c" });
    expect(na.mealId).toBeNull();
    expect(nc.mealId).toBe("m1");
  });

  it("ne change rien vers le même créneau", () => {
    const state = [a, c];
    expect(slotsReducer(state, { type: "move", slotId: "a", targetSlotId: "a" })).toBe(state);
  });
});
