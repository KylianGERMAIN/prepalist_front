import { fireEvent, render, screen } from "@testing-library/react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DayStrip, useVisibleDay } from "./day-strip";

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

describe("useVisibleDay", () => {
  it("ne suit que le jour visible à 60 % ou plus", () => {
    let notify!: IntersectionObserverCallback;
    vi.spyOn(globalThis, "IntersectionObserver").mockImplementation(function (cb) {
      notify = cb;
      return { observe() {}, disconnect() {} } as unknown as IntersectionObserver;
    });
    const root = document.createElement("div");
    root.innerHTML = '<div data-day="0"></div><div data-day="1"></div>';
    const [day0, day1] = root.querySelectorAll<HTMLElement>("[data-day]");
    const { result } = renderHook(() => useVisibleDay({ current: root }, 0));

    act(() =>
      notify(
        [
          { target: day1, isIntersecting: true, intersectionRatio: 0.3 },
          { target: day0, isIntersecting: true, intersectionRatio: 0.7 },
        ] as unknown as IntersectionObserverEntry[],
        {} as IntersectionObserver,
      ),
    );
    expect(result.current[0]).toBe(0);

    act(() =>
      notify(
        [{ target: day1, isIntersecting: true, intersectionRatio: 0.9 }] as unknown as IntersectionObserverEntry[],
        {} as IntersectionObserver,
      ),
    );
    expect(result.current[0]).toBe(1);
    vi.restoreAllMocks();
  });
});
