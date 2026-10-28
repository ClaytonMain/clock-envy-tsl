import type { NodesWithUtils } from "@react-three/tsl";
import * as THREE from "three/webgpu";

export type NodesType = NodesWithUtils<{
  positionNode: THREE.Node<"vec3">;
  normalNode: THREE.Node<"vec3">;
}>;
