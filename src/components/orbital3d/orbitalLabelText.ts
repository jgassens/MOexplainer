import type { POrbitalAxis } from "../../models/pyOrbital3d";

export type POrbitalIndex = POrbitalAxis | "i";

export function pOrbitalSpokenLabel(axis: POrbitalIndex) {
  return axis === "i" ? "p i" : `p ${axis}`;
}
