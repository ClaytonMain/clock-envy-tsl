import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo } from "react";
import * as THREE from "three/webgpu";
// import useAppStore from "../../../stores/useAppStore";
import BasicBoundsBoxBaybee from "../../misc/BasicBoundsBoxBaybee";
// import CustomStatsComponent from "../../misc/CustomStatsComponent";
import { Inspector } from "three/addons/inspector/Inspector.js";
import DebugOrbitControls from "../../misc/DebugOrbitControls";
// import Digits from "./Digits";
// import Hand from "./Hand";
import { useNodes, useUniforms } from "@react-three/tsl";
import { Fn, mx_noise_float, time, vec3 } from "three/tsl";
import Orb from "./Orb";

function GlobalEffects() {
  useNodes(({ uniforms }) => ({
    getWobble: Fn(
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
    ),
  }));
  return null;
}

function ArchdukeVonOrben() {
  // const formatHours24 = useAppStore((state) => state.formatHours24);
  const uniforms = useUniforms({
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
  });
  return (
    <>
      <GlobalEffects />
      <Orb position={[0, 0, -2.3]} />
      {/* <Hand
        hms="s"
        radius={1.3}
        color={"#deeadd"}
        formatHours24={formatHours24}
      />
      <Hand
        hms="m"
        radius={1.0}
        color={"#deeadd"}
        formatHours24={formatHours24}
      />
      <Hand
        hms="h"
        radius={0.7}
        color={"#deeadd"}
        formatHours24={formatHours24}
      />
      <Digits position={[0, 0.09, 1]} /> */}
    </>
  );
}

export default function ArchdukeVonOrbenScene() {
  const cameraLayers = useMemo(() => {
    const layers = new THREE.Layers();
    layers.set(1);
    return layers;
  }, []);
  const allLayers = useMemo(() => {
    const layers = new THREE.Layers();
    layers.enableAll();
    return layers;
  }, []);
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
          layers: cameraLayers,
        }}
        style={{
          touchAction: "none",
        }}
        renderer={{
          inspector: inspector,
        }}
      >
        {/* <CustomStatsComponent /> */}
        <Suspense fallback={null}>
          {/* <Environment
            files="./environments/warm_reception_dinner_1k.hdr"
            resolution={1024}
          /> */}
          <ambientLight intensity={0.5} layers={allLayers} />
          <ArchdukeVonOrben />
        </Suspense>
        <BasicBoundsBoxBaybee boxArgs={[3.0, 3.0, 1.25]} />
        <DebugOrbitControls minDistance={10} maxDistance={50} enableRotate />
      </Canvas>
      {/* <Loader /> */}
    </>
  );
}
