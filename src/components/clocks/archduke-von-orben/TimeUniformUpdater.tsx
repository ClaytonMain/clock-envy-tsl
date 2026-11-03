import { useFrame } from "@react-three/fiber";
import { SPRING_CONFIGS } from "./constants/constants.jsx";
import { useSpring } from "motion/react";
import { useRef } from "react";

export default function TimeUniformUpdater() {
  // The original code created different springs for the hands and the
  // orb to use, but I'd like to try to just use one spring per hand.
  // If that doesn't work, that's fine, I'll still be consolidating the
  // logic into this component.
  const hSpring = useSpring(0, {
    ...SPRING_CONFIGS.shared,
    ...SPRING_CONFIGS.h,
  });
  const mSpring = useSpring(0, {
    ...SPRING_CONFIGS.shared,
    ...SPRING_CONFIGS.m,
  });
  const sSpring = useSpring(0, {
    ...SPRING_CONFIGS.shared,
    ...SPRING_CONFIGS.s,
  });

  const uHSpringVelocityDeltaRef = useRef(0);
  const uMSpringVelocityDeltaRef = useRef(0);
  const uSSpringVelocityDeltaRef = useRef(0);

  useFrame((state) => {
    // state.uniforms.uTime.value = state.elapsed * 1000.001;
    // state.delta
    const u = state.uniforms;

    const delta = Math.min(state.delta, 1/60);

    const hForce = ()

  });
  return null;
}


// Below is the old code that I'm adapting.

  // const deltaRef = useRef(0);

  // const velocityRef = useRef(0.1);

  // useFrame(({ renderer, camera, scene }, delta) => {
  //   // General.
  //   deltaRef.current = Math.max(delta, 0.016);

  //   const hForce =
  //     (SPRING_CONFIGS.h.mass *
  //       2 *
  //       Math.max(
  //         Math.abs(uHSpringVelocityDeltaRef.current) - velocityRef.current,
  //         0,
  //       )) /
  //     deltaRef.current;
  //   const mForce =
  //     (SPRING_CONFIGS.m.mass *
  //       2 *
  //       Math.max(
  //         Math.abs(uMSpringVelocityDeltaRef.current) - velocityRef.current,
  //         0,
  //       )) /
  //     deltaRef.current;
  //   const sForce =
  //     (SPRING_CONFIGS.s.mass *
  //       2 *
  //       Math.max(
  //         Math.abs(uSSpringVelocityDeltaRef.current) - velocityRef.current,
  //         0,
  //       )) /
  //     deltaRef.current;

  //   velocityRef.current += (hForce + mForce + sForce) / uniforms.orbMass.value;
  //   velocityRef.current = Math.max(
  //     0,
  //     velocityRef.current *
  //       (1 - uniforms.orbDecayFactor.value * deltaRef.current),
  //   );

  //   // uTimeRef.current += velocityRef.current;
  //   // uHTimeRef.current += deltaRef.current + hSpringLocal.getVelocity();
  //   // uMTimeRef.current += deltaRef.current + mSpringLocal.getVelocity();
  //   // uSTimeRef.current += deltaRef.current + sSpringLocal.getVelocity();

  //   // uniforms.uTime.value = uTimeRef.current;
  //   // uniforms.uBasePosFreq.value = controlValues.uBasePosFreq;
  //   // uniforms.uBaseTimeFreq.value = controlValues.uBaseTimeFreq;
  //   // uniforms.uBaseStrength.value = controlValues.uBaseStrength;

  //   // uniforms.uHTime.value = uHTimeRef.current;
  //   // uniforms.uHBasePosFreq.value = controlValues.uHBasePosFreq;
  //   // uniforms.uHBaseTimeFreq.value = controlValues.uHBaseTimeFreq;
  //   // uniforms.uHBaseStrength.value = controlValues.uHBaseStrength;

  //   // uniforms.uMTime.value = uMTimeRef.current;
  //   // uniforms.uMBasePosFreq.value = controlValues.uMBasePosFreq;
  //   // uniforms.uMBaseTimeFreq.value = controlValues.uMBaseTimeFreq;
  //   // uniforms.uMBaseStrength.value = controlValues.uMBaseStrength;

  //   // uniforms.uSTime.value = uSTimeRef.current;
  //   // uniforms.uSBasePosFreq.value = controlValues.uSBasePosFreq;
  //   // uniforms.uSBaseTimeFreq.value = controlValues.uSBaseTimeFreq;
  //   // uniforms.uSBaseStrength.value = controlValues.uSBaseStrength;

  //   // Rendering logic.
  //   // camera.layers = reflectorLayers;
  //   // renderer.render(scene, camera);

  //   // if (reflectorRef.current && csmRef.current) {
  //   //   csmRef.current.uniforms.uTextureMatrix.value =
  //   //     // @ts-expect-error It's fine, don't worry about it.
  //   //     reflectorRef.current.material.uniforms["textureMatrix"].value;
  //   //   csmRef.current.uniforms.uTDiffuse.value =
  //   //     // @ts-expect-error It's fine, don't worry about it.
  //   //     reflectorRef.current.material.uniforms["tDiffuse"].value;
  //   // } else {
  //   //   console.log("no reflectorRef or csmRef");
  //   // }

  //   // camera.layers = orbLayers;
  //   // renderer.render(scene, camera);
  // });