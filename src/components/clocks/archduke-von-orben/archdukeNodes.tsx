// Copying setup from https://github.com/pmndrs/examples/blob/main/examples/webgpu-raging-sea/src/seaNodes.tsx
// as closely as possible to help figure out what I'm doing wrong with
// this implementation.

import {
  atan,
  attribute,
  dot,
  EPSILON,
  Fn,
  If,
  mx_noise_float,
  normalLocal,
  PI,
  positionLocal,
  pow,
  rotate,
  smoothstep,
  tangentLocal,
  uniform,
  varying,
  vec3,
} from "three/tsl";
import * as THREE from "three/webgpu";

export function makeOrbUniforms() {
  return {
    // Orb
    orbMass: uniform(5000.0),
    orbDecayFactor: uniform(0.08),
    // Misc.
    uTime: uniform(0),
    uBasePosFreq: uniform(3.15),
    uBaseTimeFreq: uniform(0.02),
    uBaseStrength: uniform(0.06),
    // Hour
    uHTime: uniform(0.0),
    uHBasePosFreq: uniform(0.48),
    uHBaseTimeFreq: uniform(0.08),
    uHBaseStrength: uniform(0.04),
    // Minute
    uMTime: uniform(0.0),
    uMBasePosFreq: uniform(1.06),
    uMBaseTimeFreq: uniform(0.08),
    uMBaseStrength: uniform(0.04),
    // Second
    uSTime: uniform(0.0),
    uSBasePosFreq: uniform(3.28),
    uSBaseTimeFreq: uniform(0.08),
    uSBaseStrength: uniform(0.04),
    // More misc.
    uShift: uniform(0.01),
    uHArcLengthPercent: uniform(1),
    uMArcLengthPercent: uniform(1),
    uSArcLengthPercent: uniform(1),
  };
}

type OrbUniforms = ReturnType<typeof makeOrbUniforms>;

export function makeOrbNodes(inUniforms?: OrbUniforms) {
  const uniforms = inUniforms ?? makeOrbUniforms();
  const u = uniforms; // Abbreviated for readability.

  const getWobble = Fn(
    ({
      pos,
      norm,
      steppedToCameraAmount,
      vBaseStrength,
      vSBaseStrength,
      vBasePosFreq,
      vSBasePosFreq,
    }: {
      pos: THREE.Node<"vec3">;
      norm: THREE.Node<"vec3">;
      steppedToCameraAmount: THREE.Node<"float">;
      vBaseStrength: THREE.Node<"float">;
      vSBaseStrength: THREE.Node<"float">;
      vBasePosFreq: THREE.Node<"float">;
      vSBasePosFreq: THREE.Node<"float">;
    }) => {
      const adjustedPos = pos.add(
        vec3(0, 0, u.uTime.mul(u.uBaseTimeFreq.mul(0.15))),
      );
      const wobble = mx_noise_float(adjustedPos.mul(vBasePosFreq)).mul(
        vBaseStrength,
      );
      const sWobble = mx_noise_float(
        adjustedPos
          .add(vec3(0, 0, u.uSTime.mul(u.uSBaseTimeFreq.mul(0.1))))
          .mul(vSBasePosFreq),
      ).mul(vSBaseStrength);

      wobble.addAssign(sWobble);
      wobble.mulAssign(steppedToCameraAmount.mul(0.5));
      wobble.addAssign(0.5);

      return pos.add(wobble.mul(norm));
    },
    {
      pos: "vec3",
      norm: "vec3",
      steppedToCameraAmount: "float",
      vBaseStrength: "float",
      vSBaseStrength: "float",
      vBasePosFreq: "float",
      vSBasePosFreq: "float",
      return: "vec3",
    },
  );

  const vNormal = varying(vec3(0, 0, 0), "vNormal");
  const vBaseStrength = varying(u.uBaseStrength, "vBaseStrength");
  const vSBaseStrength = varying(u.uSBaseStrength, "vSBaseStrength");
  const vBasePosFreq = varying(u.uBasePosFreq, "vBasePosFreq");
  const vSBasePosFreq = varying(u.uSBasePosFreq, "vSBasePosFreq");

  const positionNode = Fn(() => {
    // Get positions for position node & neighbors for normal calculation.
    const normal = normalLocal.normalize();
    const tangent = tangentLocal
      .sub(normal.mul(dot(tangentLocal, normal)))
      .normalize();
    const biTangent = normal.cross(tangent).normalize();

    const position0 = positionLocal;
    const positionA = positionLocal.add(tangent.mul(u.uShift));
    const positionB = positionLocal.add(biTangent.mul(u.uShift));

    // Get steppedToCameraAmount for position0.
    // Doesn't actually track the camera's position since the camera is fixed.
    const toCameraAmount = dot(normal, vec3(0, 0, 1))
      .mul(0.5)
      .add(0.5);
    const steppedToCameraAmount = smoothstep(
      0.98,
      0.89,
      pow(toCameraAmount, 2),
    );

    // Get wobbles.
    const wobble0 = getWobble({
      pos: position0,
      norm: normal,
      steppedToCameraAmount,
      vBaseStrength: vBaseStrength,
      vSBaseStrength: vSBaseStrength,
      vBasePosFreq: vBasePosFreq,
      vSBasePosFreq: vSBasePosFreq,
    });
    const wobbleA = getWobble({
      pos: positionA,
      norm: normal,
      steppedToCameraAmount,
      vBaseStrength: vBaseStrength,
      vSBaseStrength: vSBaseStrength,
      vBasePosFreq: vBasePosFreq,
      vSBasePosFreq: vSBasePosFreq,
    });
    const wobbleB = getWobble({
      pos: positionB,
      norm: normal,
      steppedToCameraAmount,
      vBaseStrength: vBaseStrength,
      vSBaseStrength: vSBaseStrength,
      vBasePosFreq: vBasePosFreq,
      vSBasePosFreq: vSBasePosFreq,
    });

    // Compute normal.
    const toA = wobbleA.sub(wobble0).normalize();
    const toB = wobbleB.sub(wobble0).normalize();
    // const normalNode = transformNormalToView(toA.cross(toB));
    vNormal.assign(toA.cross(toB).normalize());

    return wobble0;
  })();

  const normalNode = vNormal;

  return {
    positionNode: positionNode,
    normalNode: normalNode,
  };
}

export function makeHandNodes(inUniforms?: OrbUniforms) {
  const uniforms = inUniforms ?? makeOrbUniforms();
  const u = uniforms;

  const positionNode = Fn(() => {
    const baseAngle = atan(
      positionLocal.y.negate().sub(EPSILON),
      positionLocal.x.negate().sub(EPSILON),
    ).add(PI);
    const aArcLengthPercent = attribute("aArcLengthPercent", "int");
    const angle = baseAngle.mul(u.uHArcLengthPercent.oneMinus());
    If(aArcLengthPercent.equal(1), () => {
      angle.assign(baseAngle.mul(u.uMArcLengthPercent.oneMinus()));
    });
    If(aArcLengthPercent.equal(2), () => {
      angle.assign(baseAngle.mul(u.uSArcLengthPercent.oneMinus()));
    });

    return positionLocal;
  })();
  return {
    positionNode: positionNode,
  };
}
