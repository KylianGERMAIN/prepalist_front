import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DayStrip } from "./day-strip";

const DAYS = ["Mer", "Jeu", "Ven"].map((label, index) => ({
  index,
  label,
  filled: index,
  isToday: index === 1,
}));

describe("DayStrip", () => {
  it("change de jour aux flèches, sans dépasser les bords", () => {
    const onSelect = vi.fn();
    render(<DayStrip days={DAYS} active={0} onSelect={onSelect} />);
    const tablist = screen.getByRole("tablist");

    fireEvent.keyDown(tablist, { key: "ArrowRight" });
    fireEvent.keyDown(tablist, { key: "ArrowLeft" });

    expect(onSelect.mock.calls).toEqual([[1], [0]]);
  });

  it("sélectionne le jour tapé et annonce les créneaux remplis", () => {
    const onSelect = vi.fn();
    render(<DayStrip days={DAYS} active={0} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("tab", { name: /Ven/ }));

    expect(onSelect).toHaveBeenCalledWith(2);
    expect(screen.getByRole("tab", { name: /Ven/ })).toHaveTextContent("2 repas sur 2");
    expect(screen.getByRole("tab", { selected: true })).toHaveTextContent("Mer");
  });
});
