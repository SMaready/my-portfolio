'use client'

import { useEffect, useRef } from 'react'
import { COLS, ROWS, FLOW_SPEED, createProjected, project } from '@/lib/terrain'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

// 2x on a phone is ~1.3M pixels of hairline stroking per frame, which measured
// as roughly a fifth of frames landing at 33ms — visible as intermittent
// stutter rather than a lower frame rate. 1.5 is indistinguishable here.
const MAX_DPR = 1.5

/**
 * Ambient wireframe terrain behind the hero. The camera travels forward over a
 * static heightfield and parallaxes toward the cursor; it never does anything
 * else, because the build sequence below has its own ground.
 */
export function HeroTerrain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduceMotion = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Allocated once. Rebuilding these each frame was ~22KB of garbage per
    // frame, which is exactly the kind of steady allocation that shows up as
    // periodic hitching rather than a lower frame rate.
    const geo = createProjected()

    let width = 0
    let height = 0
    let raf = 0
    let last = performance.now()
    let flow = 0

    let targetPanX = 0
    let targetPanY = 0
    let panX = 0
    let panY = 0
    let columnStep = 2

    function resize() {
      if (!canvas || !ctx) return
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // Fewer verticals on narrow screens: at phone widths they crowd into
      // moire anyway, so this costs nothing visually.
      columnStep = width < 700 ? 4 : 2
    }

    function onPointer(event: PointerEvent) {
      if (reduceMotion) return
      targetPanX = event.clientX / window.innerWidth - 0.5
      targetPanY = event.clientY / window.innerHeight - 0.5
    }

    function draw(now: number) {
      if (!ctx) return

      // Time-based rather than per-frame increments, so a dropped frame costs a
      // longer step instead of a visible stall. Clamped so returning to a
      // backgrounded tab does not jump the terrain forward.
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!reduceMotion) flow += dt * FLOW_SPEED

      panX += (targetPanX - panX) * 0.06
      panY += (targetPanY - panY) * 0.06

      project(geo, width, height, reduceMotion ? 6 : flow, panX, panY)

      ctx.clearRect(0, 0, width, height)

      const glowTop = geo.horizon - height * 0.3
      const glow = ctx.createLinearGradient(0, glowTop, 0, geo.horizon + height * 0.05)
      glow.addColorStop(0, 'rgba(70,224,176,0)')
      glow.addColorStop(0.75, 'rgba(70,224,176,0.05)')
      glow.addColorStop(1, 'rgba(70,224,176,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, glowTop, width, height * 0.35 + 2)

      ctx.lineWidth = 1

      // Rows, drawn near to far so the nearest lines sit on top.
      for (let j = 0; j < ROWS; j++) {
        const fade = 1 - geo.depth[j * COLS] * 0.72
        ctx.strokeStyle = `rgba(150,214,196,${fade * 0.3})`
        ctx.beginPath()
        for (let i = 0; i < COLS; i++) {
          const k = j * COLS + i
          if (i === 0) ctx.moveTo(geo.sx[k], geo.sy[k])
          else ctx.lineTo(geo.sx[k], geo.sy[k])
        }
        ctx.stroke()
      }

      ctx.strokeStyle = 'rgba(150,214,196,0.13)'
      ctx.beginPath()
      for (let i = 0; i < COLS; i += columnStep) {
        for (let j = 0; j < ROWS; j++) {
          const k = j * COLS + i
          if (j === 0) ctx.moveTo(geo.sx[k], geo.sy[k])
          else ctx.lineTo(geo.sx[k], geo.sy[k])
        }
      }
      ctx.stroke()

      if (!reduceMotion) raf = window.requestAnimationFrame(draw)
    }

    resize()
    last = performance.now()
    raf = window.requestAnimationFrame(draw)

    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointer, { passive: true })

    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointer)
    }
  }, [reduceMotion])

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="h-full w-full" />

      {/* Vertical only. The old radial vignette darkened the left and right
          edges, which is what stopped the grid reaching the sides of the
          screen. This shades into the nav above and dissolves the grid into
          the page below so the next section is not a hard cut. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(11,12,14,0.85) 0%, rgba(11,12,14,0) 22%, rgba(11,12,14,0) 58%, rgba(11,12,14,0.75) 88%, var(--color-bg) 100%)',
        }}
      />
    </div>
  )
}
