"use client"
import { useEffect, useRef } from "react"

export function ShaderBg({
  className = "",
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") as WebGLRenderingContext | null
    if (!gl) return

    /* ── Vertex Shader ── */
    const vsSource = `
      attribute vec2 aPosition;
      varying vec2 vUV;
      void main() {
        vUV = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `

    /* ── Fragment Shader: gradient noise + animated orbs + ripple ── */
    const fsSource = `
      precision lowp float;
      varying vec2 vUV;
      uniform float uTime;
      uniform vec2  uMouse;
      uniform vec2  uResolution;

      /* Simple hash noise */
      float hash(vec2 p) {
        p = fract(p * vec2(234.34, 435.345));
        p += dot(p, p + 34.23);
        return fract(p.x * p.y);
      }

      /* Smooth value noise */
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i+vec2(1,0)), f.x),
          mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x),
          f.y
        );
      }

      /* Fractal noise (fbm) */
      float fbm(vec2 p) {
        float v = 0.0; float a = 0.5;
        for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p  = p * 2.1 + vec2(1.3, 0.7);
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = vUV;
        vec2 asp = vec2(uResolution.x / uResolution.y, 1.0);

        /* Animated noise field */
        float t = uTime * 0.12;
        vec2 p1 = uv * asp * 2.5 + vec2(t * 0.3, t * 0.2);
        vec2 p2 = uv * asp * 1.8 + vec2(-t * 0.15, t * 0.25);
        float n1 = fbm(p1);
        float n2 = fbm(p2 + n1 * 0.8);

        /* Base gradient: warm ivory → soft cream */
        vec3 colA = vec3(0.98, 0.97, 0.94);   /* near-white ivory */
        vec3 colB = vec3(0.94, 0.91, 0.85);   /* warm cream */
        vec3 colC = vec3(0.90, 0.87, 0.80);   /* deeper cream */
        float blend = n1 * 0.5 + n2 * 0.5;
        vec3 base = mix(colA, mix(colB, colC, n2), blend * 0.6);

        /* Floating orbs (screen blend) */
        vec2 mouse = uMouse / uResolution;
        for (int i = 0; i < 4; i++) {
          float fi = float(i);
          vec2 orbPos = vec2(
            0.2 + 0.6 * fract(fi * 0.37 + 0.1 + sin(uTime * 0.05 + fi) * 0.08),
            0.15 + 0.7 * fract(fi * 0.53 + 0.3 + cos(uTime * 0.07 + fi) * 0.06)
          );
          float dist = length((uv - orbPos) * asp);
          float r    = 0.08 + 0.04 * sin(uTime * 0.3 + fi);
          float orb  = smoothstep(r, 0.0, dist) * 0.06;
          vec3 orbCol= fi < 2.0 ? vec3(0.78, 0.66, 0.44) : vec3(0.76, 0.82, 0.95);
          base += orbCol * orb;
        }

        /* Mouse ripple distortion */
        vec2 toMouse = uv - mouse;
        float mdist  = length(toMouse * asp);
        float ripple = sin(mdist * 28.0 - uTime * 3.0) * exp(-mdist * 8.0) * 0.008;
        base += ripple;

        /* Vignette */
        float vig = 1.0 - length((uv - 0.5) * 1.2);
        base *= 0.88 + vig * 0.14;

        gl_FragColor = vec4(base, 1.0);
      }
    `

    /* ── Compile shaders ── */
    const compileShader = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }

    const vs  = compileShader(gl.VERTEX_SHADER,   vsSource)
    const fs  = compileShader(gl.FRAGMENT_SHADER, fsSource)
    const prg = gl.createProgram()!
    gl.attachShader(prg, vs)
    gl.attachShader(prg, fs)
    gl.linkProgram(prg)
    gl.useProgram(prg)

    /* ── Fullscreen quad ── */
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prg, "aPosition")
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uTime       = gl.getUniformLocation(prg, "uTime")
    const uMouse      = gl.getUniformLocation(prg, "uMouse")
    const uResolution = gl.getUniformLocation(prg, "uResolution")

    let W = 0, H = 0
    let mx = 0, my = 0
    let animId: number
    let startTime = performance.now()

    const resize = () => {
      W = canvas.clientWidth; H = canvas.clientHeight
      canvas.width = W; canvas.height = H
      gl.viewport(0, 0, W, H)
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement || document.body)

    const onMouse = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
    }
    window.addEventListener("mousemove", onMouse)

    let lastFrame = 0
    const TARGET_FPS = 60
    const FRAME_MS   = 1000 / TARGET_FPS

    const loop = (ts: number) => {
      animId = requestAnimationFrame(loop)
      if (ts - lastFrame < FRAME_MS * 0.9) return
      lastFrame = ts

      const t = (ts - startTime) / 1000
      gl.uniform1f(uTime, t)
      gl.uniform2f(uMouse, mx, H - my)
      gl.uniform2f(uResolution, W, H)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    animId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      window.removeEventListener("mousemove", onMouse)
      gl.deleteProgram(prg)
      gl.deleteBuffer(buf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display:"block", width:"100%", height:"100%", ...style }}
    />
  )
}
