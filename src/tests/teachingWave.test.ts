import { describe, expect, it } from "vitest";
import { relativeDensity, teachingPOrbital } from "../models/teachingWave";

describe("teaching p-orbital slice", () => {
  it("has a node at the nucleus", () => {
    expect(teachingPOrbital(0)).toBe(0);
  });

  it("has opposite signs on opposite sides of the node", () => {
    expect(teachingPOrbital(-1)).toBeCloseTo(-1);
    expect(teachingPOrbital(1)).toBeCloseTo(1);
  });

  it("has the same density after every sign is reversed", () => {
    const x = 0.73;
    const psi = teachingPOrbital(x, 1);
    const flipped = teachingPOrbital(x, -1);
    expect(flipped).toBeCloseTo(-psi);
    expect(relativeDensity(flipped)).toBeCloseTo(relativeDensity(psi));
  });

  it("turns both positive and negative values into nonnegative density", () => {
    expect(relativeDensity(teachingPOrbital(-0.8))).toBeGreaterThanOrEqual(0);
    expect(relativeDensity(teachingPOrbital(0.8))).toBeGreaterThanOrEqual(0);
  });
});
