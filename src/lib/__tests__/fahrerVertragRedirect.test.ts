import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { scheduleContractRedirect } from "../../pages/FahrerVertrag";

describe("Weiterleitung nach gespeicherter Vertragsentscheidung", () => {
  const assign = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    assign.mockClear();
    vi.stubGlobal("window", { setTimeout, clearTimeout, location: { assign } });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it.each(["accepted", "rejected"])("leitet bei %s erst nach 10 Sekunden zur vorgegebenen Startseite weiter", (status) => {
    scheduleContractRedirect(status);
    vi.advanceTimersByTime(9_999);
    expect(assign).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(assign).toHaveBeenCalledExactlyOnceWith("https://www.kraftfahrer-mieten.com/");
    vi.advanceTimersByTime(20_000);
    expect(assign).toHaveBeenCalledTimes(1);
  });

  it.each([null, "error", "consent_required", "invalid", "expired", "already_answered", "ok"])("startet bei %s keine Weiterleitung", (status) => {
    scheduleContractRedirect(status);
    vi.advanceTimersByTime(30_000);
    expect(assign).not.toHaveBeenCalled();
  });

  it("entfernt den Timer beim Verlassen der Vertragsseite", () => {
    const cleanup = scheduleContractRedirect("accepted");
    cleanup?.();
    vi.advanceTimersByTime(10_000);
    expect(assign).not.toHaveBeenCalled();
  });
});