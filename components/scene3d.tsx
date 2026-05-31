"use client"
import { useEffect, useRef } from "react"

export function Scene3D({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let animId: number
    const canvas = canvasRef.current
    if (!canvas) return

    // Dynamically import Three.js
    import("three").then((THREE) => {
      const W = canvas.clientWidth
      const H = canvas.clientHeight

      // Renderer
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setClearColor(0x000000, 0)

      // Scene & Camera
      const scene  = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100)
      camera.position.set(0, 0, 5)

      // ── Ambient + point lights ──
      scene.add(new THREE.AmbientLight(0xffeedd, 0.4))
      const goldLight = new THREE.PointLight(0xc9933a, 2, 20)
      goldLight.position.set(3, 3, 3)
      scene.add(goldLight)
      const turqLight = new THREE.PointLight(0x2e8b82, 1.5, 20)
      turqLight.position.set(-3, -2, 2)
      scene.add(turqLight)

      // ── 1. Dodecahedron (main floating shape) ──
      const dodecGeo  = new THREE.DodecahedronGeometry(1.1, 0)
      const dodecMat  = new THREE.MeshStandardMaterial({
        color: 0x1a2744,
        metalness: 0.9,
        roughness: 0.15,
        emissive: 0x0a1020,
        emissiveIntensity: 0.3,
      })
      const dodec = new THREE.Mesh(dodecGeo, dodecMat)
      scene.add(dodec)

      // Wireframe overlay on dodecahedron
      const dodecWire = new THREE.LineSegments(
        new THREE.WireframeGeometry(dodecGeo),
        new THREE.LineBasicMaterial({ color: 0xc9933a, opacity: 0.45, transparent: true })
      )
      dodec.add(dodecWire)

      // ── 2. Toroidal knot (gold ring) ──
      const torusGeo = new THREE.TorusKnotGeometry(0.55, 0.14, 120, 18, 3, 5)
      const torusMat = new THREE.MeshStandardMaterial({
        color: 0xc9933a,
        metalness: 1.0,
        roughness: 0.05,
        emissive: 0x4a2800,
        emissiveIntensity: 0.4,
      })
      const torus = new THREE.Mesh(torusGeo, torusMat)
      torus.position.set(2.6, 0.8, -0.5)
      torus.scale.setScalar(0.85)
      scene.add(torus)

      // ── 3. Octahedron with girih texture ──
      const octaGeo  = new THREE.OctahedronGeometry(0.7, 0)
      const octaMat  = new THREE.MeshStandardMaterial({
        color: 0x2e8b82,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x0a2a28,
        emissiveIntensity: 0.5,
        wireframe: false,
      })
      const octa = new THREE.Mesh(octaGeo, octaMat)
      octa.position.set(-2.4, -0.6, 0)
      scene.add(octa)
      const octaWire = new THREE.LineSegments(
        new THREE.WireframeGeometry(octaGeo),
        new THREE.LineBasicMaterial({ color: 0x2e8b82, opacity: 0.6, transparent: true })
      )
      octa.add(octaWire)

      // ── 4. Small icosahedrons scattered ──
      const smallMat = new THREE.MeshStandardMaterial({
        color: 0xf5d08a, metalness: 0.9, roughness: 0.1,
        emissive: 0x3a2000, emissiveIntensity: 0.3,
      })
      const smalls: THREE.Mesh[] = []
      const smallPositions = [
        [-1.6, 1.8, -1.0],
        [ 1.2,-1.6, -0.5],
        [-2.2, 1.0,  0.5],
        [ 2.0,-1.2,  0.8],
        [ 0.0, 2.2, -0.8],
      ]
      smallPositions.forEach(([x, y, z]) => {
        const geo  = new THREE.IcosahedronGeometry(0.22, 0)
        const mesh = new THREE.Mesh(geo, smallMat)
        mesh.position.set(x, y, z)
        scene.add(mesh)
        smalls.push(mesh)
      })

      // ── 5. Particle system — crescent+star shape ──
      const particleCount = 600
      const positions = new Float32Array(particleCount * 3)
      for (let i = 0; i < particleCount; i++) {
        const t     = (i / particleCount) * Math.PI * 2
        const layer = Math.floor(i / 120)
        let r = 1.8 + layer * 0.3 + (Math.random() - 0.5) * 0.4
        // Crescent: cut right side
        const angle = t
        let x = r * Math.cos(angle)
        let y = r * Math.sin(angle)
        // Thin out the right crescent half
        if (x > 0.3 && Math.random() > 0.25) {
          x *= 0.2; y *= 0.6
          r  = 0.4 + Math.random() * 0.3
        }
        positions[i * 3]     = x + (Math.random() - 0.5) * 0.15
        positions[i * 3 + 1] = y + (Math.random() - 0.5) * 0.15
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.6
      }
      const pGeo = new THREE.BufferGeometry()
      pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
      const pMat = new THREE.PointsMaterial({
        color: 0xc9933a, size: 0.025, transparent: true, opacity: 0.7,
        sizeAttenuation: true,
      })
      const particles = new THREE.Points(pGeo, pMat)
      particles.position.set(0, 0, -2.5)
      scene.add(particles)

      // ── 6. Axis ring (Uzbek circle) ──
      const ringGeo = new THREE.TorusGeometry(1.55, 0.012, 8, 80)
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xc9933a, transparent: true, opacity: 0.25 })
      const ring1   = new THREE.Mesh(ringGeo, ringMat)
      scene.add(ring1)
      const ring2   = new THREE.Mesh(
        new THREE.TorusGeometry(1.75, 0.008, 8, 80),
        new THREE.MeshBasicMaterial({ color: 0x2e8b82, transparent: true, opacity: 0.15 })
      )
      scene.add(ring2)

      // Mouse interaction
      let mouseX = 0, mouseY = 0
      const onMouse = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth  - 0.5) * 2
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2
      }
      window.addEventListener("mousemove", onMouse)

      // Resize
      const onResize = () => {
        const w = canvas.clientWidth
        const h = canvas.clientHeight
        renderer.setSize(w, h)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }
      window.addEventListener("resize", onResize)

      // ── Animation loop ──
      let t = 0
      const animate = () => {
        animId = requestAnimationFrame(animate)
        t += 0.008

        // Camera gentle sway
        camera.position.x += (mouseX * 0.6 - camera.position.x) * 0.04
        camera.position.y += (-mouseY * 0.4 - camera.position.y) * 0.04
        camera.lookAt(0, 0, 0)

        // Dodecahedron rotate
        dodec.rotation.x = t * 0.35
        dodec.rotation.y = t * 0.45

        // Torus knot orbit + spin
        torus.rotation.x = t * 0.6
        torus.rotation.y = t * 0.4
        torus.position.x = 2.6 * Math.cos(t * 0.18)
        torus.position.z = 2.6 * Math.sin(t * 0.18) - 0.5

        // Octahedron spin
        octa.rotation.x = t * 0.5
        octa.rotation.z = t * 0.3
        octa.position.y = -0.6 + Math.sin(t * 0.7) * 0.3

        // Smalls orbit
        smalls.forEach((s, i) => {
          s.rotation.x = t * (0.8 + i * 0.1)
          s.rotation.y = t * (0.6 + i * 0.12)
          const phase = t * 0.4 + i * 1.2
          s.position.y = smallPositions[i][1] + Math.sin(phase) * 0.2
          s.position.x = smallPositions[i][0] + Math.cos(phase * 0.7) * 0.15
        })

        // Particles slowly rotate
        particles.rotation.z = t * 0.06

        // Rings rotate
        ring1.rotation.x = t * 0.12
        ring1.rotation.y = t * 0.08
        ring2.rotation.x = -t * 0.09
        ring2.rotation.z = t * 0.11

        // Gold light pulse
        goldLight.intensity = 1.8 + Math.sin(t * 1.2) * 0.5
        turqLight.intensity = 1.2 + Math.cos(t * 0.9) * 0.4

        renderer.render(scene, camera)
      }
      animate()

      return () => {
        window.removeEventListener("mousemove", onMouse)
        window.removeEventListener("resize", onResize)
        cancelAnimationFrame(animId)
        renderer.dispose()
      }
    })

    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  )
}
