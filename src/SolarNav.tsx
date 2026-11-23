import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useDataTheme } from './useDataTheme'

export interface SolarItem {
  key: string
  planet: string
  name: string
  section: string
  desc: string
}

type PlanetKind = 'mercury' | 'earth' | 'mars' | 'jupiter' | 'saturn'

interface PlanetSpec extends SolarItem {
  orbit: number
  size: number
  speed: number
  phase: number
  tilt: number
  kind: PlanetKind
}

/**
 * 行星按真实太阳系特征配置（尺寸做了压缩，保留相对大小关系）：
 * 火星=锈红岩壳 / 地球=蓝色海洋白云 / 木星=条纹大红斑 / 土星=淡金+光环 / 水星=灰色陨石坑
 * 对应版块：业务→火星(行动) 团队→地球(家园) 制造→木星(巨行星) 愿景→土星(光环) 联系→水星(信使)
 */
const PLANET_STYLES: Omit<PlanetSpec, keyof SolarItem>[] = [
  // 轨道顺序 = 真实距日排序：水星 6.0 < 地球 8.6 < 火星 11.2 < 木星 14.2 < 土星 17.2
  // 公转速度遵循开普勒第三定律：离太阳越近越快（水星 0.52 → 土星 0.10）
  { orbit: 11.0, size: 0.72, speed: 0.26, phase: 0.4, tilt: 0.06, kind: 'mars' },
  { orbit: 8.4, size: 0.85, speed: 0.34, phase: 1.9, tilt: -0.09, kind: 'earth' },
  { orbit: 13.6, size: 1.45, speed: 0.16, phase: 3.3, tilt: 0.04, kind: 'jupiter' },
  { orbit: 16.2, size: 1.2, speed: 0.1, phase: 4.6, tilt: -0.12, kind: 'saturn' },
  { orbit: 5.8, size: 0.55, speed: 0.52, phase: 5.5, tilt: 0.08, kind: 'mercury' },
]

/* ============ 程序化行星纹理（全部 Canvas 生成，零图片素材） ============ */

type Ctx = CanvasRenderingContext2D

function newCanvas(): { c: HTMLCanvasElement; ctx: Ctx } {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 256
  return { c, ctx: c.getContext('2d')! }
}

