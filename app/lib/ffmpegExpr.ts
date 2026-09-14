import type { z } from "zod";

type Easing = "linear" | "easeIn" | "easeOut" | "easeInOut";

interface Keyframe {
  tiempo: number;
  valor: number;
  easing: Easing;
}

/**
 * Converts an easing type into an ffmpeg-eval-compatible expression,
 * given a progress variable expression `p` already normalized to [0,1].
 */
function easingExpr(easing: Easing, p: string): string {
  switch (easing) {
    case "linear":
      return p;
    case "easeIn":
      return `pow(${p},2)`;
    case "easeOut":
      return `(1-pow(1-(${p}),2))`;
    case "easeInOut":
      return `if(lt(${p},0.5), 2*pow(${p},2), 1-pow(-2*(${p})+2,2)/2)`;
  }
}

/**
 * Builds a single ffmpeg expression (usable in drawtext x/y/alpha/fontsize,
 * or any filter that accepts a time-based `t` expression) that interpolates
 * through an arbitrary number of keyframes with per-segment easing.
 *
 * `offset` shifts keyframe times to match this clip's position in the
 * final composed timeline (e.g. clip starts at t=12s in the output).
 */
export function keyframesToExpr(keyframes: Keyframe[], offset = 0): string {
  if (keyframes.length === 0) {
    throw new Error("keyframesToExpr: se necesita al menos un keyframe");
  }

  const sorted = [...keyframes].sort((a, b) => a.tiempo - b.tiempo);

  if (sorted.length === 1) {
    return `${sorted[0].valor}`;
  }

  // Build nested if(between(t, t0, t1), segmentExpr, ...else chain...)
  // starting from the LAST segment and wrapping outward, so the final
  // string reads as a single valid ffmpeg eval expression.
  let expr = `${sorted[sorted.length - 1].valor}`; // fallback: after last keyframe

  for (let i = sorted.length - 2; i >= 0; i--) {
    const kf0 = sorted[i];
    const kf1 = sorted[i + 1];
    const t0 = kf0.tiempo + offset;
    const t1 = kf1.tiempo + offset;

    const duration = t1 - t0;
    if (duration <= 0) {
      throw new Error(
        `keyframesToExpr: keyframes fuera de orden o con tiempo duplicado (${kf0.tiempo} -> ${kf1.tiempo})`
      );
    }

    const p = `((t-${t0})/${duration})`;
    const eased = easingExpr(kf1.easing, p);
    const segmentValue = `(${kf0.valor}+(${kf1.valor}-${kf0.valor})*(${eased}))`;

    expr = `if(between(t,${t0},${t1}), ${segmentValue}, ${expr})`;
  }

  // Before the first keyframe: hold the first value constant.
  const firstT = sorted[0].tiempo + offset;
  expr = `if(lt(t,${firstT}), ${sorted[0].valor}, ${expr})`;

  return expr;
}