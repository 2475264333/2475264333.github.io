import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useDataTheme } from './useDataTheme'

/**
 * NeuralCore：AI 智能核心可视化（首屏主视觉）。
 *
 * 视觉构成：
 * - 中央：脉动发光内核 + 二十面体线框外壳（"智能核心"）
 * - 外围：斐波那契球分布的节点云、连芯细线、交叉轨道环
 * - 脉冲：光点沿连线持续流向内核，如神经元放电
 *
 * 交互：
 * - 鼠标移动 → 整体视差倾斜（叠加永不停止的缓慢自转）
 * - 悬停节点 → 射线检测，节点放大并点亮釉青光
 * - 鼠标离开 → 视差回落，回归纯自转
 */

const NODE_COUNT = 42
const CROSS_LINKS = 14

type Edge = { a: number; bFixed: THREE.Vector3 } | { a: number; b: number }

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v))

export function NeuralCore({ className = '' }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const dataTheme = useDataTheme()

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const nightMode = dataTheme === 'night'

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    )
    camera.position.set(0, 0.5, 7.4)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    // ---- 灯光 ----
    scene.add(new THREE.AmbientLight(0xffffff, 1.0))
    const key = new THREE.DirectionalLight(0xffffff, 1.3)
    key.position.set(3, 5, 4)
    scene.add(key)
    const rim = new THREE.PointLight(0x35d4c0, 1.6, 24)
    rim.position.set(-4, 2, -3)
    scene.add(rim)

    // tilt 层管鼠标视差，spin 层管自转，互不打架
    const tilt = new THREE.Group()
    const spin = new THREE.Group()
    tilt.add(spin)
    scene.add(tilt)

    // ---- 内核：脉动发光体 + 线框外壳 ----
    // 星空主题下环境暗，内核 emissive 提亮保持视觉分量
    const coreMat = new THREE.MeshStandardMaterial({
      color: nightMode ? '#0d6e61' : '#0d5f55',
      emissive: nightMode ? '#00e676' : '#14b8a5',
      emissiveIntensity: nightMode ? 1.0 : 0.85,
      metalness: 0.3,
      roughness: 0.35,
    })
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.78, 2), coreMat)
    spin.add(core)

    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.22, 1),
      new THREE.MeshBasicMaterial({
        color: '#149a89',
        wireframe: true,
        transparent: true,
        opacity: 0.45,
      }),
    )
    spin.add(shell)

    // ---- 节点云：斐波那契球分布（上下均匀，比随机撒点雅致）----
    interface NodeWrap {
      mesh: THREE.Mesh
      base: THREE.Vector3
      phase: number
      hover: number
    }
    const nodes: NodeWrap[] = []
    const nodeGeo = new THREE.SphereGeometry(0.062, 16, 12)
    const golden = Math.PI * (3 - Math.sqrt(5))

    for (let i = 0; i < NODE_COUNT; i++) {
      const r = 2.1 + Math.pow(Math.random(), 0.7)
      const y = 1 - (i / (NODE_COUNT - 1)) * 2
      const rad = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = golden * i
      const base = new THREE.Vector3(
        Math.cos(theta) * rad * r,
        y * r * 0.82,
        Math.sin(theta) * rad * r,
      )
      const mesh = new THREE.Mesh(
        nodeGeo,
        new THREE.MeshStandardMaterial({
          color: nightMode ? '#c8d2dc' : '#263135',
          metalness: 0.55,
          roughness: 0.35,
        }),
      )
      mesh.position.copy(base)
      spin.add(mesh)
      nodes.push({ mesh, base, phase: Math.random() * Math.PI * 2, hover: 0 })
    }

    // ---- 连线：节点→核 + 少量节点互连 ----
    const edges: Edge[] = nodes.map((n) => ({
      a: nodes.indexOf(n),
      bFixed: n.base.clone().setLength(1.24),
    }))
    for (let k = 0; k < CROSS_LINKS; k++) {
      const a = (Math.random() * NODE_COUNT) | 0
      const b = (Math.random() * NODE_COUNT) | 0
      if (a !== b) edges.push({ a, b })
    }
    const linePos = new Float32Array(edges.length * 6)
    const lineGeo = new THREE.BufferGeometry()
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3))
    const lines = new THREE.LineSegments(
      lineGeo,
      new THREE.LineBasicMaterial({
        color: nightMode ? '#00e676' : '#149a89',
        transparent: true,
        opacity: nightMode ? 0.26 : 0.18,
      }),
    )
    spin.add(lines)

    // ---- 脉冲粒子：每条边一个光点，向核流动 ----
    const pulsePhase = new Float32Array(edges.length)
    const pulseSpeed = new Float32Array(edges.length)
    for (let i = 0; i < edges.length; i++) {
      pulsePhase[i] = Math.random()
      pulseSpeed[i] = 0.14 + Math.random() * 0.16
    }
    const pulsePos = new Float32Array(edges.length * 3)
    const pulseGeo = new THREE.BufferGeometry()
    pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3))
    // 圆形光点贴图（PointsMaterial 默认是方块，径向渐变贴图让它柔和圆润）
    const pulseTexCanvas = document.createElement('canvas')
    pulseTexCanvas.width = 64
    pulseTexCanvas.height = 64
    const pctx = pulseTexCanvas.getContext('2d')!
    const grad = pctx.createRadialGradient(32, 32, 2, 32, 32, 32)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.35, 'rgba(255,255,255,0.7)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    pctx.fillStyle = grad
    pctx.fillRect(0, 0, 64, 64)
    const pulseTex = new THREE.CanvasTexture(pulseTexCanvas)
    const pulses = new THREE.Points(
      pulseGeo,
      new THREE.PointsMaterial({
        color: '#35d4c0',
        map: pulseTex,
        size: 0.16,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    spin.add(pulses)

    // ---- 交叉轨道环（细线，丰富构图层次）----
    const makeRing = (radius: number, color: string, opacity: number) => {
      const pts: THREE.Vector3[] = []
      for (let i = 0; i <= 96; i++) {
        const a = (i / 96) * Math.PI * 2
        pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius))
      }
      return new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
      )
    }
    const ringA = makeRing(3.55, nightMode ? '#00e676' : '#149a89', nightMode ? 0.22 : 0.16)
    ringA.rotation.x = Math.PI / 2.6
    ringA.rotation.z = 0.35
    const ringB = makeRing(3.95, nightMode ? '#8fa3bf' : '#263135', nightMode ? 0.16 : 0.1)
    ringB.rotation.x = Math.PI / 1.9
    ringB.rotation.z = -0.5
    spin.add(ringA, ringB)

    // ---- 交互：视差 + 节点悬停 ----
    const raycaster = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    let mx = 0
    let my = 0
    let hovered = -1

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mx = clamp(
        (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2),
        -1,
        1,
      )
      my = clamp(
        (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2),
        -1,
        1,
      )
      ndc.x = mx
      ndc.y = -my
      raycaster.setFromCamera(ndc, camera)
      const hits = raycaster.intersectObjects(
        nodes.map((n) => n.mesh),
        false,
      )
      hovered = hits.length > 0 ? nodes.findIndex((n) => n.mesh === hits[0].object) : -1
      renderer.domElement.style.cursor = hovered >= 0 ? 'pointer' : 'default'
    }

    const onPointerLeave = () => {
      mx = 0
      my = 0
      hovered = -1
    }

    renderer.domElement.addEventListener('pointermove', onPointerMove)
    renderer.domElement.addEventListener('pointerleave', onPointerLeave)

    // ---- 动画循环 ----
    const tmpA = new THREE.Vector3()
    const tmpB = new THREE.Vector3()
    const clock = new THREE.Clock()
    let raf = 0

    const animate = () => {
      const dt = Math.min(clock.getDelta(), 0.05)
      const t = clock.elapsedTime

      if (!reduceMotion) spin.rotation.y += dt * 0.22
      tilt.rotation.y += (mx * 0.32 - tilt.rotation.y) * 0.06
      tilt.rotation.x += (my * 0.18 - tilt.rotation.x) * 0.06

      // 核脉动 + 外壳反向慢转
      const pulse = 1 + Math.sin(t * 1.6) * 0.05
      core.scale.setScalar(pulse)
      coreMat.emissiveIntensity = 0.75 + Math.sin(t * 1.6) * 0.22
      shell.rotation.y -= dt * 0.14
      shell.rotation.x += dt * 0.05
      ringA.rotation.z += dt * 0.05
      ringB.rotation.z -= dt * 0.04

      // 节点：轻微浮动 + 悬停点亮
      for (let i = 0; i < NODE_COUNT; i++) {
        const n = nodes[i]
        const target = i === hovered ? 1 : 0
        n.hover += (target - n.hover) * 0.16
        n.mesh.scale.setScalar(1 + n.hover * 1.15)
        const mat = n.mesh.material as THREE.MeshStandardMaterial
        mat.emissive.set('#14b8a5')
        mat.emissiveIntensity = n.hover * 0.9
        n.mesh.position.set(
          n.base.x + Math.sin(t * 0.7 + n.phase) * 0.07,
          n.base.y + Math.sin(t * 0.9 + n.phase * 1.3) * 0.07,
          n.base.z + Math.cos(t * 0.8 + n.phase) * 0.07,
        )
      }

      // 连线端点同步（节点在动，核端固定）
      for (let i = 0; i < edges.length; i++) {
        const e = edges[i]
        tmpA.copy(nodes[e.a].mesh.position)
        if ('bFixed' in e) tmpB.copy(e.bFixed)
        else tmpB.copy(nodes[e.b].mesh.position)
        linePos[i * 6] = tmpA.x
        linePos[i * 6 + 1] = tmpA.y
        linePos[i * 6 + 2] = tmpA.z
        linePos[i * 6 + 3] = tmpB.x
        linePos[i * 6 + 4] = tmpB.y
        linePos[i * 6 + 5] = tmpB.z
        // 脉冲沿边流动
        pulsePhase[i] = (pulsePhase[i] + pulseSpeed[i] * dt) % 1
        const p = pulsePhase[i]
        pulsePos[i * 3] = tmpA.x + (tmpB.x - tmpA.x) * p
        pulsePos[i * 3 + 1] = tmpA.y + (tmpB.y - tmpA.y) * p
        pulsePos[i * 3 + 2] = tmpA.z + (tmpB.z - tmpA.z) * p
      }
      lineGeo.attributes.position.needsUpdate = true
      pulseGeo.attributes.position.needsUpdate = true

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
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave)
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

  return <div ref={mountRef} className={`core-canvas ${className}`.trim()} />
}
