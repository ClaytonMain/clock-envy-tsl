import { Torus } from "@react-three/drei";
import { useNodes } from "@react-three/tsl";
import { useEffect, useRef } from "react";
import * as THREE from "three/webgpu";
import useAppStore from "../../../stores/useAppStore";

const HAND_ATTRIBUTE_DICT = {
  h: 0,
  m: 1,
  s: 2,
};

export default function Hand({
  hms,
  radius = 1,
  tube = 0.1,
  radialSegments = 8,
  tubularSegments = 50,
  arc = Math.PI * 2 - (Math.PI * 2) / 3,
  position = [0, 0, 0],
  rotation = [0, 0, -Math.PI / 6],
  color = "#2cff05",
  materialProps = {
    roughness: 0.1,
    metalness: 0.0,
    clearcoat: 0.9,
  },
  layers,
}: {
  hms: "h" | "m" | "s";
  radius?: number;
  tube?: number;
  radialSegments?: number;
  tubularSegments?: number;
  arc?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  materialProps?: THREE.MeshPhysicalMaterialParameters;
  layers?: THREE.Layers;
}) {
  const innerGroupRef = useRef<THREE.Group>(null!);
  const formatHours24 = useAppStore((state) => state.formatHours24);

  const handNodes = useNodes("hand");

  const torusRef = useRef<THREE.Mesh>(null!);

  useEffect(() => {
    if (torusRef.current) {
      torusRef.current.geometry.setAttribute(
        "aHMSId",
        new THREE.BufferAttribute(
          new Float32Array(
            torusRef.current.geometry.attributes.position.count,
          ).fill(HAND_ATTRIBUTE_DICT[hms]),
          1,
        ),
      );
    }
  }, [hms]);

  return (
    <group position={position} rotation={rotation}>
      <group ref={innerGroupRef}>
        <Torus
          args={[radius, tube, radialSegments, tubularSegments, arc]}
          castShadow
          receiveShadow
          ref={torusRef}
        >
          <meshPhysicalNodeMaterial
            {...materialProps}
            {...handNodes}
            color={color}
          />
        </Torus>
      </group>
    </group>
  );
}
