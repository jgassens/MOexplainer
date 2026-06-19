import erf from "@stdlib/math-base-special-erf";

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface AxisAlignedBox3D {
  center: Point3D;
  size: Point3D;
}

export type GlobalPhaseSign = 1 | -1;
export type POrbitalAxis = "x" | "y" | "z";

const PROBABILITY_TOLERANCE = 1e-12;

function assertFinite(value: number, label: string) {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be finite.`);
  }
}

function assertPositive(value: number, label: string) {
  assertFinite(value, label);
  if (value <= 0) {
    throw new Error(`${label} must be positive.`);
  }
}

function validateAlpha(alpha: number) {
  assertPositive(alpha, "alpha");
}

function assertFinitePoint(point: Point3D, label: string) {
  assertFinite(point.x, `${label}.x`);
  assertFinite(point.y, `${label}.y`);
  assertFinite(point.z, `${label}.z`);
}

function validateFiniteBox(box: AxisAlignedBox3D) {
  assertFinitePoint(box.center, "box.center");
  assertPositive(box.size.x, "box.size.x");
  assertPositive(box.size.y, "box.size.y");
  assertPositive(box.size.z, "box.size.z");
}

function validateBounds(lower: number, upper: number, beta: number) {
  assertPositive(beta, "beta");
  if (Number.isNaN(lower) || Number.isNaN(upper)) {
    throw new Error("Gaussian integral bounds must not be NaN.");
  }
  if (lower > upper) {
    throw new Error("Gaussian integral lower bound must not exceed upper bound.");
  }
}

function gaussianBoundaryTerm(u: number, beta: number) {
  if (!Number.isFinite(u)) return 0;
  return u * Math.exp(-beta * u * u);
}

function normalizeProbability(value: number) {
  if (value >= 0 && value <= 1) return value;
  if (value < 0 && value >= -PROBABILITY_TOLERANCE) return 0;
  if (value > 1 && value <= 1 + PROBABILITY_TOLERANCE) return 1;
  throw new Error(`Integrated probability ${value} is outside [0, 1].`);
}

function coordinateForAxis(point: Point3D, axis: POrbitalAxis) {
  return point[axis];
}

export function pyNormalizationConstant(alpha: number): number {
  validateAlpha(alpha);
  return (2 ** (7 / 4) * alpha ** (5 / 4)) / Math.PI ** (3 / 4);
}

export function pOrbitalWavefunction(
  point: Point3D,
  alpha: number,
  axis: POrbitalAxis = "y",
  globalPhase: GlobalPhaseSign = 1,
): number {
  assertFinitePoint(point, "point");
  validateAlpha(alpha);
  const rSquared = point.x * point.x + point.y * point.y + point.z * point.z;
  return (
    globalPhase *
    pyNormalizationConstant(alpha) *
    coordinateForAxis(point, axis) *
    Math.exp(-alpha * rSquared)
  );
}

export function pyWavefunction(
  point: Point3D,
  alpha: number,
  globalPhase: GlobalPhaseSign = 1,
): number {
  return pOrbitalWavefunction(point, alpha, "y", globalPhase);
}

export function pOrbitalDensity(
  point: Point3D,
  alpha: number,
  axis: POrbitalAxis = "y",
): number {
  assertFinitePoint(point, "point");
  validateAlpha(alpha);
  const rSquared = point.x * point.x + point.y * point.y + point.z * point.z;
  const normal = pyNormalizationConstant(alpha);
  const axialCoordinate = coordinateForAxis(point, axis);
  return normal * normal * axialCoordinate * axialCoordinate * Math.exp(-2 * alpha * rSquared);
}

export function pyDensity(point: Point3D, alpha: number): number {
  return pOrbitalDensity(point, alpha, "y");
}

export function gaussianIntegral0(lower: number, upper: number, beta: number): number {
  validateBounds(lower, upper, beta);
  const scale = Math.sqrt(beta);
  return (Math.sqrt(Math.PI) / (2 * scale)) * (erf(scale * upper) - erf(scale * lower));
}

export function gaussianIntegral2(lower: number, upper: number, beta: number): number {
  validateBounds(lower, upper, beta);
  const scale = Math.sqrt(beta);
  const erfContribution =
    (Math.sqrt(Math.PI) / (4 * beta ** (3 / 2))) *
    (erf(scale * upper) - erf(scale * lower));
  const boundaryContribution =
    (gaussianBoundaryTerm(upper, beta) - gaussianBoundaryTerm(lower, beta)) / (2 * beta);
  return erfContribution - boundaryContribution;
}

export function boxBounds(box: AxisAlignedBox3D): {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  z1: number;
  z2: number;
} {
  validateFiniteBox(box);
  return {
    x1: box.center.x - box.size.x / 2,
    x2: box.center.x + box.size.x / 2,
    y1: box.center.y - box.size.y / 2,
    y2: box.center.y + box.size.y / 2,
    z1: box.center.z - box.size.z / 2,
    z2: box.center.z + box.size.z / 2,
  };
}

export function boxVolume(box: AxisAlignedBox3D): number {
  validateFiniteBox(box);
  return box.size.x * box.size.y * box.size.z;
}

export function probabilityInPyBox(box: AxisAlignedBox3D, alpha: number): number {
  return probabilityInPOrbitalBox(box, alpha, "y");
}

export function probabilityInPOrbitalBox(
  box: AxisAlignedBox3D,
  alpha: number,
  axis: POrbitalAxis = "y",
): number {
  validateAlpha(alpha);
  const bounds = boxBounds(box);
  const beta = 2 * alpha;
  const normal = pyNormalizationConstant(alpha);
  const xIntegral =
    axis === "x"
      ? gaussianIntegral2(bounds.x1, bounds.x2, beta)
      : gaussianIntegral0(bounds.x1, bounds.x2, beta);
  const yIntegral =
    axis === "y"
      ? gaussianIntegral2(bounds.y1, bounds.y2, beta)
      : gaussianIntegral0(bounds.y1, bounds.y2, beta);
  const zIntegral =
    axis === "z"
      ? gaussianIntegral2(bounds.z1, bounds.z2, beta)
      : gaussianIntegral0(bounds.z1, bounds.z2, beta);
  const probability =
    normal *
    normal *
    xIntegral *
    yIntegral *
    zIntegral;

  return normalizeProbability(probability);
}

export function pyMaximumAbsoluteAmplitude(alpha: number): number {
  validateAlpha(alpha);
  return pyNormalizationConstant(alpha) * Math.exp(-1 / 2) / Math.sqrt(2 * alpha);
}
