import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLiveRefresh } from "./use-live-refresh";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

const INTERVAL = 15_000;
const IDLE = 10 * 60_000;

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", { value: state, configurable: true });
  document.dispatchEvent(new Event("visibilitychange"));
}

describe("useLiveRefresh", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setVisibility("visible");
    refresh.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("rafraîchit à intervalle tant que l'onglet est visible", () => {
    renderHook(() => useLiveRefresh(INTERVAL, IDLE));

    vi.advanceTimersByTime(45_000);

    expect(refresh).toHaveBeenCalledTimes(3);
  });

  it("ne rafraîchit plus quand l'onglet est caché", () => {
    renderHook(() => useLiveRefresh(INTERVAL, IDLE));
    setVisibility("hidden");

    vi.advanceTimersByTime(60_000);

    expect(refresh).not.toHaveBeenCalled();
  });

  it("rafraîchit tout de suite au retour au premier plan, puis reprend l'intervalle", () => {
    renderHook(() => useLiveRefresh(INTERVAL, IDLE));
    setVisibility("hidden");

    setVisibility("visible");
    expect(refresh).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(INTERVAL);
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it("s'arrête après une longue période sans interaction, et reprend au premier geste", () => {
    renderHook(() => useLiveRefresh(INTERVAL, IDLE));
    vi.advanceTimersByTime(IDLE + 5 * INTERVAL);
    const whileActive = refresh.mock.calls.length;

    vi.advanceTimersByTime(30 * 60_000);
    expect(refresh).toHaveBeenCalledTimes(whileActive);

    document.dispatchEvent(new Event("pointerdown"));
    expect(refresh).toHaveBeenCalledTimes(whileActive + 1);
    vi.advanceTimersByTime(INTERVAL);
    expect(refresh).toHaveBeenCalledTimes(whileActive + 2);
  });

  it("s'arrête au démontage", () => {
    const { unmount } = renderHook(() => useLiveRefresh(INTERVAL, IDLE));
    unmount();

    vi.advanceTimersByTime(60_000);

    expect(refresh).not.toHaveBeenCalled();
  });
});
