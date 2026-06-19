import { describe, expect, it } from "vitest";
import {
  boxVolume,
  gaussianIntegral0,
  gaussianIntegral2,
  probabilityInPyBox,
  probabilityInPOrbitalBox,
  pOrbitalDensity,
  pOrbitalWavefunction,
  pyDensity,
  pyMaximumAbsoluteAmplitude,
  pyNormalizationConstant,
  pyWavefunction,
  type AxisAlignedBox3D,
} from "../models/pyOrbital3d";

const allSpaceBox: AxisAlignedBox3D = {
  center: { x: 0, y: 0, z: 0 },
  size: { x: Infinity, y: Infinity, z: Infinity },
};

function infiniteProbability(alpha: number) {
  const beta = 2 * alpha;
  const normal = pyNormalizationConstant(alpha);
  return (
    normal *
    normal *
    gaussianIntegral0(-Infinity, Infinity, beta) *
    gaussianIntegral2(-Infinity, Infinity, beta) *
    gaussianIntegral0(-Infinity, Infinity, beta)
  );
}

describe("normalized 3D p-y orbital model", () => {
  it("normalizes to one over all space for multiple alpha values", () => {
    [0.35, 0.8, 1, 1.7].forEach((alpha) => {
      expect(infiniteProbability(alpha)).toBeCloseTo(1, 12);
    });
  });

  it("has opposite signed amplitudes across the node", () => {
    const alpha = 0.8;
    const positive = pyWavefunction({ x: 0, y: 0.9, z: 0 }, alpha);
    const negative = pyWavefunction({ x: 0, y: -0.9, z: 0 }, alpha);

    expect(positive).toBeCloseTo(-negative, 12);
  });

  it("has equal density at mirrored points", () => {
    const alpha = 1.2;
    const first = pyDensity({ x: 0.3, y: 0.7, z: -0.2 }, alpha);
    const mirrored = pyDensity({ x: 0.3, y: -0.7, z: -0.2 }, alpha);

    expect(first).toBeCloseTo(mirrored, 12);
  });

  it("flips wavefunction sign without changing density under a global phase flip", () => {
    const point = { x: -0.2, y: 1.1, z: 0.4 };
    const alpha = 0.7;
    const original = pyWavefunction(point, alpha, 1);
    const flipped = pyWavefunction(point, alpha, -1);

    expect(flipped).toBeCloseTo(-original, 12);
    expect(pyDensity(point, alpha)).toBeCloseTo(original * original, 12);
    expect(pyDensity(point, alpha)).toBeCloseTo(flipped * flipped, 12);
  });

  it("matches the reference finite-box probability for alpha equals one", () => {
    const box: AxisAlignedBox3D = {
      center: { x: 0, y: 1, z: 0 },
      size: { x: 1, y: 1, z: 1 },
    };

    expect(probabilityInPyBox(box, 1)).toBeCloseTo(0.179891996, 10);
  });

  it("gives equal probability for mirrored equal-size boxes", () => {
    const alpha = 1;
    const positiveBox: AxisAlignedBox3D = {
      center: { x: 0, y: 1, z: 0 },
      size: { x: 1, y: 1, z: 1 },
    };
    const negativeBox: AxisAlignedBox3D = {
      center: { x: 0, y: -1, z: 0 },
      size: positiveBox.size,
    };

    expect(probabilityInPyBox(positiveBox, alpha)).toBeCloseTo(
      probabilityInPyBox(negativeBox, alpha),
      12,
    );
  });

  it("has zero center density but nonzero finite probability for a box crossing the node", () => {
    const alpha = 0.8;
    const nodeBox: AxisAlignedBox3D = {
      center: { x: 0, y: 0, z: 0 },
      size: { x: 0.7, y: 0.8, z: 0.7 },
    };

    expect(pyDensity(nodeBox.center, alpha)).toBe(0);
    expect(probabilityInPyBox(nodeBox, alpha)).toBeGreaterThan(0);
  });

  it("reduces node-centered probability as the y thickness gets thinner", () => {
    const alpha = 0.8;
    const wide: AxisAlignedBox3D = {
      center: { x: 0, y: 0, z: 0 },
      size: { x: 0.8, y: 0.7, z: 0.8 },
    };
    const thin: AxisAlignedBox3D = {
      center: wide.center,
      size: { x: 0.8, y: 0.08, z: 0.8 },
    };

    expect(probabilityInPyBox(thin, alpha)).toBeLessThan(probabilityInPyBox(wide, alpha));
  });

  it("keeps nested boxes ordered by probability", () => {
    const alpha = 1.1;
    const small: AxisAlignedBox3D = {
      center: { x: 0.1, y: 0.8, z: 0.1 },
      size: { x: 0.5, y: 0.5, z: 0.5 },
    };
    const large: AxisAlignedBox3D = {
      center: small.center,
      size: { x: 1.2, y: 1.2, z: 1.2 },
    };

    expect(probabilityInPyBox(small, alpha)).toBeLessThanOrEqual(
      probabilityInPyBox(large, alpha),
    );
  });

  it("drives a far fixed-size box probability toward zero", () => {
    const near: AxisAlignedBox3D = {
      center: { x: 0, y: 1, z: 0 },
      size: { x: 0.7, y: 0.7, z: 0.7 },
    };
    const far: AxisAlignedBox3D = {
      center: { x: 4.5, y: 4.5, z: 0 },
      size: near.size,
    };

    expect(probabilityInPyBox(far, 1)).toBeLessThan(probabilityInPyBox(near, 1));
    expect(probabilityInPyBox(far, 1)).toBeLessThan(1e-12);
  });

  it("keeps valid box probabilities within bounds", () => {
    const boxes: AxisAlignedBox3D[] = [
      { center: { x: 0, y: 1, z: 0 }, size: { x: 0.4, y: 0.4, z: 0.4 } },
      { center: { x: 0, y: 0, z: 0 }, size: { x: 4, y: 4, z: 4 } },
      { center: { x: 1, y: -1, z: 1 }, size: { x: 1.8, y: 0.9, z: 1.2 } },
    ];

    boxes.forEach((box) => {
      const probability = probabilityInPyBox(box, 0.9);
      expect(probability).toBeGreaterThanOrEqual(0);
      expect(probability).toBeLessThanOrEqual(1);
    });
  });

  it("updates finite density shape with alpha without changing normalization", () => {
    const point = { x: 0, y: 1, z: 0 };
    const diffuseDensity = pyDensity(point, 0.35);
    const compactDensity = pyDensity(point, 1.6);

    expect(diffuseDensity).not.toBeCloseTo(compactDensity, 4);
    expect(infiniteProbability(0.35)).toBeCloseTo(1, 12);
    expect(infiniteProbability(1.6)).toBeCloseTo(1, 12);
    expect(pyMaximumAbsoluteAmplitude(1.6)).toBeGreaterThan(0);
    expect(boxVolume({ center: point, size: { x: 1, y: 2, z: 3 } })).toBe(6);
  });

  it("supports separate p-x, p-y, and p-z orbitals with axis-specific signs", () => {
    const alpha = 0.8;
    expect(pOrbitalWavefunction({ x: 0.9, y: 0, z: 0 }, alpha, "x")).toBeGreaterThan(0);
    expect(pOrbitalWavefunction({ x: 0, y: 0.9, z: 0 }, alpha, "y")).toBeGreaterThan(0);
    expect(pOrbitalWavefunction({ x: 0, y: 0, z: 0.9 }, alpha, "z")).toBeGreaterThan(0);
    expect(pOrbitalWavefunction({ x: -0.9, y: 0, z: 0 }, alpha, "x")).toBeCloseTo(
      -pOrbitalWavefunction({ x: 0.9, y: 0, z: 0 }, alpha, "x"),
      12,
    );
  });

  it("puts the squared coordinate on the selected axis for box probability", () => {
    const alpha = 1;
    const xBox: AxisAlignedBox3D = {
      center: { x: 1, y: 0, z: 0 },
      size: { x: 1, y: 1, z: 1 },
    };
    const yBox: AxisAlignedBox3D = {
      center: { x: 0, y: 1, z: 0 },
      size: { x: 1, y: 1, z: 1 },
    };
    const zBox: AxisAlignedBox3D = {
      center: { x: 0, y: 0, z: 1 },
      size: { x: 1, y: 1, z: 1 },
    };

    expect(probabilityInPOrbitalBox(xBox, alpha, "x")).toBeCloseTo(
      probabilityInPOrbitalBox(yBox, alpha, "y"),
      12,
    );
    expect(probabilityInPOrbitalBox(zBox, alpha, "z")).toBeCloseTo(
      probabilityInPOrbitalBox(yBox, alpha, "y"),
      12,
    );
    expect(pOrbitalDensity({ x: 0, y: 1, z: 0 }, alpha, "x")).toBe(0);
  });

  it("rejects invalid ordinary inputs instead of silently clamping them", () => {
    expect(() => probabilityInPyBox(allSpaceBox, 1)).toThrow(/box.size.x/);
    expect(() => pyWavefunction({ x: 0, y: 0, z: 0 }, 0)).toThrow(/alpha/);
    expect(() => gaussianIntegral0(1, -1, 1)).toThrow(/lower bound/);
  });
});
