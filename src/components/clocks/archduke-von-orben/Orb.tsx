import { useSpring } from "motion/react";
import { useEffect, useMemo, useRef } from "react";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import * as THREE from "three/webgpu";
import useAppStore from "../../../stores/useAppStore";
import { SPRING_CONFIGS } from "./constants/constants";
import useArchdukeVonOrbenStore from "./stores/useArchdukeVonOrbenStore";
import type { NodesType } from "./types/types.tsx";

export default function Orb({
  position = [0, 0, 0],
  nodes,
}: {
  position?: [number, number, number];
  nodes: NodesType;
}) {
  const formatHours24 = useAppStore((state) => state.formatHours24);
  // const reflectorRef = useRef<THREE.Mesh>(null!);
  // const csmRef = useRef<CSM<typeof THREE.MeshPhysicalMaterial>>(null!);
  // const csmDepthRef = useRef<CSM<typeof THREE.MeshDepthMaterial>>(null!);
  const orbRef = useRef<THREE.Mesh>(null!);

  const orbGeometry = useMemo(() => {
    const geometry = mergeVertices(new THREE.IcosahedronGeometry(2, 80));
    geometry.computeTangents();
    return geometry;
  }, []);

  // const reflectorLayers = useMemo(() => {
  //   const layers = new THREE.Layers();
  //   return layers;
  // }, []);

  // Sort of mimicking the Hand spring velocities, but without the large
  // jumps when going from full hand length to zero. Helps achieve the
  // tick effect on the orb each time the hand lengths change.
  const hSpringLocal = useSpring(0, {
    ...SPRING_CONFIGS.shared,
    ...SPRING_CONFIGS.h,
  });
  const mSpringLocal = useSpring(0, {
    ...SPRING_CONFIGS.shared,
    ...SPRING_CONFIGS.m,
  });
  const sSpringLocal = useSpring(0, {
    ...SPRING_CONFIGS.shared,
    ...SPRING_CONFIGS.s,
  });

  // Used to calculate the force imparted on the orb by each hand's spring
  // velocity changes. Helps achieve that nice inertia effect when the hands
  // reset from full length to zero.
  const uHSpringVelocityDeltaRef = useRef(0);
  const uMSpringVelocityDeltaRef = useRef(0);
  const uSSpringVelocityDeltaRef = useRef(0);

  useEffect(() => {
    const unsubCurrentTimeValue = useAppStore.subscribe(
      (state) => state.currentTimeValue,
      (value, previous) => {
        if (value.get("hour") !== previous.get("hour")) {
          hSpringLocal.set(hSpringLocal.get() + 1 / (formatHours24 ? 24 : 12));
        }
        if (value.get("minute") !== previous.get("minute")) {
          mSpringLocal.set(mSpringLocal.get() + 1 / 60);
        }
        if (value.get("second") !== previous.get("second")) {
          sSpringLocal.set(sSpringLocal.get() + 1 / 60);
        }
      },
    );
    const unsubHVelocity = useArchdukeVonOrbenStore.subscribe(
      (state) => state.uHSpringVelocity,
      (value, previous) => {
        uHSpringVelocityDeltaRef.current = value - previous;
      },
    );
    const unsubMVelocity = useArchdukeVonOrbenStore.subscribe(
      (state) => state.uMSpringVelocity,
      (value, previous) => {
        uMSpringVelocityDeltaRef.current = value - previous;
      },
    );
    const unsubSVelocity = useArchdukeVonOrbenStore.subscribe(
      (state) => state.uSSpringVelocity,
      (value, previous) => {
        uSSpringVelocityDeltaRef.current = value - previous;
      },
    );
    return () => {
      unsubCurrentTimeValue();
      unsubHVelocity();
      unsubMVelocity();
      unsubSVelocity();
    };
  }, [formatHours24, hSpringLocal, mSpringLocal, sSpringLocal]);

  return (
    <>
      <group position={position}>
        <mesh ref={orbRef} geometry={orbGeometry} castShadow receiveShadow>
          <meshPhysicalNodeMaterial positionNode={nodes.positionNode} />
        </mesh>
      </group>
    </>
  );
}
