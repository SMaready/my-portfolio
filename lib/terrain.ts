/**
 * A tiny software renderer for the hero / pipeline sequence.
 *
 * Canvas 2D rather than WebGL on purpose: the whole point of the sequence is to
 * walk through the stages of a raster pipeline, and doing it by hand means each
 * stage is a real, separate step in this file rather than a uniform toggled in
 * a shader. It also removes context-loss and no-GPU handling entirely.
 *
 * Everything here is pure. The component owns time, scroll and the canvas.
 */

export const COLS = 46
export const ROWS = 30

const X_HALF = 15
const Z_NEAR = 3.2
const Z_FAR = 44
const CAM_Y = 3.1

/** Deterministic, cheap, and smooth. Four octaves of sine beats a noise lib here. */
export function heightAt(x: number, z: number, t: number): number {
  return (
    Math.sin(x * 0.26 + t * 0.32) * 0.62 +
    Math.sin(z * 0.19 - t * 0.2) * 0.54 +
    Math.sin((x + z) * 0.12 + t * 0.13) * 0.92 +
    Math.sin(x * 0.068 - z * 0.085) * 1.35
  )
}

export type Projected = {
  /** Screen-space x/y and the 1/z scale, flattened row-major. */
  sx: Float32Array
  sy: Float32Array
  /** World-space height, kept for the lighting pass. */
  wy: Float32Array
  /** Normalised depth 0 (near) → 1 (far), for fog and line falloff. */
  depth: Float32Array
  horizon: number
}

/**
 * Projects the heightfield for one frame.
 *
 * `panX` / `panY` are the cursor parallax, applied to the camera rather than to
 * the projected points so the perspective stays honest.
 */
export function project(
  width: number,
  height: number,
  t: number,
  panX: number,
  panY: number
): Projected {
  const count = COLS * ROWS
  const sx = new Float32Array(count)
  const sy = new Float32Array(count)
  const wy = new Float32Array(count)
  const depth = new Float32Array(count)

  const focal = height * 0.92
  const cx = width * 0.5 + panX * 26
  const horizon = height * 0.4 + panY * 14

  const dx = (X_HALF * 2) / (COLS - 1)
  const dz = (Z_FAR - Z_NEAR) / (ROWS - 1)

  for (let j = 0; j < ROWS; j++) {
    const z = Z_NEAR + j * dz
    const scale = focal / z
    const rowDepth = j / (ROWS - 1)

    for (let i = 0; i < COLS; i++) {
      const x = -X_HALF + i * dx
      const y = heightAt(x, z, t)
      const k = j * COLS + i

      wy[k] = y
      sx[k] = cx + x * scale
      sy[k] = horizon - (y - CAM_Y) * scale
      depth[k] = rowDepth
    }
  }

  return { sx, sy, wy, depth, horizon }
}

/**
 * Surface normal of a quad, from its world-space corners. Only the y component
 * of the two spanning vectors changes, so this reduces to a cheap cross product.
 */
export function quadShade(
  wy: Float32Array,
  i: number,
  j: number,
  spacingX: number,
  spacingZ: number
): number {
  const k = j * COLS + i
  const hL = wy[k]
  const hR = wy[k + 1]
  const hD = wy[k + COLS]

  // Tangents: (spacingX, hR - hL, 0) and (0, hD - hL, spacingZ).
  // Heights are exaggerated for the normal only — at true scale this terrain is
  // shallow enough that every normal points straight up and the lambert term is
  // a flat 0.83 everywhere, which reads as unlit grey.
  const nx = (hR - hL) * RELIEF * spacingZ * -1
  const ny = spacingX * spacingZ
  const nz = (hD - hL) * RELIEF * spacingX * -1

  const len = Math.hypot(nx, ny, nz) || 1

  // Light direction, normalised: high and slightly to the left.
  const lambert = (nx / len) * -0.42 + (ny / len) * 0.83 + (nz / len) * -0.37
  return Math.max(0, lambert)
}

/** Vertical exaggeration applied to normals only. Purely a lighting choice. */
const RELIEF = 4.2

export const SPACING_X = (X_HALF * 2) / (COLS - 1)
export const SPACING_Z = (Z_FAR - Z_NEAR) / (ROWS - 1)

/** Smoothstep, used to cross-fade one pipeline stage into the next. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

export type StageMix = {
  wireframe: number
  fill: number
  lighting: number
  fog: number
  post: number
}

/**
 * Maps overall sequence progress (0–1) onto the individual stage weights.
 * Stages overlap deliberately: each one is arriving while the last is leaving,
 * which is what makes the scrub read as one transformation instead of four cuts.
 */
export function stageMix(p: number): StageMix {
  return {
    wireframe: 1 - smoothstep(0.08, 0.34, p),
    fill: smoothstep(0.12, 0.38, p),
    lighting: smoothstep(0.34, 0.6, p),
    fog: smoothstep(0.56, 0.8, p),
    post: smoothstep(0.74, 0.97, p),
  }
}

export const STAGES = [
  {
    key: 'geometry',
    label: 'Geometry',
    caption: 'A heightfield of vertices, projected through a perspective camera.',
  },
  {
    key: 'raster',
    label: 'Rasterise',
    caption: 'Quads resolve into filled fragments, drawn far to near.',
  },
  {
    key: 'shading',
    label: 'Shading',
    caption: 'Surface normals meet a light direction. The form appears.',
  },
  {
    key: 'atmosphere',
    label: 'Atmosphere',
    caption: 'Distance fog separates foreground from horizon.',
  },
  {
    key: 'post',
    label: 'Post',
    caption: 'Vignette, grain, and a final pass over the frame.',
  },
] as const
