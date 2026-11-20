import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export interface SolarItem {
  key: string
  name: string
  section: string
  desc: string
}

interface PlanetSpec extends SolarItem {
  /** 轨道半径 */
  orbit: number
  /** 星球半径 */
  size: number
  /** 公转速度（弧度/秒） */
  speed: number
  /** 主色 */
  color: string
  /** 轨道起始角（让行星彼此错开） */
  phase: number
}

const PLANET_STYLES: Omit<PlanetSpec, keyof SolarItem>[] = [
  { orbit: 6.2, size: 0.85, speed: 0.34, color: '#149a89', phase: 0.4 },
  { orbit: 8.6, size: 1.0, speed: 0.26, color: '#3d6fb4', phase: 1.9 },
  { orbit: 11.2, size: 1.15, speed: 0.2, color: '#c98a3d', phase: 3.3 },
  { orbit: 13.8, size: 0.95, speed: 0.16, color: '#7a58c0', phase: 4.6 },
  { orbit: 16.4, size: 0.8, speed: 0.13, color: '#b84a6b', phase: 5.5 },
]

/**
 * SolarNav：导航太阳系。
 * 太阳 = 品牌核心；五颗行星 = 网站五个版块。
 * 悬停行星 → 放大 + 信息卡；点击 → 平滑滚动到对应版块。
 * 纯 three.js 实现：射线检测 + 屏幕坐标投影，无需额外库。
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
  // 文案通过 ref 进渲染循环，语言切换无需重建场景
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
      200,
    )
    camera.position.set(0, 26, 26)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    // ---- 灯光：太阳发光，行星被照亮 ----
    const sunLight = new THREE.PointLight(0xffd9a0, 300, 0, 2)
    scene.add(sunLight)
    scene.add(new THREE.AmbientLight(0xffffff, 0.55))

    // ---- 太阳 ----
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(2.6, 48, 32),
      new THREE.MeshBasicMaterial({ color: '#ffc46b' }),
    )
    scene.add(sun)

    // 太阳光晕（背面渲染的渐变壳）
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(3.4, 48, 32),
      new THREE.MeshBasicMaterial({
        color: '#ffcf87',
        transparent: true,
        opacity: 0.28,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    )
    scene.add(halo)

    // ---- 行星 ----
    interface Planet {
      spec: PlanetSpec
      pivot: THREE.Group
      mesh: THREE.Mesh
      halo: THREE.Mesh
      angle: number
      hover: number // 0..1 悬停插值
    }
    const planets: Planet[] = []

    labelsRef.current.items.forEach((item, i) => {
      const spec: PlanetSpec = { ...item, ...PLANET_STYLES[i] }

      const pivot = new THREE.Group()
      pivot.rotation.y = spec.phase
      scene.add(pivot)

      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(spec.size, 40, 28),
        new THREE.MeshStandardMaterial({
          color: spec.color,
          metalness: 0.15,
          roughness: 0.55,
        }),
      )
      mesh.position.x = spec.orbit
      pivot.add(mesh)

      // 行星悬停光晕
      const phalo = new THREE.Mesh(
        new THREE.SphereGeometry(spec.size * 1.25, 32, 24),
        new THREE.MeshBasicMaterial({
          color: spec.color,
          transparent: true,
          opacity: 0,
          side: THREE.BackSide,
          depthWrite: false,
        }),
      )
      phalo.position.x = spec.orbit
      pivot.add(phalo)

      // 轨道细线
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
          color: '#1a1c1e',
          transparent: true,
          opacity: 0.1,
        }),
      )
      scene.add(orbitLine)

      planets.push({ spec, pivot, mesh, halo: phalo, angle: spec.phase, hover: 0 })
    })

    // ---- 交互：悬停检测 + 点击跳转 ----
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
      // 判定为"点击"而非"拖动"：位移小于 6px 且时长小于 400ms
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

    // ---- 动画循环 ----
    const worldPos = new THREE.Vector3()
    const clock = new THREE.Clock()
    let raf = 0

    const animate = () => {
      const dt = Math.min(clock.getDelta(), 0.05)
      const t = clock.getElapsedTime()
      const rect = renderer.domElement.getBoundingClientRect()

      let infoVisible = false
      let infoText = ''

      for (const p of planets) {
        // 公转（reduceMotion 时静止）
        if (!reduceMotion) p.angle += p.spec.speed * dt
        p.pivot.rotation.y = p.angle

        // 自转
        p.mesh.rotation.y += 0.6 * dt

        // 悬停插值：平滑放大 1.6 倍 + 光晕浮现
        const targetHover = hovered === p ? 1 : 0
        p.hover += (targetHover - p.hover) * 0.12
        p.mesh.scale.setScalar(1 + p.hover * 0.6)
        ;(p.halo.material as THREE.MeshBasicMaterial).opacity = p.hover * 0.4

        // 信息卡：跟随悬停行星（3D 坐标 → 屏幕坐标）
        if (p.hover > 0.25) {
          const item =
            labelsRef.current.items.find((it) => it.key === p.spec.key) ??
            p.spec
          p.mesh.getWorldPosition(worldPos)
          worldPos.project(camera)
          const sx = ((worldPos.x + 1) / 2) * rect.width
          const sy = ((1 - worldPos.y) / 2) * rect.height
          const above = sy > rect.height / 2 // 星球在下半屏 → 卡片放上方
          infoText =
            `<strong>${item.name}</strong><span>${item.desc}</span>` +
            `<em>${labelsRef.current.goLabel} →</em>`
          info.style.display = 'block'
          info.style.left = `${sx}px`
          info.style.top = `${above ? sy - 34 : sy + 26}px`
          info.style.transform = `translate(-50%, ${above ? '-100%' : '0'})`
          infoVisible = true
        }
      }

      if (!infoVisible) info.style.display = 'none'
      else {
        // 注意用 flex：内联 display 会覆盖样式表的 .solar-info 布局
        info.style.display = 'flex'
        if (infoText) info.innerHTML = infoText
      }

      // 太阳呼吸光晕
      if (!reduceMotion) {
        halo.scale.setScalar(1 + Math.sin(t * 1.2) * 0.04)
      }

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
