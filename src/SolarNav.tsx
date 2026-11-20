import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export interface SolarItem {
  key: string
  name: string
  section: string
  desc: string
}

interface PlanetSpec extends SolarItem {
  orbit: number
  size: number
  speed: number
  color: string
  phase: number
  tilt: number
  kind: 'gas' | 'rock'
}

const PLANET_STYLES: Omit<PlanetSpec, keyof SolarItem>[] = [
  { orbit: 6.2, size: 0.85, speed: 0.34, color: '#149a89', phase: 0.4, tilt: 0.06, kind: 'rock' },
  { orbit: 8.6, size: 1.0, speed: 0.26, color: '#3d6fb4', phase: 1.9, tilt: -0.09, kind: 'gas' },
  { orbit: 11.2, size: 1.15, speed: 0.2, color: '#c98a3d', phase: 3.3, tilt: 0.04, kind: 'rock' },
  { orbit: 13.8, size: 0.95, speed: 0.16, color: '#7a58c0', phase: 4.6, tilt: -0.12, kind: 'gas' },
  { orbit: 16.4, size: 0.8, speed: 0.13, color: '#b84a6b', phase: 5.5, tilt: 0.08, kind: 'rock' },
]

/* ---------- 程序化纹理：Canvas 画出来的星球表面 ---------- */

/** 气态行星：流动云带 */
function makeGasTexture(hex: string): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 256
  const ctx = c.getContext('2d')!
  const base = new THREE.Color(hex)
  const hsl = { h: 0, s: 0, l: 0 }
  base.getHSL(hsl)

  for (let y = 0; y < 256; y++) {
    const t = y / 256
    const band =
      Math.sin(t * Math.PI * 7 + Math.sin(t * 13) * 0.9) * 0.085 +
      Math.sin(t * Math.PI * 17 + 1.2) * 0.03
    const l = Math.min(0.82, Math.max(0.08, hsl.l + band + 0.04))
    ctx.fillStyle = `hsl(${hsl.h * 360}, ${hsl.s * 100}%, ${l * 100}%)`
    ctx.fillRect(0, y, 512, 1)
  }
  // 横向气流条纹
  for (let i = 0; i < 700; i++) {
    const y = Math.random() * 256
    const x = Math.random() * 512
    const w = 30 + Math.random() * 90
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`
    ctx.fillRect(x, y, w, 1 + Math.random() * 1.6)
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.07})`
    ctx.fillRect(Math.random() * 512, y, w * 0.7, 1 + Math.random())
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** 岩石行星：斑驳地貌 + 陨石坑 */
function makeRockTexture(hex: string): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 256
  const ctx = c.getContext('2d')!
  const base = new THREE.Color(hex)
  const hsl = { h: 0, s: 0, l: 0 }
  base.getHSL(hsl)

  // 纵向明暗渐变（赤道亮、两极暗）
  for (let y = 0; y < 256; y++) {
    const t = Math.abs(y / 256 - 0.5) * 2
    const l = hsl.l + 0.07 - t * 0.09
    ctx.fillStyle = `hsl(${hsl.h * 360}, ${hsl.s * 100}%, ${l * 100}%)`
    ctx.fillRect(0, y, 512, 1)
  }
  // 地貌斑块
  for (let i = 0; i < 420; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 256
    const r = 4 + Math.random() * 26
    const dl = (Math.random() - 0.5) * 0.16
    ctx.fillStyle = `hsla(${hsl.h * 360}, ${hsl.s * 100}%, ${(hsl.l + dl) * 100}%, 0.5)`
    ctx.beginPath()
    ctx.ellipse(x, y, r, r * (0.5 + Math.random() * 0.6), Math.random() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }
  // 陨石坑：暗斑 + 亮边
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * 512
    const y = 20 + Math.random() * 216
    const r = 3 + Math.random() * 9
    ctx.fillStyle = `hsla(${hsl.h * 360}, ${hsl.s * 90}%, ${hsl.l * 55}%, 0.55)`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = `hsla(${hsl.h * 360}, ${hsl.s * 80}%, ${Math.min(85, hsl.l * 160)}%, 0.4)`
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.arc(x, y, r + 0.8, Math.PI * 1.1, Math.PI * 1.9)
    ctx.stroke()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** 柔光贴图（太阳辉光 / 星际尘埃用） */
function makeGlowTexture(hex: string): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 128)
  g.addColorStop(0, hex)
  g.addColorStop(0.35, hex + 'aa')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/* ---------- 菲涅尔大气辉光着色器 ---------- */
function makeAtmosphereMaterial(hex: string): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(hex) },
      uOpacity: { value: 0.7 },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vNormal = normalize(mat3(modelMatrix) * normal);
        vView = normalize(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.6);
        gl_FragColor = vec4(uColor, rim * uOpacity);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false,
  })
}

