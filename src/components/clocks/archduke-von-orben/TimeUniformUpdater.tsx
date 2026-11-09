import { useFrame } from "@react-three/fiber";
import { useSpring } from "motion/react";
import { useEffect, useRef } from "react";
import useAppStore from "../../../stores/useAppStore.js";
import { SPRING_CONFIGS } from "./constants/constants.jsx";

function getTimeLengthPercent(hms: "h" | "m" | "s", formatHours24: boolean) {
  const now = useAppStore.getState().currentTimeValue.toJSDate();
  if (hms === "h") {
    let hours = now.getHours();
    if (!formatHours24) {
      hours = hours % 12;
    }
    return hours / (formatHours24 ? 24 : 12);
  } else if (hms === "m") {
    return now.getMinutes() / 60;
  } else if (hms === "s") {
    return now.getSeconds() / 60;
  }
  return 0;
}

export default function TimeUniformUpdater() {
  const formatHours24 = useAppStore((state) => state.formatHours24);

  // The original code created different springs for the hands and the
  // orb to use, but I'd like to try to just use one spring per hand.
  // If that doesn't work, that's fine, I'll still be consolidating the
  // logic into this component.
  const hSpring = useSpring(getTimeLengthPercent("h", formatHours24), {
    ...SPRING_CONFIGS.shared,
    ...SPRING_CONFIGS.h,
  });
  const mSpring = useSpring(getTimeLengthPercent("m", formatHours24), {
    ...SPRING_CONFIGS.shared,
    ...SPRING_CONFIGS.m,
  });
  const sSpring = useSpring(getTimeLengthPercent("s", formatHours24), {
    ...SPRING_CONFIGS.shared,
    ...SPRING_CONFIGS.s,
  });

  // const uHSpringVelocityDeltaRef = useRef(0);
  // const uMSpringVelocityDeltaRef = useRef(0);
  // const uSSpringVelocityDeltaRef = useRef(0);

  // const hmsValues = {
  //   h: {
  //     timeLenPcts: {
  //       lastFrame: getTimeLengthPercent("h", formatHours24),
  //       current: getTimeLengthPercent("h", formatHours24),
  //     },
  //     spring: hSpring,
  //   },
  //   m: {
  //     timeLenPcts: {
  //       lastFrame: getTimeLengthPercent("m", formatHours24),
  //       current: getTimeLengthPercent("m", formatHours24),
  //     },
  //     spring: mSpring,
  //   },
  //   s: {
  //     timeLenPcts: {
  //       lastFrame: getTimeLengthPercent("s", formatHours24),
  //       current: getTimeLengthPercent("s", formatHours24),
  //     },
  //     spring: sSpring,
  //   },
  // };

  const hTimeLenPctRef = useRef(getTimeLengthPercent("h", formatHours24));
  const mTimeLenPctRef = useRef(getTimeLengthPercent("m", formatHours24));
  const sTimeLenPctRef = useRef(getTimeLengthPercent("s", formatHours24));

  useEffect(() => {
    const unsubCurrentTimeValue = useAppStore.subscribe(
      (state) => state.currentTimeValue,
      (value, previousValue) => {
        if (value.get("hour") !== previousValue.get("hour")) {
          hSpring.set(hSpring.get() + 1 / (formatHours24 ? 24 : 12));
        }
        if (value.get("minute") !== previousValue.get("minute")) {
          mSpring.set(mSpring.get() + 1 / 60);
        }
        if (value.get("second") !== previousValue.get("second")) {
          sSpring.set(sSpring.get() + 1 / 60);
        }
      },
    );
    // The below were in the original code, but prolly don't need the subscription approach
    // since we're doing all the calculations here.
    // const unsubHVelocity = useArchdukeVonOrbenStore.subscribe(
    //   (state) => state.uHSpringVelocity,
    //   (value, previous) => {
    //     uHSpringVelocityDeltaRef.current = value - previous;
    //   },
    // );
    // const unsubMVelocity = useArchdukeVonOrbenStore.subscribe(
    //   (state) => state.uMSpringVelocity,
    //   (value, previous) => {
    //     uMSpringVelocityDeltaRef.current = value - previous;
    //   },
    // );
    // const unsubSVelocity = useArchdukeVonOrbenStore.subscribe(
    //   (state) => state.uSSpringVelocity,
    //   (value, previous) => {
    //     uSSpringVelocityDeltaRef.current = value - previous;
    //   },
    // );
    return () => {
      unsubCurrentTimeValue();
    };
  }, [formatHours24, hSpring, mSpring, sSpring]);

  const velocityRef = useRef(0.1);

  useFrame((state) => {
    // state.uniforms.uTime.value = state.elapsed * 1000.001;
    // state.delta
    const u = state.uniforms;

    const delta = Math.min(state.delta, 1 / 60);

    const currentHTimeLenPct = getTimeLengthPercent("h", formatHours24);
    const currentMTimeLenPct = getTimeLengthPercent("m", formatHours24);
    const currentSTimeLenPct = getTimeLengthPercent("s", formatHours24);

    if (currentHTimeLenPct !== hTimeLenPctRef.current) {
      hTimeLenPctRef.current = currentHTimeLenPct;
      hSpring.set(currentHTimeLenPct);
    }
    if (currentMTimeLenPct !== mTimeLenPctRef.current) {
      mTimeLenPctRef.current = currentMTimeLenPct;
      mSpring.set(currentMTimeLenPct);
    }
    if (currentSTimeLenPct !== sTimeLenPctRef.current) {
      sTimeLenPctRef.current = currentSTimeLenPct;
      sSpring.set(currentSTimeLenPct);
    }

    const hForce =
      (SPRING_CONFIGS.h.mass *
        2 *
        Math.max(Math.abs(hSpring.getVelocity()) - velocityRef.current, 0)) /
      delta;
    const mForce =
      (SPRING_CONFIGS.m.mass *
        2 *
        Math.max(Math.abs(mSpring.getVelocity()) - velocityRef.current, 0)) /
      delta;
    const sForce =
      (SPRING_CONFIGS.s.mass *
        2 *
        Math.max(Math.abs(sSpring.getVelocity()) - velocityRef.current, 0)) /
      delta;

    velocityRef.current += (hForce + mForce + sForce) / u.orbMass.value;
    velocityRef.current = Math.max(
      0,
      velocityRef.current * (1 - u.orbDecayFactor.value * delta),
    );

    u.uTime.value += velocityRef.current;
    u.uHTime.value += hSpring.getVelocity() + delta;
    u.uMTime.value += mSpring.getVelocity() + delta;
    u.uSTime.value += sSpring.getVelocity() + delta;

    u.uHArcLengthPercent.value = hSpring.get();
    u.uMArcLengthPercent.value = mSpring.get();
    u.uSArcLengthPercent.value = sSpring.get();
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
