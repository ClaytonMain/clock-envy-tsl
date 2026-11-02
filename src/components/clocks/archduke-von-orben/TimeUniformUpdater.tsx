import { useFrame } from "@react-three/fiber";

export default function TimeUniformUpdater() {
  useFrame((state) => {
    state.uniforms.uTime.value = state.elapsed * 1000.001;
  });
  return null;
}
