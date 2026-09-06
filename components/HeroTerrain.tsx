'use client'

import { useEffect, useRef } from 'react'
import { COLS, ROWS, project } from '@/lib/terrain'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

const MAX_DPR = 1.5

/**
 * Ambient wireframe terrain behind the hero. It drifts and parallaxes toward
 * the cursor and never does anything else — the build sequence below has its
 * own opaque ground, so this ends where the hero ends.
 */
export function HeroTerrain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduceMotion = usePrefersReducedMotion()

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

    function draw(now: number) {
      if (!ctx) return

      const t = reduceMotion ? 8 : (now - started) / 1000
      panX += (targetPanX - panX) * 0.05
      panY += (targetPanY - panY) * 0.05

      const geo = project(width, height, t * 0.5, panX, panY)

      ctx.clearRect(0, 0, width, height)

      // Horizon glow, under the lines.
      const glowTop = geo.horizon - height * 0.3
      const glow = ctx.createLinearGradient(0, glowTop, 0, geo.horizon + height * 0.05)
      glow.addColorStop(0, 'rgba(70,224,176,0)')
      glow.addColorStop(0.75, 'rgba(70,224,176,0.05)')
      glow.addColorStop(1, 'rgba(70,224,176,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, glowTop, width, height * 0.35 + 2)

      ctx.lineWidth = 1

      for (let j = 0; j < ROWS; j++) {
        const fade = 1 - geo.depth[j * COLS] * 0.92
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

      ctx.strokeStyle = 'rgba(150,214,196,0.14)'
      ctx.beginPath()
      for (let i = 0; i < COLS; i += 2) {
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
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 38%, rgba(0,0,0,0.55) 100%)',
        }}
      />
    </div>
  )
}