function toTexture(c: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** 陨石坑：暗坑 + 亮边（真实立体感的关键） */
function crater(ctx: Ctx, x: number, y: number, r: number, baseL: number, hue: number, sat: number) {
  ctx.fillStyle = `hsla(${hue}, ${sat}%, ${baseL * 0.55}%, 0.5)`
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = `hsla(${hue}, ${sat * 0.8}%, ${Math.min(88, baseL * 165)}%, 0.45)`
  ctx.lineWidth = 1.3
  ctx.beginPath()
  ctx.arc(x, y, r + 0.9, Math.PI * 1.08, Math.PI * 1.92)
  ctx.stroke()
}

/** 水星：灰色、密布陨石坑 */
function mercuryTexture(): THREE.CanvasTexture {
  const { c, ctx } = newCanvas()
  for (let y = 0; y < 256; y++) {
    const t = Math.abs(y / 256 - 0.5) * 2
    ctx.fillStyle = `hsl(30, 5%, ${46 - t * 10}%)`
    ctx.fillRect(0, y, 512, 1)
  }
  for (let i = 0; i < 90; i++) {
    crater(
      ctx,
      Math.random() * 512,
      15 + Math.random() * 226,
      2 + Math.random() * 10,
      40,
      30,
      5,
    )
  }
  return toTexture(c)
}

/** 火星：锈红沙漠 + 暗色玄武岩区 + 极冠 + 少量坑 */
function marsTexture(): THREE.CanvasTexture {
  const { c, ctx } = newCanvas()
  for (let y = 0; y < 256; y++) {
    const t = Math.abs(y / 256 - 0.5) * 2
    ctx.fillStyle = `hsl(14, 62%, ${42 + 6 - t * 12}%)`
    ctx.fillRect(0, y, 512, 1)
  }
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 256
    ctx.fillStyle = `hsla(10, 45%, ${18 + Math.random() * 14}%, 0.35)`
    ctx.beginPath()
    ctx.ellipse(x, y, 8 + Math.random() * 30, 4 + Math.random() * 12, Math.random() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }
  for (let i = 0; i < 12; i++) {
    crater(ctx, Math.random() * 512, 40 + Math.random() * 176, 2.5 + Math.random() * 7, 38, 12, 40)
  }
  // 极冠
  for (const [top, edge] of [[true, 20], [false, 236]] as const) {
    for (let i = 0; i < 26; i++) {
      const y = top ? 20 - i * 0.8 : 236 + i * 0.8
      if (y < 0 || y > 256) continue
      ctx.fillStyle = `rgba(240, 238, 232, ${0.5 - i * 0.02})`
      ctx.fillRect(Math.random() * 60, y, 512 - Math.random() * 90, 1.4)
    }
    void edge
  }
  return toTexture(c)
}

/** 地球：蓝色海洋 + 绿褐大陆 + 白云 + 极冰 */
function earthTexture(): THREE.CanvasTexture {
  const { c, ctx } = newCanvas()
  for (let y = 0; y < 256; y++) {
    const t = Math.abs(y / 256 - 0.5) * 2
    ctx.fillStyle = `hsl(212, 68%, ${34 + (1 - t) * 8}%)`
    ctx.fillRect(0, y, 512, 1)
  }
  // 大陆：多组聚集的绿褐色斑块
  const landColors = ['hsla(95, 38%, 34%, 0.9)', 'hsla(70, 30%, 45%, 0.85)', 'hsla(35, 35%, 48%, 0.8)']
  for (let cluster = 0; cluster < 8; cluster++) {
    const cx = Math.random() * 512
    const cy = 50 + Math.random() * 156
    for (let i = 0; i < 14; i++) {
      const x = cx + (Math.random() - 0.5) * 90
      const y = cy + (Math.random() - 0.5) * 46
      ctx.fillStyle = landColors[(Math.random() * landColors.length) | 0]
      ctx.beginPath()
      ctx.ellipse(x, y, 6 + Math.random() * 22, 4 + Math.random() * 12, Math.random() * Math.PI, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  // 极冰
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgba(235, 242, 246, ${0.75 - i * 0.025})`
    ctx.fillRect(Math.random() * 70, i * 0.7, 512 - Math.random() * 110, 1.6)
    ctx.fillRect(Math.random() * 70, 256 - i * 0.7, 512 - Math.random() * 110, 1.6)
  }
  // 云层：半透明白条纹与絮团
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 256
    ctx.fillStyle = `rgba(255,255,255,${0.18 + Math.random() * 0.2})`
    ctx.beginPath()
    ctx.ellipse(x, y, 12 + Math.random() * 34, 2.5 + Math.random() * 5, (Math.random() - 0.5) * 0.5, 0, Math.PI * 2)
    ctx.fill()
  }
  return toTexture(c)
}

/** 木星：奶油-棕褐横向条纹 + 大红斑 */
function jupiterTexture(): THREE.CanvasTexture {
  const { c, ctx } = newCanvas()
  const stops: [number, string][] = [
    [0.0, '#e6d3ac'], [0.1, '#c9a06e'], [0.2, '#e3cfa8'], [0.3, '#b07a4a'],
    [0.42, '#e8d6b3'], [0.52, '#c1865e'], [0.62, '#e0cba6'], [0.72, '#a97e56'],
    [0.82, '#e2cea6'], [0.92, '#bd9569'], [1.0, '#e6d3ac'],
  ]
  for (let y = 0; y < 256; y++) {
    // 条纹边界带一点波浪，更真实
    const f = y / 256 + Math.sin(y * 0.21) * 0.008 + Math.sin(y * 0.07) * 0.006
    let color = stops[stops.length - 1][1]
    for (let s = 0; s < stops.length - 1; s++) {
      if (f >= stops[s][0] && f < stops[s + 1][0]) color = stops[s][1]
    }
    ctx.fillStyle = color
    ctx.fillRect(0, y, 512, 1)
  }
  // 条纹间的湍流细纹
  for (let i = 0; i < 160; i++) {
    const y = Math.random() * 256
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.08})`
    ctx.fillRect(Math.random() * 512, y, 20 + Math.random() * 80, 1)
    ctx.fillStyle = `rgba(60,30,10,${Math.random() * 0.08})`
    ctx.fillRect(Math.random() * 512, y + 1, 15 + Math.random() * 60, 1)
  }
  // 大红斑
  const sx = 358
  const sy = 158
  ctx.fillStyle = 'rgba(214, 116, 74, 0.95)'
  ctx.beginPath()
  ctx.ellipse(sx, sy, 34, 19, -0.1, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(178, 74, 42, 0.8)'
  ctx.beginPath()
  ctx.ellipse(sx, sy, 22, 12, -0.1, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(235, 205, 165, 0.55)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.ellipse(sx, sy, 37, 22, -0.1, 0, Math.PI * 2)
  ctx.stroke()
  return toTexture(c)
}

/** 土星本体：淡金柔和条纹 */
function saturnTexture(): THREE.CanvasTexture {
  const { c, ctx } = newCanvas()
  const stops: [number, string][] = [
    [0.0, '#e8d3a4'], [0.15, '#d9b57c'], [0.3, '#e6cd9c'], [0.45, '#d3ac72'],
    [0.6, '#ead2a2'], [0.75, '#d6ae74'], [0.9, '#e6cd9c'], [1.0, '#e8d3a4'],
  ]
  for (let y = 0; y < 256; y++) {
    const f = y / 256 + Math.sin(y * 0.15) * 0.006
    let color = stops[stops.length - 1][1]
    for (let s = 0; s < stops.length - 1; s++) {
      if (f >= stops[s][0] && f < stops[s + 1][0]) color = stops[s][1]
    }
    ctx.fillStyle = color
    ctx.fillRect(0, y, 512, 1)
  }
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `rgba(255,250,235,${Math.random() * 0.06})`
    ctx.fillRect(Math.random() * 512, Math.random() * 256, 30 + Math.random() * 70, 1)
  }
  return toTexture(c)
}

/** 土星环：同心环带 + 卡西尼缝（径向渐变画在方画布上，配合 RingGeometry 平面映射） */
function saturnRingTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')!
  const cx = 128
  const bands: [number, number, string][] = [
    [58, 70, 'rgba(217, 181, 124, 0.35)'],
    [70, 86, 'rgba(232, 211, 164, 0.75)'],
    [86, 93, 'rgba(210, 172, 114, 0.5)'],
    [93, 98, 'rgba(0,0,0,0)'],
    [98, 118, 'rgba(226, 197, 148, 0.8)'],
    [118, 128, 'rgba(196, 158, 104, 0.45)'],
  ]
  for (const [r0, r1, color] of bands) {
    ctx.strokeStyle = color
    for (let r = r0; r <= r1; r += 0.5) {
      ctx.lineWidth = 0.6
      ctx.strokeStyle = color
      ctx.beginPath()
      ctx.arc(cx, cx, r, 0, Math.PI * 2)
      ctx.stroke()
    }
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** 柔光贴图（太阳辉光） */
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
  return toTexture(c)
}

/* ---------- 菲涅尔大气辉光着色器 ---------- */
function makeAtmosphereMaterial(hex: string, strength = 0.7): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(hex) },
      uOpacity: { value: strength },
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

/** 各行星的大气颜色（贴近真实观感） */
const ATMOS: Record<PlanetKind, { color: string; strength: number }> = {
  mars: { color: '#d98a5e', strength: 0.45 },
  earth: { color: '#7db8ff', strength: 0.85 },
  jupiter: { color: '#e8cba0', strength: 0.5 },
  saturn: { color: '#e9d4a4', strength: 0.45 },
  mercury: { color: '#9a958e', strength: 0.22 },
}

/**
 * SolarNav：真实系太阳系导航。
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
  const dataTheme = useDataTheme()
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
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    mount.appendChild(renderer.domElement)

    // ---- 光照 ----
    const sunLight = new THREE.PointLight(0xffe0b0, 2.6, 0, 0)
    scene.add(sunLight)
    scene.add(new THREE.AmbientLight(0x8fa3bf, 0.5))

    // ---- 星空 ----
    // 星空主题：白星错相微闪；简约主题：亮窗底色，星点换成柔和的天空微尘
    const nightMode = dataTheme === 'night'
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
        color: nightMode ? '#cfe0ee' : '#8fb0c9',
        size,
        sizeAttenuation: false,
        transparent: true,
        opacity: nightMode ? opacity : opacity * 0.4,
        depthWrite: false,
      })
      scene.add(new THREE.Points(geo, mat))
      return mat
    }
    const starsA = makeStars(520, 1.6, nightMode ? 0.5 : 0.75)
    const starsB = makeStars(260, 2.2, nightMode ? 0.32 : 0.5)

    // ---- 太阳 ----
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
    const makeTexture = (kind: PlanetKind): THREE.CanvasTexture => {
      switch (kind) {
        case 'mercury': return mercuryTexture()
        case 'earth': return earthTexture()
        case 'mars': return marsTexture()
        case 'jupiter': return jupiterTexture()
        case 'saturn': return saturnTexture()
      }
    }

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
    // 可拾取集合：行星本体 + 土星环（环是行星视觉的一部分，点了也该响应）
    const pickables: THREE.Object3D[] = []

    labelsRef.current.items.forEach((item, i) => {
      const spec: PlanetSpec = { ...item, ...PLANET_STYLES[i] }

      const orbitGroup = new THREE.Group()
      orbitGroup.rotation.x = spec.tilt
      scene.add(orbitGroup)

      const pivot = new THREE.Group()
      pivot.rotation.y = spec.phase
      orbitGroup.add(pivot)

      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(spec.size, 48, 32),
        new THREE.MeshStandardMaterial({
          map: makeTexture(spec.kind),
          roughness: 0.85,
          metalness: 0.02,
        }),
      )
      mesh.rotation.z = 0.12 + Math.random() * 0.15
      mesh.userData.planetIndex = i
      pickables.push(mesh)

      const atmosMat = makeAtmosphereMaterial(
        ATMOS[spec.kind].color,
        ATMOS[spec.kind].strength,
      )
      const atmos = new THREE.Mesh(
        new THREE.SphereGeometry(spec.size * 1.14, 40, 28),
        atmosMat,
      )

      const body = new THREE.Group()
      body.add(mesh, atmos)

      // 土星：加光环
      if (spec.kind === 'saturn') {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(spec.size * 1.35, spec.size * 2.35, 96),
          new THREE.MeshBasicMaterial({
            map: saturnRingTexture(),
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
            depthWrite: false,
          }),
        )
        ring.rotation.x = Math.PI / 2 - 0.32
        ring.userData.planetIndex = i
        pickables.push(ring)
        body.add(ring)
      }

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
          color: nightMode ? '#9db8cc' : '#5a7d94',
          transparent: true,
          opacity: nightMode ? 0.16 : 0.3,
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
      const hits = raycaster.intersectObjects(pickables, false)
      if (hits.length > 0) {
        const idx = hits[0].object.userData.planetIndex as number
        return planets[idx] ?? null
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

      starsA.opacity = 0.68 + Math.sin(t * 0.9) * 0.12
      starsB.opacity = 0.45 + Math.sin(t * 1.3 + 2) * 0.15

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
          ATMOS[p.spec.kind].strength + p.hover * 0.4

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
            `<strong>${item.planet} · ${item.name}</strong><span>${item.desc}</span>` +
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
  }, [dataTheme])

  return <div ref={mountRef} className={`solar-canvas ${className}`.trim()} />
}
