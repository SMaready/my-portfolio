/**
 * Heightfield geometry for the hero's wireframe terrain.
 *
 * Canvas 2D rather than WebGL: it is a few hundred hairlines, it costs nothing,
 * and there is no context-loss or no-GPU path to handle.
 *
 * The field is static and the camera flies over it, rather than the surface
 * undulating in place. Undulation reads as a wobble; travel reads as motion,
 * and it is what makes this feel smooth rather than restless.
 */

export const COLS = 64
export const ROWS = 40

const X_HALF = 34
const Z_NEAR = 3
const Z_FAR = 54
const CAM_Y = 3.4

const DX = (X_HALF * 2) / (COLS - 1)
export const DZ = (Z_FAR - Z_NEAR) / (ROWS - 1)

/** World units per second the camera travels forward. */
export const FLOW_SPEED = 2.1

/** Deterministic, cheap, smooth. Three octaves of sine beats a noise lib here. */
export function heightAt(x: number, z: number): number {
  return (
    Math.sin(x * 0.24 + z * 0.11) * 0.75 +
    Math.sin(z * 0.17 - x * 0.06) * 0.62 +
    Math.sin(x * 0.062 - z * 0.078) * 1.35
  )
}

export type Projected = {
  /** Screen-space x/y, flattened row-major. */
  sx: Float32Array
  sy: Float32Array
  /** Normalised depth 0 (near) to 1 (far), for line falloff. */
  depth: Float32Array
  horizon: number
}

/** Allocated once and refilled in place — per-frame allocation here shows up as GC jank. */
export function createProjected(): Projected {
  const count = COLS * ROWS
  return {
    sx: new Float32Array(count),
    sy: new Float32Array(count),
    depth: new Float32Array(count),
    horizon: 0,
  }
}

/**
 * Projects the heightfield for one frame.
 *
 * `flow` is distance travelled, in world units. The grid slides forward by the
 * remainder of one cell while the field is sampled a whole number of cells
 * ahead, so the wrap is seamless and the motion never repeats visibly.
 */
export function project(
  out: Projected,
  width: number,
  height: number,
  flow: number,
  panX: number,
  panY: number
): void {
  const focal = height * 0.95
  const cx = width * 0.5 + panX * 26
  const horizon = height * 0.42 + panY * 14

  // The grid slides forward by the remainder of one cell and wraps; the field
  // is sampled at the camera-relative depth plus distance travelled.
  //
  // This previously read `zScreen + (flow - cellShift)`, which subtracts the
  // cell offset twice and turns the sampling position into a staircase: the
  // surface froze between cell boundaries and then jumped a whole cell. Frame
  // timing stayed at a clean 16.7ms throughout, because every frame rendered
  // fine — it was just rendering the same picture 45 times in a row.
  const cellShift = flow % DZ

  for (let j = 0; j < ROWS; j++) {
    const zScreen = Z_NEAR + j * DZ - cellShift
    const zWorld = zScreen + flow
    const scale = focal / zScreen
    const rowDepth = j / (ROWS - 1)

    for (let i = 0; i < COLS; i++) {
      const x = -X_HALF + i * DX
      const y = heightAt(x, zWorld)
      const k = j * COLS + i

      out.sx[k] = cx + x * scale
      out.sy[k] = horizon - (y - CAM_Y) * scale
      out.depth[k] = rowDepth
    }
  }

  out.horizon = horizon
}

/** Smoothstep, used to cross-fade one build stage into the next. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}
