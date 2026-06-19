import { useEffect, useMemo } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  MeshBasicMaterial,
  MeshStandardMaterial,
} from "three";
import { MarchingCubes } from "three/addons/objects/MarchingCubes.js";
import {
  pyMaximumAbsoluteAmplitude,
  type GlobalPhaseSign,
  type POrbitalAxis,
  pOrbitalWavefunction,
} from "../../models/pyOrbital3d";

const FIELD_EXTENT = 3.2;
const ISO_THRESHOLD = 0.23;

function modelCoordinate(index: number, resolution: number) {
  return ((index / (resolution - 1)) * 2 - 1) * FIELD_EXTENT;
}

function trimGeneratedGeometry(source: BufferGeometry, count: number) {
  const geometry = new BufferGeometry();
  const position = source.getAttribute("position") as BufferAttribute | undefined;
  const normal = source.getAttribute("normal") as BufferAttribute | undefined;

  if (!position || !normal || count <= 0) return geometry;

  const positions = position.array.slice(0, count * 3) as Float32Array;
  const normals = normal.array.slice(0, count * 3) as Float32Array;
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute("normal", new BufferAttribute(new Float32Array(normals), 3));
  geometry.computeBoundingSphere();
  return geometry;
}

function buildPhaseGeometry(
  alpha: number,
  resolution: number,
  phase: GlobalPhaseSign,
  orbitalAxis: POrbitalAxis,
) {
  const material = new MeshBasicMaterial();
  const marchingCubes = new MarchingCubes(resolution, material, false, false, 120000);
  const maxAmplitude = pyMaximumAbsoluteAmplitude(alpha);

  marchingCubes.isolation = ISO_THRESHOLD;
  marchingCubes.reset();

  for (let zIndex = 0; zIndex < resolution; zIndex += 1) {
    const z = modelCoordinate(zIndex, resolution);
    for (let yIndex = 0; yIndex < resolution; yIndex += 1) {
      const y = modelCoordinate(yIndex, resolution);
      for (let xIndex = 0; xIndex < resolution; xIndex += 1) {
        const x = modelCoordinate(xIndex, resolution);
        const normalizedPsi =
          pOrbitalWavefunction({ x, y, z }, alpha, orbitalAxis, 1) / maxAmplitude;
        marchingCubes.setCell(xIndex, yIndex, zIndex, phase * normalizedPsi);
      }
    }
  }

  marchingCubes.update();
  const geometry = trimGeneratedGeometry(marchingCubes.geometry, marchingCubes.count);
  marchingCubes.geometry.dispose();
  material.dispose();
  return geometry;
}

export function PyOrbitalSurface({
  alpha,
  globalPhase,
  orbitalAxis,
  opacity = 0.86,
  resolution,
}: {
  alpha: number;
  globalPhase: GlobalPhaseSign;
  orbitalAxis: POrbitalAxis;
  opacity?: number;
  resolution: number;
}) {
  const positiveGeometry = useMemo(
    () => buildPhaseGeometry(alpha, resolution, 1, orbitalAxis),
    [alpha, orbitalAxis, resolution],
  );
  const negativeGeometry = useMemo(
    () => buildPhaseGeometry(alpha, resolution, -1, orbitalAxis),
    [alpha, orbitalAxis, resolution],
  );
  const positiveMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#5f91c4",
        roughness: 0.82,
        metalness: 0,
        transparent: true,
        opacity,
        side: DoubleSide,
      }),
    [opacity],
  );
  const negativeMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#df8d5d",
        roughness: 0.82,
        metalness: 0,
        transparent: true,
        opacity,
        side: DoubleSide,
      }),
    [opacity],
  );

  useEffect(
    () => () => {
      positiveGeometry.dispose();
    },
    [positiveGeometry],
  );
  useEffect(
    () => () => {
      negativeGeometry.dispose();
    },
    [negativeGeometry],
  );
  useEffect(
    () => () => {
      positiveMaterial.dispose();
      negativeMaterial.dispose();
    },
    [positiveMaterial, negativeMaterial],
  );

  const positiveLobeMaterial = globalPhase === 1 ? positiveMaterial : negativeMaterial;
  const negativeLobeMaterial = globalPhase === 1 ? negativeMaterial : positiveMaterial;

  return (
    <group scale={[FIELD_EXTENT, FIELD_EXTENT, FIELD_EXTENT]}>
      <mesh geometry={positiveGeometry} material={positiveLobeMaterial} />
      <mesh geometry={negativeGeometry} material={negativeLobeMaterial} />
    </group>
  );
}
