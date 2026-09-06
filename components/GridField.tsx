'use client'

import { useEffect, useRef } from 'react'

const MINOR = 34
const MAJOR = MINOR * 5
const PARALLAX = 14

/**
 * The viewport grid behind the hero.
 *
 * Canvas 2D rather than WebGL on purpose: it is a few hundred hairlines, it
 * costs nothing, and there is no context-loss or no-GPU path to fall back to.
 * Motion is a slow drift plus an eased parallax toward the cursor; both stop
 * dead under prefers-reduced-motion, which leaves a clean static grid.
 */
export function GridField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let raf = 0
    let start = performance.now()

    // Target offset follows the pointer; current eases toward it.
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    function resize() {
      if (!canvas) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function handlePointer(event: PointerEvent) {
      if (reduceMotion) return
      targetX = (event.clientX / window.innerWidth - 0.5) * -2 * PARALLAX
      targetY = (event.clientY / window.innerHeight - 0.5) * -2 * PARALLAX
    }

    function line(x1: number, y1: number, x2: number, y2: number) {
      ctx?.moveTo(x1, y1)
      ctx?.lineTo(x2, y2)
    }

    function draw(now: number) {
      if (!ctx) return
      const drift = reduceMotion ? 0 : ((now - start) / 1000) * 3

      currentX += (targetX - currentX) * 0.06
      currentY += (targetY - currentY) * 0.06

      const offsetX = ((currentX + drift) % MAJOR) - MAJOR
      const offsetY = ((currentY + drift * 0.6) % MAJOR) - MAJOR

      ctx.clearRect(0, 0, width, height)
      ctx.lineWidth = 1

      // Minor grid
      ctx.strokeStyle = 'rgba(232, 230, 225, 0.035)'
      ctx.beginPath()
      for (let x = offsetX; x < width + MAJOR; x += MINOR) line(x, 0, x, height)
      for (let y = offsetY; y < height + MAJOR; y += MINOR) line(0, y, width, y)
      ctx.stroke()

      // Major grid
      ctx.strokeStyle = 'rgba(232, 230, 225, 0.075)'
      ctx.beginPath()
      for (let x = offsetX; x < width + MAJOR; x += MAJOR) line(x, 0, x, height)
      for (let y = offsetY; y < height + MAJOR; y += MAJOR) line(0, y, width, y)
      ctx.stroke()

      // Crosshair ticks at major intersections — the detail that makes it read
      // as a viewport rather than graph paper.
      ctx.strokeStyle = 'rgba(70, 224, 176, 0.16)'
      ctx.beginPath()
      for (let x = offsetX; x < width + MAJOR; x += MAJOR) {
        for (let y = offsetY; y < height + MAJOR; y += MAJOR) {
          line(x - 3, y, x + 3, y)
          line(x, y - 3, x, y + 3)
        }
      }
      ctx.stroke()

      raf = window.requestAnimationFrame(draw)
    }

    resize()
    start = performance.now()
    raf = window.requestAnimationFrame(draw)

    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', handlePointer, { passive: true })

    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', handlePointer)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{
        maskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, #000 30%, transparent 82%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, #000 30%, transparent 82%)',
      }}
    />
  )
}
