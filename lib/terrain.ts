/**
 * Heightfield geometry for the hero's wireframe terrain.
 *
 * Canvas 2D rather than WebGL: it is a few hundred hairlines, it costs nothing,
 * and there is no context-loss or no-GPU path to handle.
 *
 * Everything here is pure. The component owns time and the canvas.
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

/** Smoothstep, used to cross-fade one build stage into the next. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}
