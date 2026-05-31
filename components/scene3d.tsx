"use client"
import { useEffect, useRef } from "react"

interface Scene3DProps {
  className?: string
  style?: React.CSSProperties
  /** "hero" = dark bg TorusKnot + particles, "dashboard" = lighter minimal */
  variant?: "hero" | "dashboard"
}

export function Scene3D({ className = "", style, variant = "hero" }: Scene3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mountRef  = useRef(false)

  useEffect(() => {
    if (mountRef.current) return
    mountRef.current = true

    const canvas = canvasRef.current
    if (!canvas) return

    let renderer: any, scene: any, camera: any, animId: number
    let torusKnot: any, particles: any, ring1: any, ring2: any
    let pointLight1: any, pointLight2: any
    let mouseX = 0, mouseY = 0
    let clock: any

    const load = async () => {
      const THREE = await import("three")

      const W = canvas.clientWidth  || 800
      const H = canvas.clientHeight || 600

      /* ── Renderer ── */
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setClearColor(0x000000, variant === "hero" ? 1 : 0)
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.2
      renderer.shadowMap.enabled = true

      scene  = new THREE.Scene()
      clock  = new THREE.Clock()

      camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100)
      camera.position.set(0, 0, 7)

      /* ── Dark hero background ── */
      if (variant === "hero") {
        scene.background = new THREE.Color(0x080604)
        scene.fog = new THREE.FogExp2(0x080604, 0.025)
      }

      /* ── Lights ── */
      scene.add(new THREE.AmbientLight(0xfff8e8, variant === "hero" ? 0.3 : 0.6))

      const dirLight = new THREE.DirectionalLight(0xfff8e8, variant === "hero" ? 1.2 : 0.8)
      dirLight.position.set(5, 8, 5)
      dirLight.castShadow = true
      scene.add(dirLight)

      // Blue accent glow (bottom)
      pointLight1 = new THREE.PointLight(0x0066ff, 2.5, 12)
      pointLight1.position.set(0, -3, 1)
      scene.add(pointLight1)

      // Gold accent
      pointLight2 = new THREE.PointLight(0xc8a870, variant === "hero" ? 2 : 1, 10)
      pointLight2.position.set(3, 3, 2)
      scene.add(pointLight2)

      // Rim light
      const rimLight = new THREE.PointLight(0x4488ff, 1.5, 15)
      rimLight.position.set(-5, 2, -3)
      scene.add(rimLight)

      /* ── Central TorusKnot ── */
      const torusGeo = new THREE.TorusKnotGeometry(1.6, 0.42, 180, 24, 3, 5)
      const torusMat = new THREE.MeshPhysicalMaterial({
        color:            0xd4c0a0,
        metalness:        0.92,
        roughness:        0.08,
        envMapIntensity:  1.8,
        clearcoat:        1.0,
        clearcoatRoughness: 0.05,
        iridescence:      variant === "hero" ? 0.6 : 0.3,
        iridescenceIOR:   1.5,
        reflectivity:     1.0,
        transmission:     0,
      } as any)
      torusKnot = new THREE.Mesh(torusGeo, torusMat)
      torusKnot.castShadow = true
      scene.add(torusKnot)

      /* ── Wireframe overlay on knot ── */
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0xc8a870, wireframe: true,
        transparent: true, opacity: variant === "hero" ? 0.06 : 0.04,
      })
      const wireKnot = new THREE.Mesh(torusGeo, wireMat)
      wireKnot.scale.setScalar(1.005)
      scene.add(wireKnot)

      /* ── Surrounding rings ── */
      const ringGeo1 = new THREE.TorusGeometry(2.8, 0.018, 8, 120)
      ring1 = new THREE.Mesh(ringGeo1, new THREE.MeshBasicMaterial({
        color: 0xc8a870, transparent: true, opacity: 0.35,
      }))
      ring1.rotation.x = Math.PI / 3
      scene.add(ring1)

      const ringGeo2 = new THREE.TorusGeometry(3.4, 0.012, 8, 120)
      ring2 = new THREE.Mesh(ringGeo2, new THREE.MeshBasicMaterial({
        color: 0x4488ff, transparent: true, opacity: 0.2,
      }))
      ring2.rotation.x = -Math.PI / 4
      ring2.rotation.y = Math.PI / 6
      scene.add(ring2)

      /* ── Star / dust particles ── */
      if (variant === "hero") {
        const pCount = 5000
        const pPos   = new Float32Array(pCount * 3)
        const pSizes = new Float32Array(pCount)
        for (let i = 0; i < pCount; i++) {
          const r = 10 + Math.random() * 40
          const theta = Math.random() * Math.PI * 2
          const phi   = Math.acos(Math.random() * 2 - 1)
          pPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
          pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
          pPos[i * 3 + 2] = r * Math.cos(phi)
          pSizes[i] = 0.6 + Math.random() * 1.2
        }
        const pGeo = new THREE.BufferGeometry()
        pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3))
        pGeo.setAttribute("size",     new THREE.BufferAttribute(pSizes, 1))
        particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
          color: 0xfff8e8, size: 0.04, transparent: true,
          opacity: 0.65, sizeAttenuation: true,
        }))
        scene.add(particles)

        /* Closer floating octahedra */
        for (let i = 0; i < 8; i++) {
          const g = new THREE.OctahedronGeometry(0.15 + Math.random() * 0.2, 0)
          const m = new THREE.MeshPhysicalMaterial({
            color: i % 2 === 0 ? 0xc8a870 : 0x4488ff,
            metalness: 0.9, roughness: 0.1,
            transparent: true, opacity: 0.7,
          })
          const mesh = new THREE.Mesh(g, m)
          const a = (i / 8) * Math.PI * 2
          mesh.position.set(Math.cos(a) * 4.5, Math.sin(a * 0.7) * 1.8, Math.sin(a) * 2)
          mesh.userData.phase = a
          scene.add(mesh)
        }
      }

      /* ── Resize ── */
      const onResize = () => {
        const w = canvas.clientWidth, h = canvas.clientHeight
        renderer.setSize(w, h)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }
      window.addEventListener("resize", onResize)

      /* ── Mouse ── */
      const onMouse = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth  - 0.5) * 2
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2
      }
      window.addEventListener("mousemove", onMouse)

      /* ── Scroll scale ── */
      const onScroll = () => {
        const s = 1 + window.scrollY / window.innerHeight * 0.4
        torusKnot.scale.setScalar(Math.min(1.3, s))
      }
      window.addEventListener("scroll", onScroll)

      /* ── Animation loop ── */
      const t0 = clock.getElapsedTime()
      const animate = () => {
        animId = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()
        const dt = t - t0

        /* Knot Y-axis rotation (autoRotate) */
        torusKnot.rotation.y = t * 0.22
        torusKnot.rotation.x = t * 0.08
        wireKnot.rotation.copy(torusKnot.rotation)

        /* Camera follows mouse gently */
        camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.04
        camera.position.y += (-mouseY * 0.8 - camera.position.y) * 0.04
        camera.lookAt(0, 0, 0)

        /* Rings orbit */
        ring1.rotation.z = t * 0.15
        ring2.rotation.z = -t * 0.12
        ring2.rotation.y = t * 0.08

        /* Pulsing lights */
        pointLight1.intensity = 2.5 + Math.sin(t * 1.6) * 0.8
        pointLight2.intensity = 2.0 + Math.cos(t * 1.2) * 0.6

        /* Particles slow drift */
        if (particles) particles.rotation.y = t * 0.012

        /* Floating octahedra orbit */
        scene.children.forEach((child: any) => {
          if (child.userData.phase !== undefined) {
            const ph = child.userData.phase
            child.position.x = Math.cos(ph + t * 0.35) * 4.5
            child.position.y = Math.sin(ph * 0.7 + t * 0.28) * 1.8
            child.rotation.x = t * 0.8
            child.rotation.z = t * 0.5
          }
        })

        renderer.render(scene, camera)
      }
      animate()

      return () => {
        window.removeEventListener("resize", onResize)
        window.removeEventListener("mousemove", onMouse)
        window.removeEventListener("scroll", onScroll)
        cancelAnimationFrame(animId)
        renderer.dispose()
      }
    }

    const cleanup = load()
    return () => { cleanup.then(fn => fn?.()) }
  }, [variant])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%", ...style }}
    />
  )
}
