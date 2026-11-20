import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useDataTheme } from './useDataTheme'

/**
 * HeroWave：亮色点阵数据浪
 * —— 一片由 ~5000 个釉青小点组成的"传感器海面"，
 *    三个不同方向的正弦波叠加出起伏，鼠标移动时相机轻微偏转（视差）。
 *
 * 为什么选点阵而不是大模型：
 * 1. 与"AI 推理监控"的数据感契合；
 * 2. 亮色背景友好（发光/辉光类效果只适合暗底）；
 * 3. 性能极轻：一次 draw call，无贴图无后期。
 */
export function HeroWave({ className = '' }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const dataTheme = useDataTheme()

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // 尊重"减少动效"偏好：静态渲染一帧就好
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    )
    camera.position.set(0, 6.5, 11)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    // ---- 点阵网格 ----
    const COLS = 90
    const ROWS = 56
    const GAP = 0.34
    const count = COLS * ROWS

    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    const base = new THREE.Color(dataTheme === 'night' ? '#00e676' : '#149a89')
    const soft = new THREE.Color(dataTheme === 'night' ? '#3d5570' : '#9bb8ad')

    let i = 0
    for (let ix = 0; ix < COLS; ix++) {
      for (let iz = 0; iz < ROWS; iz++) {
        const x = (ix - (COLS - 1) / 2) * GAP
        const z = (iz - (ROWS - 1) / 2) * GAP
        positions[i * 3] = x
        positions[i * 3 + 1] = 0
        positions[i * 3 + 2] = z

        // 越靠"远处"越灰，做出纵深层次
        const t = iz / (ROWS - 1)
        const c = base.clone().lerp(soft, t * 0.55)
        colors[i * 3] = c.r
        colors[i * 3 + 1] = c.g
        colors[i * 3 + 2] = c.b
        i++
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: dataTheme === 'night' ? 1 : 0.9,
      sizeAttenuation: true,
      depthWrite: false,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    // ---- 鼠标视差 ----
    let targetX = 0
    let targetY = 0
    const onPointerMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect()
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 0.35
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 0.2
    }
    window.addEventListener('pointermove', onPointerMove)

    // ---- 动画 ----
    const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute
    let raf = 0
    const clock = new THREE.Clock()

    const animate = () => {
      const t = clock.getElapsedTime()

      if (!reduceMotion) {
        // 三个方向/频率各异的波叠加 → 自然的海面感
        for (let j = 0; j < count; j++) {
          const x = posAttr.getX(j)
          const z = posAttr.getZ(j)
          const y =
            Math.sin(x * 0.7 + t * 0.9) * 0.22 +
            Math.sin(z * 0.9 + t * 0.6) * 0.18 +
            Math.sin((x + z) * 0.4 + t * 0.35) * 0.26
          posAttr.setY(j, y)
        }
        posAttr.needsUpdate = true

        // 相机视差：平滑追鼠标
        camera.position.x += (targetX * 3 - camera.position.x) * 0.03
        camera.position.y += (6.5 - targetY * 2 - camera.position.y) * 0.03
        camera.lookAt(0, 0, 0)
      }

      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    animate()

    // ---- 尺寸自适应 ----
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
      window.removeEventListener('pointermove', onPointerMove)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [dataTheme])

  return <div ref={mountRef} className={className} aria-hidden="true" />
}
