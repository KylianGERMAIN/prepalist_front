import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLiveRefresh } from "./use-live-refresh";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", { value: state, configurable: true });
  document.dispatchEvent(new Event("visibilitychange"));
}

describe("useLiveRefresh", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    refresh.mockClear();
    setVisibility("visible");
    refresh.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("rafraîchit à intervalle tant que l'onglet est visible", () => {
    renderHook(() => useLiveRefresh(15_000));

    vi.advanceTimersByTime(45_000);

    expect(refresh).toHaveBeenCalledTimes(3);
  });

  it("ne rafraîchit plus quand l'onglet est caché", () => {
    renderHook(() => useLiveRefresh(15_000));
    setVisibility("hidden");

    vi.advanceTimersByTime(60_000);

    expect(refresh).not.toHaveBeenCalled();
  });

  it("rafraîchit tout de suite au retour au premier plan", () => {
    renderHook(() => useLiveRefresh(15_000));
    setVisibility("hidden");

    setVisibility("visible");

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("s'arrête au démontage", () => {
    const { unmount } = renderHook(() => useLiveRefresh(15_000));
    unmount();

    vi.advanceTimersByTime(60_000);

    expect(refresh).not.toHaveBeenCalled();
  });
});