/**
 * SolarNav：深空导航太阳系。
 * 悬停行星 → 放大 + 跟随信息卡；点击 → 平滑滚动到对应版块。
 */
export function SolarNav({
  className = '',
  items,
  goLabel,
}: {
  className?: string
  items: SolarItem[]
  goLabel: string
}) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const labelsRef = useRef<{ items: SolarItem[]; goLabel: string }>({
    items,
    goLabel,
  })
  labelsRef.current = { items, goLabel }

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(
      46,
      mount.clientWidth / mount.clientHeight,
      0.1,
      300,
    )
    camera.position.set(0, 26, 26)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    // ---- 光照 ----
    const sunLight = new THREE.PointLight(0xffe0b0, 2.6, 0, 0)
    scene.add(sunLight)
    scene.add(new THREE.AmbientLight(0x8fa3bf, 0.5))

    // ---- 星空（两层错相微闪） ----
    const makeStars = (count: number, size: number, opacity: number) => {
      const pos = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) {
        const r = 70 + Math.random() * 60
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
        pos[i * 3 + 1] = r * Math.cos(phi) * 0.6
        pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      const mat = new THREE.PointsMaterial({
        color: '#cfe0ee',
        size,
        sizeAttenuation: false,
        transparent: true,
        opacity,
        depthWrite: false,
      })
      const pts = new THREE.Points(geo, mat)
      scene.add(pts)
      return mat
    }
    const starsA = makeStars(520, 1.6, 0.75)
    const starsB = makeStars(260, 2.2, 0.5)

    // ---- 太阳：核心 + 双层呼吸辉光 ----
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(2.55, 48, 32),
      new THREE.MeshBasicMaterial({ color: '#ffd98a' }),
    )
    scene.add(sun)

    const glowTex = makeGlowTexture('#ffb45e')
    const sunGlowA = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTex,
        color: '#ffb45e',
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    sunGlowA.scale.setScalar(11)
    scene.add(sunGlowA)
    const sunGlowB = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTex,
        color: '#ff9a3d',
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    sunGlowB.scale.setScalar(19)
    scene.add(sunGlowB)

    // ---- 行星 ----
    interface Planet {
      spec: PlanetSpec
      pivot: THREE.Group
      body: THREE.Group
      mesh: THREE.Mesh
      atmos: THREE.Mesh
      angle: number
      hover: number
    }
    const planets: Planet[] = []

    labelsRef.current.items.forEach((item, i) => {
      const spec: PlanetSpec = { ...item, ...PLANET_STYLES[i] }

      // 轨道面（各自微倾，摆脱机械同心圆）
      const orbitGroup = new THREE.Group()
      orbitGroup.rotation.x = spec.tilt
      scene.add(orbitGroup)

      const pivot = new THREE.Group()
      pivot.rotation.y = spec.phase
      orbitGroup.add(pivot)

      // 行星本体：程序化纹理
      const tex =
        spec.kind === 'gas'
          ? makeGasTexture(spec.color)
          : makeRockTexture(spec.color)
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(spec.size, 48, 32),
        new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.72,
          metalness: 0.08,
        }),
      )
      mesh.rotation.z = 0.15 + Math.random() * 0.2

      // 菲涅尔大气辉光壳
      const atmos = new THREE.Mesh(
        new THREE.SphereGeometry(spec.size * 1.16, 40, 28),
        makeAtmosphereMaterial(spec.color),
      )

      // 本体 + 大气打包成 body，悬停时整体缩放
      const body = new THREE.Group()
      body.add(mesh, atmos)
      body.position.x = spec.orbit
      pivot.add(body)

      // 轨道线
      const points: THREE.Vector3[] = []
      for (let k = 0; k <= 128; k++) {
        const a = (k / 128) * Math.PI * 2
        points.push(
          new THREE.Vector3(Math.cos(a) * spec.orbit, 0, Math.sin(a) * spec.orbit),
        )
      }
      const orbitLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({
          color: '#9db8cc',
          transparent: true,
          opacity: 0.16,
        }),
      )
      orbitGroup.add(orbitLine)

      planets.push({ spec, pivot, body, mesh, atmos, angle: spec.phase, hover: 0 })
    })

    // ---- 交互 ----
    const raycaster = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    let hovered: Planet | null = null
    let downAt: { x: number; y: number; t: number } | null = null

    const info = document.createElement('div')
    info.className = 'solar-info'
    info.style.display = 'none'
    mount.appendChild(info)

    const pick = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(ndc, camera)
      const hits = raycaster.intersectObjects(
        planets.map((p) => p.mesh),
        false,
      )
      if (hits.length > 0) {
        const mesh = hits[0].object as THREE.Mesh
        return planets.find((p) => p.mesh === mesh) ?? null
      }
      return null
    }

    const onPointerMove = (e: PointerEvent) => {
      hovered = pick(e)
      renderer.domElement.style.cursor = hovered ? 'pointer' : 'default'
    }

    const onPointerDown = (e: PointerEvent) => {
      downAt = { x: e.clientX, y: e.clientY, t: performance.now() }
    }

    const onPointerUp = (e: PointerEvent) => {
      if (
        downAt &&
        Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 6 &&
        performance.now() - downAt.t < 400
      ) {
        const target = pick(e)
        if (target) {
          const el = document.querySelector(target.spec.section)
          el?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })
        }
      }
      downAt = null
    }

    renderer.domElement.addEventListener('pointermove', onPointerMove)
    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointerup', onPointerUp)

    // ---- 动画 ----
    const worldPos = new THREE.Vector3()
    const clock = new THREE.Clock()
    let raf = 0

    const animate = () => {
      const dt = Math.min(clock.getDelta(), 0.05)
      const t = clock.getElapsedTime()
      const rect = renderer.domElement.getBoundingClientRect()

      // 星光微闪（错相）
      starsA.opacity = 0.68 + Math.sin(t * 0.9) * 0.12
      starsB.opacity = 0.45 + Math.sin(t * 1.3 + 2) * 0.15

      // 太阳呼吸
      if (!reduceMotion) {
        const pulse = 1 + Math.sin(t * 1.1) * 0.05
        sunGlowA.scale.setScalar(11 * pulse)
        sunGlowB.scale.setScalar(19 * (2 - pulse))
        sunGlowA.material.opacity = 0.8 + Math.sin(t * 1.1) * 0.08
      }

      let infoVisible = false
      let infoText = ''

      for (const p of planets) {
        if (!reduceMotion) p.angle += p.spec.speed * dt
        p.pivot.rotation.y = p.angle
        p.mesh.rotation.y += 0.55 * dt

        const targetHover = hovered === p ? 1 : 0
        p.hover += (targetHover - p.hover) * 0.12
        p.body.scale.setScalar(1 + p.hover * 0.6)
        ;(p.atmos.material as THREE.ShaderMaterial).uniforms.uOpacity.value =
          0.55 + p.hover * 0.5

        if (p.hover > 0.25) {
          const item =
            labelsRef.current.items.find((it) => it.key === p.spec.key) ??
            p.spec
          p.mesh.getWorldPosition(worldPos)
          worldPos.project(camera)
          const sx = ((worldPos.x + 1) / 2) * rect.width
          const sy = ((1 - worldPos.y) / 2) * rect.height
          const above = sy > rect.height / 2
          infoText =
            `<strong>${item.name}</strong><span>${item.desc}</span>` +
            `<em>${labelsRef.current.goLabel} →</em>`
          info.style.display = 'flex'
          info.style.left = `${sx}px`
          info.style.top = `${above ? sy - 34 : sy + 26}px`
          info.style.transform = `translate(-50%, ${above ? '-100%' : '0'})`
          infoVisible = true
        }
      }

      if (!infoVisible) info.style.display = 'none'
      else if (infoText) info.innerHTML = infoText

      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    animate()

    const onResize = () => {
      if (!mount.clientWidth || !mount.clientHeight) return
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    const observer = new ResizeObserver(onResize)
    observer.observe(mount)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      info.remove()
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (mesh.geometry) mesh.geometry.dispose()
        const mat = mesh.material as THREE.Material | THREE.Material[]
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
        else if (mat) mat.dispose()
      })
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className={`solar-canvas ${className}`.trim()} />
}
