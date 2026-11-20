import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface ArmRefs {
  base: THREE.Group
  shoulder: THREE.Group
  elbow: THREE.Group
  wrist: THREE.Group
  gripL: THREE.Group
  gripR: THREE.Group
}

export interface ArmPose {
  base: number
  shoulder: number
  elbow: number
  wrist: number
  grip: number
}

/**
 * RobotArm：一台可用代码"读图纸"的程式化机械臂。
 * 结构（从下往上）：
 *   base(基座旋转) → shoulder(肩) → elbow(肘) → wrist(腕) → 夹爪两指(开合)
 * 全部由基础几何体拼装，无外部模型文件——原创、零版权、几百 KB 内。
 * 支持：拖动旋转视角 / 滚轮缩放 / 关节滑块 / 自动演示。
 */
export function buildRobotArm(material: THREE.Material): {
  root: THREE.Group
  refs: ArmRefs
} {
  const root = new THREE.Group()

  // ---------- 基座 ----------
  const base = new THREE.Group()

  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(1.15, 1.35, 0.28, 36),
    material,
  )
  pedestal.position.y = 0.14
  base.add(pedestal)

  const turret = new THREE.Mesh(
    new THREE.CylinderGeometry(0.72, 0.85, 0.62, 36),
    material,
  )
  turret.position.y = 0.59
  base.add(turret)

  root.add(base)

  // ---------- 肩关节（大臂） ----------
  const shoulder = new THREE.Group()
  shoulder.position.y = 0.9

  const shoulderHub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.34, 0.5, 24),
    material,
  )
  shoulderHub.rotation.z = Math.PI / 2
  shoulder.add(shoulderHub)

  const upperArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.44, 2.1, 0.52),
    material,
  )
  upperArm.position.y = 1.05
  shoulder.add(upperArm)

  base.add(shoulder)

  // ---------- 肘关节（小臂） ----------
  const elbow = new THREE.Group()
  elbow.position.y = 2.1

  const elbowHub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.46, 24),
    material,
  )
  elbowHub.rotation.z = Math.PI / 2
  elbow.add(elbowHub)

  const forearm = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 1.62, 0.42),
    material,
  )
  forearm.position.y = 0.81
  elbow.add(forearm)

  shoulder.add(elbow)

  // ---------- 腕关节 ----------
  const wrist = new THREE.Group()
  wrist.position.y = 1.62

  const wristHub = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 20, 16),
    material,
  )
  wrist.add(wristHub)

  const palm = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.3, 0.3),
    material,
  )
  palm.position.y = 0.18
  wrist.add(palm)

  elbow.add(wrist)

  // ---------- 夹爪（两指） ----------
  const makeFinger = (side: 1 | -1) => {
    const g = new THREE.Group()
    g.position.set(side * 0.14, 0.33, 0)
    const stem = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.34, 0.14),
      material,
    )
    stem.position.y = 0.17
    g.add(stem)
    const tip = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.16, 0.2),
      material,
    )
    tip.position.set(0, 0.4, 0.04)
    tip.rotation.x = -0.35
    g.add(tip)
    return g
  }

  const gripL = makeFinger(1)
  const gripR = makeFinger(-1)
  wrist.add(gripL, gripR)

  return { root, refs: { base, shoulder, elbow, wrist, gripL, gripR } }
}

/** 把滑块姿态应用到机械臂关节上 */
export function applyPose(refs: ArmRefs, pose: ArmPose) {
  refs.base.rotation.y = pose.base
  refs.shoulder.rotation.x = pose.shoulder
  refs.elbow.rotation.x = pose.elbow
  refs.wrist.rotation.x = pose.wrist
  const open = pose.grip
  refs.gripL.position.x = 0.14 + open * 0.16
  refs.gripR.position.x = -0.14 - open * 0.16
}

/** 自动演示：每个关节按不同节奏摆动，像在干活 */
export function autoPose(t: number): ArmPose {
  return {
    base: Math.sin(t * 0.5) * 1.0,
    shoulder: Math.sin(t * 0.7) * 0.5 - 0.4,
    elbow: Math.sin(t * 0.9 + 1.2) * 0.7 - 0.5,
    wrist: Math.sin(t * 1.1 + 0.6) * 0.5,
    grip: (Math.sin(t * 1.6) * 0.5 + 0.5) * 0.8,
  }
}

