import { Edges, PivotControls } from "@react-three/drei";
import { Matrix4, Quaternion, Vector3 } from "three";
import { useMemo } from "react";
import type { AxisAlignedBox3D } from "../../models/pyOrbital3d";
import type { SamplingBoxMode } from "./SamplingBoxControls";

const CENTER_MIN = -2.6;
const CENTER_MAX = 2.6;
const SIZE_MIN = 0.08;
const SIZE_MAX = 4.4;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function boxMatrix(box: AxisAlignedBox3D) {
  return new Matrix4().compose(
    new Vector3(box.center.x, box.center.y, box.center.z),
    new Quaternion(),
    new Vector3(box.size.x, box.size.y, box.size.z),
  );
}

function boxFromMatrix(matrix: Matrix4): AxisAlignedBox3D {
  const center = new Vector3();
  const scale = new Vector3();
  matrix.decompose(center, new Quaternion(), scale);

  return {
    center: {
      x: clamp(center.x, CENTER_MIN, CENTER_MAX),
      y: clamp(center.y, CENTER_MIN, CENTER_MAX),
      z: clamp(center.z, CENTER_MIN, CENTER_MAX),
    },
    size: {
      x: clamp(Math.abs(scale.x), SIZE_MIN, SIZE_MAX),
      y: clamp(Math.abs(scale.y), SIZE_MIN, SIZE_MAX),
      z: clamp(Math.abs(scale.z), SIZE_MIN, SIZE_MAX),
    },
  };
}

export function SamplingBox3D({
  box,
  mode,
  onBoxChange,
  onManipulatingChange,
}: {
  box: AxisAlignedBox3D;
  mode: SamplingBoxMode;
  onBoxChange: (box: AxisAlignedBox3D) => void;
  onManipulatingChange: (isManipulating: boolean) => void;
}) {
  const matrix = useMemo(() => boxMatrix(box), [box]);

  return (
    <>
      <PivotControls
        matrix={matrix}
        autoTransform={false}
        activeAxes={[true, true, true]}
        axisColors={["#8d5f18", "#2f6fae", "#3f765b"]}
        disableAxes={mode === "resize"}
        disableRotations
        disableScaling={mode === "move"}
        disableSliders={mode === "resize"}
        lineWidth={3}
        scale={0.88}
        translationLimits={[
          [CENTER_MIN, CENTER_MAX],
          [CENTER_MIN, CENTER_MAX],
          [CENTER_MIN, CENTER_MAX],
        ]}
        onDragStart={() => onManipulatingChange(true)}
        onDrag={(localMatrix) => onBoxChange(boxFromMatrix(localMatrix))}
        onDragEnd={() => onManipulatingChange(false)}
      >
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#f0bd58" transparent opacity={0.18} depthWrite={false} />
          <Edges color="#6f5018" linewidth={2} />
        </mesh>
      </PivotControls>
      <mesh position={[box.center.x, box.center.y, box.center.z]}>
        <sphereGeometry args={[0.075, 20, 12]} />
        <meshStandardMaterial color="#2a2f2b" />
      </mesh>
    </>
  );
}
