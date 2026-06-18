import { describe, expect, it } from 'vitest';
import { densityValue, hasMidpointNode, pOrbitalValue, sampleTwoPOrbitals } from '../models/orbitals';
import { energySeparation, mixTwoOrbitals } from '../models/mixing';
import { overlapScore } from '../models/overlap';
import { coefficientNorm, occupancyForPiChain, piChainOrbitals } from '../models/piChain';

describe('orbital teaching models', () => {
  it('global phase reversal leaves density unchanged', () => {
    const values = [-1.2, -0.4, 0, 0.8, 1.6];
    values.forEach((value) => {
      expect(densityValue(value)).toBeCloseTo(densityValue(-value), 10);
    });
  });

  it('equal in-phase combinations give bonding symmetry', () => {
    const samples = sampleTwoPOrbitals({ weightA: 1, weightB: 1, distance: 2.4, compactness: 0.8 });
    const left = samples[20].psi;
    const right = samples[samples.length - 21].psi;
    expect(left).toBeCloseTo(right, 2);
  });

  it('equal out-of-phase combinations create a node between equivalent centers', () => {
    const phiA = pOrbitalValue(0, 0.9, -1.2, 0.8);
    const phiB = pOrbitalValue(0, 0.9, 1.2, 0.8);
    expect(phiA - phiB).toBeCloseTo(0, 10);
    expect(hasMidpointNode(1, -1)).toBe(true);
  });

  it('overlap decreases as equivalent orbitals are moved farther apart', () => {
    const near = Math.abs(overlapScore(1.6, 0.8, 1));
    const far = Math.abs(overlapScore(3.6, 0.8, 1));
    expect(near).toBeGreaterThan(far);
  });

  it('energy separation increases as interaction increases', () => {
    expect(energySeparation(0.6)).toBeGreaterThan(energySeparation(0.2));
  });

  it('equal-energy starting orbitals produce equal-magnitude contributions', () => {
    const result = mixTwoOrbitals(0, 0, 0.4);
    expect(result.lower.aShare).toBeCloseTo(result.lower.bShare, 8);
    expect(result.upper.aShare).toBeCloseTo(result.upper.bShare, 8);
  });

  it('increasing the initial energy gap reduces mixing', () => {
    const equal = mixTwoOrbitals(0, 0, 0.3);
    const separated = mixTwoOrbitals(0, -2, 0.3);
    expect(equal.sharedCharacter).toBeGreaterThan(separated.sharedCharacter);
  });

  it('in unequal-energy mixing, the lower MO has more lower-energy-orbital character', () => {
    const result = mixTwoOrbitals(0, -1.2, 0.3);
    expect(result.lower.bShare).toBeGreaterThan(result.lower.aShare);
  });

  it('an N-atom pi chain produces N molecular orbitals', () => {
    expect(piChainOrbitals(5)).toHaveLength(5);
  });

  it('pi-chain orbitals are normalized and ordered consistently by energy', () => {
    const orbitals = piChainOrbitals(4);
    orbitals.forEach((orbital) => expect(coefficientNorm(orbital.coefficients)).toBeCloseTo(1, 6));
    expect(orbitals.map((orbital) => orbital.energy)).toEqual([...orbitals.map((orbital) => orbital.energy)].sort((a, b) => a - b));
  });

  it('higher-energy orbitals in the linear-chain model have increasing node counts', () => {
    const nodes = piChainOrbitals(6).map((orbital) => orbital.nodeCount);
    expect(nodes).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('allyl radical labels the singly occupied HOMO and the next empty LUMO', () => {
    const levels = occupancyForPiChain(3, 3);
    expect(levels.map((level) => level.electrons)).toEqual([2, 1, 0]);
    expect(levels.map((level) => level.role)).toEqual(['occupied', 'HOMO', 'LUMO']);
  });

  it('the middle allyl pi orbital has a node through the central atom', () => {
    const middleOrbital = piChainOrbitals(3)[1];
    expect(middleOrbital.nodeCount).toBe(1);
    expect(middleOrbital.coefficients[1]).toBeCloseTo(0, 10);
  });
});
