import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWakeLock } from "./use-wake-lock";

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", { value: state, configurable: true });
  document.dispatchEvent(new Event("visibilitychange"));
}

function sentinel() {
  const lock = { released: false, release: vi.fn(async () => void (lock.released = true)) };
  return lock;
}

let locks: ReturnType<typeof sentinel>[];
const request = vi.fn(async () => {
  const lock = sentinel();
  locks.push(lock);
  return lock;
});

describe("useWakeLock", () => {
  beforeEach(() => {
    locks = [];
    request.mockClear();
    setVisibility("visible");
    Object.defineProperty(navigator, "wakeLock", { value: { request }, configurable: true });
  });

  afterEach(() => {
    Reflect.deleteProperty(navigator, "wakeLock");
  });

  it("demande le verrou une fois actif et le relâche à la sortie", async () => {
    const { rerender } = renderHook(({ active }) => useWakeLock(active), {
      initialProps: { active: false },
    });
    expect(request).not.toHaveBeenCalled();

    rerender({ active: true });
    await waitFor(() => expect(locks).toHaveLength(1));

    rerender({ active: false });
    expect(locks[0].release).toHaveBeenCalled();
  });

  it("redemande le verrou relâché par le navigateur au retour au premier plan", async () => {
    renderHook(() => useWakeLock(true));
    await waitFor(() => expect(locks).toHaveLength(1));

    locks[0].released = true;
    setVisibility("hidden");
    setVisibility("visible");

    await waitFor(() => expect(locks).toHaveLength(2));
  });

  it("ne cumule pas les verrous tant que le précédent tient", async () => {
    renderHook(() => useWakeLock(true));
    await waitFor(() => expect(locks).toHaveLength(1));

    setVisibility("visible");

    expect(request).toHaveBeenCalledTimes(1);
  });

  it("signale un navigateur sans l'API", () => {
    Reflect.deleteProperty(navigator, "wakeLock");

    const { result } = renderHook(() => useWakeLock(true));

    expect(result.current).toBe(false);
  });
});