/** 交互式机械臂查看器 */
export function RobotArmViewer({ className = '' }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const [pose, setPose] = useState<ArmPose>({
    base: 0.5,
    shoulder: -0.2,
    elbow: -0.5,
    wrist: 0.2,
    grip: 0.3,
  })
  const [auto, setAuto] = useState(true)

  // refs 是为了在事件回调/动画循环里拿到最新值
  const poseRef = useRef(pose)
  poseRef.current = pose
  const autoRef = useRef(auto)
  autoRef.current = auto
  const userPoseRef = useRef<ArmPose>(pose)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(
      42,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    )
    camera.position.set(5.2, 3.6, 6.4)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    // 轨道控制器：拖动旋转、滚轮缩放
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance = 4
    controls.maxDistance = 14
    controls.maxPolarAngle = Math.PI / 2.05
    controls.target.set(0, 1.6, 0)

    // 灯光：亮色页面里的柔和布光
    scene.add(new THREE.AmbientLight(0xffffff, 1.1))
    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(4, 7, 5)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0x9adcd2, 0.7)
    rim.position.set(-5, 4, -4)
    scene.add(rim)

    // 机械臂本体：釉青色金属质感
    const material = new THREE.MeshStandardMaterial({
      color: '#149a89',
      metalness: 0.55,
      roughness: 0.32,
    })
    const { root: arm, refs } = buildRobotArm(material)
    arm.position.y = -1.7
    scene.add(arm)

    // 地面圆盘：给机械臂一个"站位"
    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(2.1, 2.1, 0.1, 48),
      new THREE.MeshStandardMaterial({
        color: '#e2f2ef',
        metalness: 0.1,
        roughness: 0.9,
      }),
    )
    floor.position.y = -1.75
    scene.add(floor)

    // 自动/手动的姿态过渡由动画循环里的阻尼系数统一处理，切换时不跳变

    const clock = new THREE.Clock()
    let raf = 0

    const animate = () => {
      const t = clock.getElapsedTime()

      let target: ArmPose
      if (autoRef.current && !reduceMotion) {
        target = autoPose(t)
      } else {
        target = userPoseRef.current
      }

      // 姿态平滑过渡（阻尼），滑块和自动模式切换时不跳变
      const k = 0.08
      const current = poseRef.current
      const next: ArmPose = {
        base: current.base + (target.base - current.base) * k,
        shoulder: current.shoulder + (target.shoulder - current.shoulder) * k,
        elbow: current.elbow + (target.elbow - current.elbow) * k,
        wrist: current.wrist + (target.wrist - current.wrist) * k,
        grip: current.grip + (target.grip - current.grip) * k,
      }
      applyPose(refs, next)
      poseRef.current = next

      controls.update()
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
      controls.dispose()
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

  // 滑块 → 用户姿态
  const setJoint = (key: keyof ArmPose) => (value: number) => {
    if (autoRef.current) setAuto(false)
    const next = { ...poseRef.current, [key]: value }
    userPoseRef.current = next
    setPose(next)
  }

  const sliders: {
    key: keyof ArmPose
    label: string
    min: number
    max: number
  }[] = [
    { key: 'base', label: 'base', min: -Math.PI, max: Math.PI },
    { key: 'shoulder', label: 'shoulder', min: -0.7, max: 0.6 },
    { key: 'elbow', label: 'elbow', min: -1.1, max: 0.4 },
    { key: 'wrist', label: 'wrist', min: -0.8, max: 0.8 },
    { key: 'grip', label: 'grip', min: 0, max: 1 },
  ]

  return (
    <div className={`arm-viewer ${className}`.trim()}>
      <div ref={mountRef} className="arm-canvas" />
      <div className="arm-panel">
        <button
          className={`arm-mode ${auto ? 'on' : ''}`}
          onClick={() => {
            if (auto) {
              // 切回手动：从当前自动姿态继续，避免跳变
              const stopPose = poseRef.current
              userPoseRef.current = stopPose
              setPose(stopPose)
              setAuto(false)
            } else {
              setAuto(true)
            }
          }}
        >
          {auto ? 'AUTO' : 'MANUAL'}
        </button>
        {sliders.map((s) => (
          <label key={s.key} className="arm-slider">
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={0.01}
              value={pose[s.key]}
              onChange={(e) => setJoint(s.key)(Number(e.target.value))}
              style={{ display: auto ? 'none' : undefined }}
            />
          </label>
        ))}
      </div>
    </div>
  )
}
