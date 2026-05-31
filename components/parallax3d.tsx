"use client"
import { useEffect, useRef, useCallback } from "react"

interface Shape {
  x: number; y: number; size: number; depth: number
  type: "circle" | "hexagon" | "diamond"
  color: string; speed: number
}

export function Parallax3D({
  className = "",
  style,
  children,
}: {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const mouseRef     = useRef({ x: 0, y: 0, dx: 0, dy: 0 })
  const targetRef    = useRef({ x: 0, y: 0 })
  const rafRef       = useRef<number>()

  /* Generate shapes on 5 depth layers */
  const shapesRef = useRef<Shape[]>([])
  useEffect(() => {
    const colors = [
      "rgba(200,168,112,",  // gold
      "rgba(255,255,255,",  // white
      "rgba(68,136,255,",   // blue
      "rgba(180,160,130,",  // stone
    ]
    const shapes: Shape[] = []
    for (let d = 1; d <= 5; d++) {
      const count = 4 + d * 2
      for (let i = 0; i < count; i++) {
        shapes.push({
          x:     Math.random() * 100,
          y:     Math.random() * 100,
          size:  8 + Math.random() * 40 * (1 / d),
          depth: d,
          type: (["circle","hexagon","diamond"] as const)[Math.floor(Math.random() * 3)],
          color: colors[Math.floor(Math.random() * colors.length)],
          speed: 0.05 + Math.random() * 0.08,
        })
      }
    }
    shapesRef.current = shapes
  }, [])

  const drawHexagon = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 6
      if (i === 0) ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
      else          ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
    }
    ctx.closePath()
  }

  const drawDiamond = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
    ctx.beginPath()
    ctx.moveTo(cx, cy - r)
    ctx.lineTo(cx + r * 0.6, cy)
    ctx.lineTo(cx, cy + r)
    ctx.lineTo(cx - r * 0.6, cy)
    ctx.closePath()
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)

    /* Smooth lerp mouse */
    const mx = mouseRef.current, tg = targetRef.current
    mx.dx = tg.x - mx.x
    mx.dy = tg.y - mx.y
    mx.x += mx.dx * 0.06
    mx.y += mx.dy * 0.06

    const normX = (mx.x / W - 0.5) * 2   // -1 … 1
    const normY = (mx.y / H - 0.5) * 2

    shapesRef.current.forEach(s => {
      /* Depth multiplier: depth 1 moves most, depth 5 least */
      const factor = (6 - s.depth) * 18
      const ox = normX * factor
      const oy = normY * factor

      const px = (s.x / 100) * W + ox
      const py = (s.y / 100) * H + oy

      /* Opacity and blur based on depth */
      const alpha = 0.04 + (6 - s.depth) * 0.04
      const blur  = (s.depth - 1) * 3

      ctx.save()
      if (blur > 0) ctx.filter = `blur(${blur}px)`

      /* Glassmorphism fill */
      ctx.fillStyle = `${s.color}${alpha})`
      ctx.strokeStyle = `${s.color}${alpha * 3})`
      ctx.lineWidth = 1

      if (s.type === "circle") {
        ctx.beginPath()
        ctx.arc(px, py, s.size, 0, Math.PI * 2)
      } else if (s.type === "hexagon") {
        drawHexagon(ctx, px, py, s.size)
      } else {
        drawDiamond(ctx, px, py, s.size)
      }
      ctx.fill()
      ctx.stroke()

      /* Inner highlight */
      const grad = ctx.createRadialGradient(px - s.size * 0.3, py - s.size * 0.3, 0, px, py, s.size)
      grad.addColorStop(0, `${s.color}0.12)`)
      grad.addColorStop(1, `${s.color}0.0)`)
      ctx.fillStyle = grad
      ctx.fill()

      ctx.restore()
    })

    rafRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    const canvas    = canvasRef.current
    if (!canvas || !container) return

    const resize = () => {
      canvas.width  = container.clientWidth
      canvas.height = container.clientHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      targetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }
    container.addEventListener("mousemove", onMove)

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      ro.disconnect()
      container.removeEventListener("mousemove", onMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [draw])

  return (
    <div ref={containerRef} className={className} style={{ position:"relative", overflow:"hidden", ...style }}>
      {/* Perspective wrapper for CSS 3D layers */}
      <div style={{ position:"absolute", inset:0, perspective:"1000px", perspectiveOrigin:"50% 50%" }}>
        <canvas
          ref={canvasRef}
          style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}
        />
      </div>
      {/* Content sits above */}
      <div style={{ position:"relative", zIndex:10 }}>
        {children}
      </div>
    </div>
  )
}
