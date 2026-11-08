import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
// import useAppStore from "../../../stores/useAppStore";
import BasicBoundsBoxBaybee from "../../misc/BasicBoundsBoxBaybee";
// import CustomStatsComponent from "../../misc/CustomStatsComponent";
import { Inspector } from "three/addons/inspector/Inspector.js";
import DebugOrbitControls from "../../misc/DebugOrbitControls";
// import Digits from "./Digits";
// import Hand from "./Hand";
import { Environment } from "@react-three/drei";
import { useNodes, useUniforms } from "@react-three/tsl";
import { makeHandNodes, makeOrbNodes, makeOrbUniforms } from "./archdukeNodes";
import Hand from "./Hand";
import Orb from "./Orb";
import TimeUniformUpdater from "./TimeUniformUpdater";

function Scene() {
  const uniforms = useUniforms(() => makeOrbUniforms());

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
    gui.add(uniforms.uShift, "value", 0, 0.1, 0.0001).name("uShift");

    return () => gui.destroy?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderer]);

  const orbNodes = useNodes(() => makeOrbNodes(uniforms), "orb");
  const handNodes = useNodes(() => makeHandNodes(uniforms), "hand");

  const { scene } = useThree();

  const didEnvironmentRebuild = useRef(false);
  useEffect(() => {
    if (didEnvironmentRebuild.current) return;

    // If scene.environment.isTexture, rebuild nodes and stop interval
    const timerId = setInterval(() => {
      if (scene.environment?.isTexture) {
        didEnvironmentRebuild.current = true;
        orbNodes.rebuildNodes();
        handNodes.rebuildNodes();
        clearInterval(timerId);
      }
    }, 1000); // Check every 1s
    return () => clearInterval(timerId);
  }, [scene.environment, orbNodes, handNodes]);

  return (
    <>
      <Suspense fallback={null}>
        <Environment
          files="./environments/warm_reception_dinner_1k.hdr"
          resolution={1024}
        />
        <ambientLight intensity={0.5} />
        {orbNodes && (
          <>
            <TimeUniformUpdater />
            <Orb position={[0, 0, -2.3]} />
            <Hand hms="s" radius={1.3} color={"#deeadd"} />
          </>
        )}
      </Suspense>
      <BasicBoundsBoxBaybee boxArgs={[3.0, 3.0, 1.25]} />
      <DebugOrbitControls minDistance={10} maxDistance={50} enableRotate />
      <directionalLight
        position={[10, 10, 10]}
        intensity={1}
        castShadow
        shadow-radius={5}
        shadow-normalBias={0.1}
      />
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
          shadowMap: {
            enabled: true,
            type: THREE.PCFShadowMap,
            transmitted: true,
          },
        }}
      >
        <Scene />
      </Canvas>
      {/* <Loader /> */}
    </>
  );
}
