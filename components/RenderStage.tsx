'use client'

import { useEffect, useId, useRef } from 'react'
import { COLS, ROWS, SPACING_X, SPACING_Z, project, quadShade, stageMix } from '@/lib/terrain'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

const BG = { r: 11, g: 12, b: 14 }
const MAX_DPR = 1.5

/**
 * One fixed canvas sitting behind the hero and the pipeline section.
 *
 * The hero shows stage 0 — pure wireframe, drifting. Scrolling through
 * #pipeline scrubs the same terrain through the raster stages until it resolves
 * into a finished frame. Sections after the pipeline are opaque and simply
 * scroll over the top, so nothing has to be faded out by hand.
 *
 * The post-processing (vignette, grain, copy scrim) lives in compositor-only
 * DOM layers rather than in the draw loop. Doing those three full-canvas fills
 * per frame cost about 19fps at the end of the sequence; as opacity on a
 * promoted layer they cost nothing.
 */
export function RenderStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scrimRef = useRef<HTMLDivElement>(null)
  const vignetteRef = useRef<HTMLDivElement>(null)
  const grainRef = useRef<HTMLDivElement>(null)
  const reduceMotion = usePrefersReducedMotion()
  const grainFilterId = `${useId()}-grain`.replace(/:/g, '')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let raf = 0
    const started = performance.now()

    let targetPanX = 0
    let targetPanY = 0
    let panX = 0
    let panY = 0

    function resize() {
      if (!canvas || !ctx) return
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function onPointer(event: PointerEvent) {
      if (reduceMotion) return
      targetPanX = event.clientX / window.innerWidth - 0.5
      targetPanY = event.clientY / window.innerHeight - 0.5
    }

    /** Sequence progress, read straight off the pipeline section's position. */
    function progress() {
      const section = document.getElementById('pipeline')
      if (!section) return 0
      const rect = section.getBoundingClientRect()
      const travel = rect.height - window.innerHeight
      if (travel <= 0) return rect.top <= 0 ? 1 : 0
      return Math.min(1, Math.max(0, -rect.top / travel))
    }

    function setLayer(node: HTMLDivElement | null, value: number) {
      if (!node) return
      const next = value.toFixed(3)
      if (node.style.opacity !== next) node.style.opacity = next
    }

    function draw(now: number) {
      if (!ctx) return

      const t = reduceMotion ? 12 : (now - started) / 1000
      const p = reduceMotion ? 1 : progress()
      const mix = stageMix(p)

      panX += (targetPanX - panX) * 0.05
      panY += (targetPanY - panY) * 0.05

      const geo = project(width, height, t * 0.5, panX, panY)

      ctx.clearRect(0, 0, width, height)

      // ── Horizon glow, drawn first so the terrain occludes it ─────────────
      const glowTop = geo.horizon - height * 0.3
      const glow = ctx.createLinearGradient(0, glowTop, 0, geo.horizon + height * 0.05)
      glow.addColorStop(0, 'rgba(70,224,176,0)')
      glow.addColorStop(0.75, `rgba(70,224,176,${0.045 + mix.post * 0.03})`)
      glow.addColorStop(1, 'rgba(70,224,176,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, glowTop, width, height * 0.35 + 2)

      // ── Fill pass: painter's algorithm, far row first ────────────────────
      if (mix.fill > 0.01) {
        ctx.lineJoin = 'round'
        ctx.lineWidth = 1

        for (let j = ROWS - 2; j >= 0; j--) {
          for (let i = 0; i < COLS - 1; i++) {
            const k = j * COLS + i
            const depth = geo.depth[k]

            // Flat grey before lighting arrives, lambert after.
            const lambert = quadShade(geo.wy, i, j, SPACING_X, SPACING_Z)
            const flat = 0.085 + (1 - depth) * 0.05
            const lit = 0.012 + Math.pow(lambert, 1.6) * 0.6
            const shade = flat + (lit - flat) * mix.lighting

            let r = shade * 168
            let g = shade * 196
            let b = shade * 186

            if (mix.fog > 0.01) {
              const fog = depth * depth * mix.fog * 0.92
              r += (BG.r - r) * fog
              g += (BG.g - g) * fog
              b += (BG.b - b) * fog
            }

            // Fill and stroke with the same colour: canvas antialiases each
            // path edge independently, so adjacent fills leave hairline seams
            // that read as an unwanted grid once the wireframe has gone.
            const color = `rgba(${r | 0},${g | 0},${b | 0},${mix.fill})`
            ctx.fillStyle = color
            ctx.strokeStyle = color
            ctx.beginPath()
            ctx.moveTo(geo.sx[k], geo.sy[k])
            ctx.lineTo(geo.sx[k + 1], geo.sy[k + 1])
            ctx.lineTo(geo.sx[k + COLS + 1], geo.sy[k + COLS + 1])
            ctx.lineTo(geo.sx[k + COLS], geo.sy[k + COLS])
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
          }
        }
      }

      // ── Wireframe pass ───────────────────────────────────────────────────
      if (mix.wireframe > 0.01) {
        ctx.lineWidth = 1

        for (let j = 0; j < ROWS; j++) {
          const fade = (1 - geo.depth[j * COLS] * 0.92) * mix.wireframe
          if (fade <= 0.01) continue
          ctx.strokeStyle = `rgba(150,214,196,${fade * 0.34})`
          ctx.beginPath()
          for (let i = 0; i < COLS; i++) {
            const k = j * COLS + i
            if (i === 0) ctx.moveTo(geo.sx[k], geo.sy[k])
            else ctx.lineTo(geo.sx[k], geo.sy[k])
          }
          ctx.stroke()
        }

        ctx.strokeStyle = `rgba(150,214,196,${mix.wireframe * 0.14})`
        ctx.beginPath()
        for (let i = 0; i < COLS; i += 2) {
          for (let j = 0; j < ROWS; j++) {
            const k = j * COLS + i
            if (j === 0) ctx.moveTo(geo.sx[k], geo.sy[k])
            else ctx.lineTo(geo.sx[k], geo.sy[k])
          }
        }
        ctx.stroke()
      }

      setLayer(scrimRef.current, mix.fill * 0.85)
      setLayer(vignetteRef.current, mix.post)
      setLayer(grainRef.current, mix.post * 0.28)

      if (!reduceMotion) raf = window.requestAnimationFrame(draw)
    }

    resize()
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
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <canvas ref={canvasRef} className="h-full w-full" />

      {/* Copy scrim — the sequence caption sits bottom-left over whatever the
          terrain happens to be doing there, so its contrast is guaranteed here
          rather than left to chance. */}
      <div
        ref={scrimRef}
        className="absolute inset-0 opacity-0"
        style={{
          background:
            'linear-gradient(to top, rgba(11,12,14,0.78) 0%, rgba(11,12,14,0.35) 34%, rgba(11,12,14,0) 62%)',
        }}
      />

      <div
        ref={vignetteRef}
        className="absolute inset-0 opacity-0"
        style={{
          background:
            'radial-gradient(ellipse 74% 70% at 52% 42%, rgba(0,0,0,0) 22%, rgba(0,0,0,0.74) 100%)',
        }}
      />

      <div
        ref={grainRef}
        className="absolute inset-0 opacity-0 mix-blend-overlay"
        style={{ backgroundColor: 'white', filter: `url(#${grainFilterId})` }}
      />

      <svg width="0" height="0" className="absolute">
        <filter id={grainFilterId} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={3} stitchTiles="stitch" />
        </filter>
      </svg>
    </div>
  )
}
