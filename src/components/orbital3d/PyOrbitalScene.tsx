import { Canvas, useThree } from "@react-three/fiber";
import {
  GizmoHelper,
  GizmoViewport,
  Html,
  Line,
  OrbitControls,
} from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type {
  AxisAlignedBox3D,
  GlobalPhaseSign,
  POrbitalAxis,
} from "../../models/pyOrbital3d";
import { Orbital3DFallback } from "./Orbital3DFallback";
import { PyOrbitalSurface } from "./PyOrbitalSurface";
import { SamplingBox3D } from "./SamplingBox3D";
import type { SamplingBoxMode } from "./SamplingBoxControls";

interface PyOrbitalSceneProps {
  alpha: number;
  box: AxisAlignedBox3D;
  globalPhase: GlobalPhaseSign;
  mode: SamplingBoxMode;
  orbitalAxis: POrbitalAxis;
  onBoxChange: (box: AxisAlignedBox3D) => void;
}

const nodalPlaneConfig: Record<
  POrbitalAxis,
  {
    label: string;
    labelPosition: [number, number, number];
    rotation: [number, number, number];
  }
> = {
  x: {
    label: "x = 0 nodal plane",
    labelPosition: [0.04, 1.9, 1.9],
    rotation: [0, Math.PI / 2, 0],
  },
  y: {
    label: "y = 0 nodal plane",
    labelPosition: [1.9, 0.03, 1.9],
    rotation: [Math.PI / 2, 0, 0],
  },
  z: {
    label: "z = 0 nodal plane",
    labelPosition: [1.9, 1.9, 0.04],
    rotation: [0, 0, 0],
  },
};

function phaseLabelPosition(axis: POrbitalAxis, sign: 1 | -1): [number, number, number] {
  const value = sign * 1.55;
  return [
    axis === "x" ? value : 0,
    axis === "y" ? value : 0,
    axis === "z" ? value : 0,
  ];
}

function AxisLabel({ children, position }: { children: string; position: [number, number, number] }) {
  return (
    <Html position={position} center className="orbital3d-label">
      {children}
    </Html>
  );
}

function PhaseLabel({
  children,
  position,
}: {
  children: string;
  position: [number, number, number];
}) {
  return (
    <Html position={position} center className="orbital3d-phase-label">
      {children}
    </Html>
  );
}

function CameraResetter({
  controlsRef,
  resetKey,
}: {
  controlsRef: MutableRefObject<OrbitControlsImpl | null>;
  resetKey: number;
}) {
  const { camera, invalidate } = useThree();

  useEffect(() => {
    camera.position.set(4.2, 3.0, 5.2);
    controlsRef.current?.target.set(0, 0, 0);
    controlsRef.current?.update();
    invalidate();
  }, [camera, controlsRef, invalidate, resetKey]);

  return null;
}

function SceneContent({
  alpha,
  box,
  globalPhase,
  mode,
  orbitalAxis,
  onBoxChange,
  resetKey,
}: PyOrbitalSceneProps & { resetKey: number }) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [orbitEnabled, setOrbitEnabled] = useState(true);
  const positiveSign = globalPhase === 1 ? "+" : "−";
  const negativeSign = globalPhase === 1 ? "−" : "+";
  const nodePlane = nodalPlaneConfig[orbitalAxis];
  const resolution = useMemo(() => {
    if (typeof window !== "undefined" && window.innerWidth < 760) return 24;
    return 32;
  }, []);

  return (
    <>
      <CameraResetter controlsRef={controlsRef} resetKey={resetKey} />
      <ambientLight intensity={1.15} />
      <directionalLight position={[3.5, 5, 4]} intensity={1.6} />
      <directionalLight position={[-4, -2, -3]} intensity={0.45} />

      <Line points={[[-3.1, 0, 0], [3.1, 0, 0]]} color="#5a5149" lineWidth={1.4} />
      <Line points={[[0, -3.1, 0], [0, 3.1, 0]]} color="#5a5149" lineWidth={1.4} />
      <Line points={[[0, 0, -3.1], [0, 0, 3.1]]} color="#5a5149" lineWidth={1.4} />
      <AxisLabel position={[3.25, 0, 0]}>x</AxisLabel>
      <AxisLabel position={[0, 3.25, 0]}>y</AxisLabel>
      <AxisLabel position={[0, 0, 3.25]}>z</AxisLabel>

      <mesh rotation={nodePlane.rotation}>
        <planeGeometry args={[5.9, 5.9]} />
        <meshStandardMaterial color="#7e766e" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <Html position={nodePlane.labelPosition} center className="orbital3d-node-label">
        {nodePlane.label}
      </Html>

      <mesh>
        <sphereGeometry args={[0.11, 24, 16]} />
        <meshStandardMaterial color="#27231f" />
      </mesh>

      <PyOrbitalSurface
        alpha={alpha}
        globalPhase={globalPhase}
        orbitalAxis={orbitalAxis}
        resolution={resolution}
      />
      <PhaseLabel position={phaseLabelPosition(orbitalAxis, 1)}>{positiveSign}</PhaseLabel>
      <PhaseLabel position={phaseLabelPosition(orbitalAxis, -1)}>{negativeSign}</PhaseLabel>

      <SamplingBox3D
        box={box}
        mode={mode}
        onBoxChange={onBoxChange}
        onManipulatingChange={(value) => {
          setOrbitEnabled(!value);
          if (controlsRef.current) controlsRef.current.enabled = !value;
        }}
      />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enabled={orbitEnabled}
        enablePan={false}
        minDistance={3.2}
        maxDistance={9.2}
        target={[0, 0, 0]}
      />
      <GizmoHelper alignment="bottom-right" margin={[72, 72]}>
        <GizmoViewport
          axisColors={["#8d5f18", "#2f6fae", "#3f765b"]}
          labelColor="#2a2520"
        />
      </GizmoHelper>
    </>
  );
}

export function PyOrbitalScene({
  alpha,
  box,
  globalPhase,
  mode,
  orbitalAxis,
  onBoxChange,
}: PyOrbitalSceneProps) {
  const [resetKey, setResetKey] = useState(0);

  return (
    <section className="orbital3d-scene-card" aria-label="Three-dimensional orbital view">
      <div className="orbital3d-canvas-wrap">
        <Canvas
          aria-label={`Interactive three-dimensional p-${orbitalAxis} orbital with positive and negative phase lobes, a nodal plane, coordinate axes, and a movable sampling box.`}
          camera={{ position: [4.2, 3.0, 5.2], fov: 42, near: 0.1, far: 100 }}
          dpr={[1, 1.5]}
          fallback={
            <Orbital3DFallback
              box={box}
              globalPhase={globalPhase}
              orbitalAxis={orbitalAxis}
            />
          }
          frameloop="demand"
        >
          <SceneContent
            alpha={alpha}
            box={box}
            globalPhase={globalPhase}
            mode={mode}
            orbitalAxis={orbitalAxis}
            onBoxChange={onBoxChange}
            resetKey={resetKey}
          />
        </Canvas>
      </div>
      <div className="orbital3d-scene-card__footer">
        <p>Drag the background to rotate the view.</p>
        <button type="button" onClick={() => setResetKey((value) => value + 1)}>
          Reset view
        </button>
      </div>
    </section>
  );
}
