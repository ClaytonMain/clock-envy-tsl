import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three/webgpu";
// import useAppStore from "../../../stores/useAppStore";
import BasicBoundsBoxBaybee from "../../misc/BasicBoundsBoxBaybee";
// import CustomStatsComponent from "../../misc/CustomStatsComponent";
import { Inspector } from "three/addons/inspector/Inspector.js";
import DebugOrbitControls from "../../misc/DebugOrbitControls";
// import Digits from "./Digits";
// import Hand from "./Hand";
import { useNodes, useUniforms } from "@react-three/tsl";
import {
  cross,
  dot,
  Fn,
  mx_noise_float,
  normalize,
  normalLocal,
  positionLocal,
  pow,
  smoothstep,
  tangentLocal,
  time,
  vec3,
} from "three/tsl";
import Orb from "./Orb";
import { type NodesType } from "./types/types.tsx";

function Scene() {
  const uniforms = useUniforms(() => ({
    // Orb
    orbMass: 5000.0,
    orbDecayFactor: 0.08,
    // Misc.
    uTime: 0.0,
    uBasePosFreq: 3.15,
    uBaseTimeFreq: 0.02,
    uBaseStrength: 0.06,
    // Hour
    uHTime: 0.0,
    uHBasePosFreq: 0.48,
    uHBaseTimeFreq: 0.08,
    uHBaseStrength: 0.04,
    // Minute
    uMTime: 0.0,
    uMBasePosFreq: 1.06,
    uMBaseTimeFreq: 0.08,
    uMBaseStrength: 0.04,
    // Second
    uSTime: 0.0,
    uSBasePosFreq: 3.28,
    uSBaseTimeFreq: 0.08,
    uSBaseStrength: 0.04,
  }));

  const renderer = useThree((state) => state.renderer);

  useEffect(() => {
    // @ts-expect-error `createParameters` does exist.
    const gui = renderer.inspector?.createParameters("Orb");
    gui.add(uniforms.orbMass, "value", 0, 10000, 1).name("orbMass");
    gui
      .add(uniforms.orbDecayFactor, "value", 0, 1, 0.001)
      .name("orbDecayFactor");
    gui.add(uniforms.uBasePosFreq, "value", 0, 5, 0.01).name("uBasePosFreq");
    gui.add(uniforms.uBaseTimeFreq, "value", 0, 5, 0.01).name("uBaseTimeFreq");
    gui.add(uniforms.uBaseStrength, "value", 0, 5, 0.01).name("uBaseStrength");
    gui.add(uniforms.uHBasePosFreq, "value", 0, 5, 0.01).name("uHBasePosFreq");
    gui
      .add(uniforms.uHBaseTimeFreq, "value", 0, 5, 0.01)
      .name("uHBaseTimeFreq");
    gui
      .add(uniforms.uHBaseStrength, "value", 0, 5, 0.01)
      .name("uHBaseStrength");
    gui.add(uniforms.uMBasePosFreq, "value", 0, 5, 0.01).name("uMBasePosFreq");
    gui
      .add(uniforms.uMBaseTimeFreq, "value", 0, 5, 0.01)
      .name("uMBaseTimeFreq");
    gui
      .add(uniforms.uMBaseStrength, "value", 0, 5, 0.01)
      .name("uMBaseStrength");
    gui.add(uniforms.uSBasePosFreq, "value", 0, 5, 0.01).name("uSBasePosFreq");
    gui
      .add(uniforms.uSBaseTimeFreq, "value", 0, 5, 0.01)
      .name("uSBaseTimeFreq");
    gui
      .add(uniforms.uSBaseStrength, "value", 0, 5, 0.01)
      .name("uSBaseStrength");

    return () => gui.destroy?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderer]);

  const nodes: NodesType = useNodes(() => {
    const biTangent = cross(normalLocal, tangentLocal);

    // Neighbor positions
    const shift = 0.01;
    let positionNode: THREE.Node<"vec3"> = positionLocal;
    let positionA: THREE.Node<"vec3"> = positionLocal.add(
      tangentLocal.mul(shift),
    );
    let positionB: THREE.Node<"vec3"> = positionLocal.add(biTangent.mul(shift));

    // For calculating the amount the surface is facing the (static) camera.
    // Doesn't actually reference the camera's position (currently).
    const toCameraAmount = dot(normalLocal, vec3(0, 0, 1))
      .mul(0.5)
      .add(0.5);
    const steppedToCameraAmount = smoothstep(
      0.98,
      0.89,
      pow(toCameraAmount, 2),
    );
    steppedToCameraAmount.toVarying("vSteppedToCameraAmount");

    // Wobble
    // Honestly, maybe this function should be declared somewhere else?
    const getWobble = Fn(
      ({
        pos,
        steppedToCameraAmount,
      }: {
        pos: THREE.Node<"vec3">;
        steppedToCameraAmount: THREE.Node<"float">;
      }) => {
        const adjustedPos = pos.add(vec3(0, 0, time.mul(0.015)));
        const wobble = mx_noise_float(
          adjustedPos.mul(uniforms.uBasePosFreq),
          time.mul(uniforms.uBaseTimeFreq),
        ).mul(uniforms.uBaseStrength);

        wobble.mulAssign(steppedToCameraAmount.mul(0.5));
        wobble.addAssign(0.5);

        return wobble;
      },
      {
        pos: "vec3",
        steppedToCameraAmount: "float",
        return: "float",
      },
    );

    const wobble = getWobble({
      pos: positionLocal,
      steppedToCameraAmount: steppedToCameraAmount,
    });
    positionNode = positionNode.add(wobble.mul(normalLocal));

    const positionAWobble = getWobble({
      pos: positionA,
      steppedToCameraAmount: steppedToCameraAmount,
    });
    positionA = positionA.add(positionAWobble.mul(normalLocal));

    const positionBWobble = getWobble({
      pos: positionB,
      steppedToCameraAmount: steppedToCameraAmount,
    });
    positionB = positionB.add(positionBWobble.mul(normalLocal));

    // Compute normal
    const toA = normalize(positionA.sub(positionNode));
    const toB = normalize(positionB.sub(positionNode));
    const normalNode = cross(toA, toB);

    return {
      positionNode: positionNode,
      normalNode: normalNode,
    };
  });

  return (
    <>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <Orb position={[0, 0, -2.3]} nodes={nodes} />
      </Suspense>
      <BasicBoundsBoxBaybee boxArgs={[3.0, 3.0, 1.25]} />
      <DebugOrbitControls minDistance={10} maxDistance={50} enableRotate />
      <directionalLight position={[10, 10, 10]} intensity={1} />
    </>
  );
}

export default function ArchdukeVonOrbenScene() {
  const inspector = useMemo(() => {
    console.log("Creating inspector");
    const inspector = new Inspector();
    return inspector;
  }, []);

  return (
    <>
      <Canvas
        dpr={Math.min(window.devicePixelRatio, 2)}
        camera={{
          position: [0, -2, 35],
          rotation: [0.05, 0, 0],
          fov: 8,
          // layers: cameraLayers,
        }}
        style={{
          touchAction: "none",
        }}
        renderer={{
          inspector: inspector,
        }}
      >
        <Scene />
      </Canvas>
      {/* <Loader /> */}
    </>
  );
}
