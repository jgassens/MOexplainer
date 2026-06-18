export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function round(value: number, digits = 2): number {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

export function magnitude(values: number[]): number {
  return Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
}

export function normalizeVector(values: number[]): number[] {
  const length = magnitude(values);
  if (length < 1e-12) {
    return values.map(() => 0);
  }
  return values.map((value) => value / length);
}

export function squaredWeight(value: number): number {
  return value * value;
}

export function signLabel(value: number): '+' | '-' {
  return value >= 0 ? '+' : '-';
}

export function signColor(value: number): 'positive' | 'negative' {
  return value >= 0 ? 'positive' : 'negative';
}
