import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * RobotArmViewer：会"追鼠标"的 3D 机械臂（两连杆 IK 解算）。
 *
 * 交互设计：
 * - 鼠标在画面里移动 → 机械臂实时解算肩/肘/腕角度，夹爪始终朝鼠标位置伸取
 *   （目标点 = 鼠标射线与面向相机的虚拟平面求交，再收敛到可达工作包络内）
 * - 按住机械臂本体拖动 → 直接扳动对应关节（基座横拖=转身；肩/肘/腕竖拖=俯仰；夹爪竖拖=开合）
 * - 鼠标离开 / 2.5 秒无操作 → 恢复轻微"待机呼吸"摆动，页面保持鲜活
 *
 * 视觉设计：
 * - 胶囊连杆 + 车削基座 + 关节釉青环，深灰×釉青双色调
 * - 真实投影（PCFSoftShadowMap），无框悬浮在首屏纸面上
 */

type JointKey = 'base' | 'shoulder' | 'elbow' | 'wrist' | 'grip'

interface Pose {
  base: number
  shoulder: number
  elbow: number
  wrist: number
  grip: number
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v))

// 各关节的活动范围（弧度 / 夹爪 0-1）
const JOINT_RANGE: Record<JointKey, [number, number]> = {
  base: [-Math.PI, Math.PI],
  shoulder: [-0.95, 0.5],
  elbow: [-1.7, 0.35],
  wrist: [-0.9, 0.9],
  grip: [0, 1],
}

/** 待机呼吸：轻微起伏，手臂自然悬停 */
function idlePose(t: number): Pose {
  return {
    base: 2.2 + Math.sin(t * 0.4) * 0.4,
    shoulder: -0.55 + Math.sin(t * 0.55) * 0.22,
    elbow: -0.85 + Math.sin(t * 0.7 + 1.1) * 0.3,
    wrist: 0.9 + Math.sin(t * 0.9 + 0.5) * 0.28,
    grip: (Math.sin(t * 1.1) * 0.5 + 0.5) * 0.6,
  }
}

/* ---- 两连杆 IK：解算肩/肘俯仰，使夹爪抵达平面内目标点 ----
 * 结构尺寸取自建模（上臂 1.92、前臂到腕心 1.36，稍收敛保证姿态舒展）。
 * L1/L2 为有效杆长；返回 null 表示目标不可达（由调用方做包络收敛）。
 */
const L1 = 1.72
const L2 = 1.28

function solveIK(dx: number, dy: number): { shoulder: number; elbow: number } | null {
  const d2 = dx * dx + dy * dy
  const d = Math.sqrt(d2)
  if (d > L1 + L2 || d < Math.abs(L1 - L2) + 0.05) return null
  // 肘角由余弦定理直接得出（肘向上弯 = 负方向）
  const cosE = (d2 - L1 * L1 - L2 * L2) / (2 * L1 * L2)
  const elbow = -Math.acos(clamp(cosE, -1, 1))
  // 肩角 = 目标方位角 + 三角形补偿角（asin 组合式数值上更稳）
  const base = Math.atan2(dy, dx)
  const comp = Math.atan2(L2 * Math.sin(elbow), L1 + L2 * Math.cos(elbow))
  const shoulder = base - comp
  return { shoulder, elbow }
}

export function RobotArmViewer({ className = '' }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement | null>(null)

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
    camera.position.set(4.4, 2.2, 6.4)
    camera.lookAt(-0.4, 0.4, 0)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mount.appendChild(renderer.domElement)

    // ---- 灯光 ----
    scene.add(new THREE.AmbientLight(0xffffff, 1.05))
    const key = new THREE.DirectionalLight(0xffffff, 1.7)
    key.position.set(4, 8, 5)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.camera.left = -5
    key.shadow.camera.right = 5
    key.shadow.camera.top = 6
    key.shadow.camera.bottom = -2
    key.shadow.bias = -0.0004
    scene.add(key)
    const rim = new THREE.DirectionalLight(0x9adcd2, 0.65)
    rim.position.set(-5, 4, -4)
    scene.add(rim)

    // ---- 材质：深灰金属 × 釉青关节 ----
    const darkMat = new THREE.MeshStandardMaterial({
      color: '#263135',
      metalness: 0.6,
      roughness: 0.34,
    })
    const tealMat = new THREE.MeshStandardMaterial({
      color: '#149a89',
      metalness: 0.5,
      roughness: 0.28,
    })
    const ringMat = new THREE.MeshStandardMaterial({
      color: '#2bb3a0',
      metalness: 0.45,
      roughness: 0.3,
    })

    // ---- 组装机械臂 ----
    const arm = new THREE.Group()

    const hitMeshes: THREE.Mesh[] = []
    const addHit = (parent: THREE.Object3D, r: number, joint: JointKey) => {
      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(r, 12, 8),
        new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0,
          depthWrite: false,
        }),
      )
      hit.userData.joint = joint
      parent.add(hit)
      hitMeshes.push(hit)
    }

    // 基座：车削曲线轮廓
    const base = new THREE.Group()
    const profile = [
      new THREE.Vector2(0.02, 0),
      new THREE.Vector2(1.3, 0),
      new THREE.Vector2(1.24, 0.1),
      new THREE.Vector2(0.92, 0.2),
      new THREE.Vector2(0.78, 0.46),
      new THREE.Vector2(0.7, 0.7),
      new THREE.Vector2(0.5, 0.8),
      new THREE.Vector2(0.02, 0.82),
    ]
    const pedestal = new THREE.Mesh(
      new THREE.LatheGeometry(profile, 48),
      darkMat,
    )
    base.add(pedestal)
    const baseRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.56, 0.035, 12, 40),
      ringMat,
    )
    baseRing.rotation.x = Math.PI / 2
    baseRing.position.y = 0.8
    base.add(baseRing)
    addHit(base, 0.95, 'base')
    arm.add(base)

    // 肩关节
    const shoulder = new THREE.Group()
    shoulder.position.y = 1.02
    const shoulderHub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.46, 28),
      tealMat,
    )
    shoulderHub.rotation.z = Math.PI / 2
    shoulder.add(shoulderHub)
    const shoulderRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.31, 0.028, 12, 36),
      ringMat,
    )
    shoulderRing.rotation.y = Math.PI / 2
    shoulder.add(shoulderRing)
    const upperArm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.21, 1.5, 8, 20),
      darkMat,
    )
    upperArm.position.y = 0.98
    shoulder.add(upperArm)
    addHit(shoulder, 0.6, 'shoulder')
    base.add(shoulder)

    // 肘关节
    const elbow = new THREE.Group()
    elbow.position.y = 1.92
    const elbowHub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.4, 26),
      tealMat,
    )
    elbowHub.rotation.z = Math.PI / 2
    elbow.add(elbowHub)
    const elbowRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.25, 0.024, 12, 32),
      ringMat,
    )
    elbowRing.rotation.y = Math.PI / 2
    elbow.add(elbowRing)
    const forearm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.155, 1.05, 8, 20),
      darkMat,
    )
    forearm.position.y = 0.68
    elbow.add(forearm)
    addHit(elbow, 0.5, 'elbow')
    shoulder.add(elbow)

    // 腕关节 + 双指夹爪
    const wrist = new THREE.Group()
    wrist.position.y = 1.36
    const wristHub = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 22, 16),
      tealMat,
    )
    wrist.add(wristHub)
    const palm = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.22, 0.26),
      darkMat,
    )
    palm.position.y = 0.16
    wrist.add(palm)

    const makeFinger = (side: 1 | -1) => {
      const g = new THREE.Group()
      const stem = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.05, 0.2, 6, 14),
        tealMat,
      )
      stem.position.y = 0.2
      g.add(stem)
      const tip = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.045, 0.1, 6, 14),
        darkMat,
      )
      tip.position.set(0, 0.36, 0.03)
      tip.rotation.x = -0.5
      g.add(tip)
      g.position.x = side * 0.13
      return g
    }
    const gripL = makeFinger(1)
    const gripR = makeFinger(-1)
    wrist.add(gripL, gripR)
    addHit(wrist, 0.42, 'grip')
    elbow.add(wrist)

    arm.position.y = -1.66
    arm.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (mesh.isMesh) mesh.castShadow = true
    })
    scene.add(arm)

    // 地台 + 接收投影
    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(2.15, 2.15, 0.1, 48),
      new THREE.MeshStandardMaterial({
        color: '#e7e3da',
        metalness: 0.05,
        roughness: 0.95,
      }),
    )
    floor.position.y = -1.71
    floor.receiveShadow = true
    scene.add(floor)

    // ---- 手势交互：按住关节拖动（覆盖在 IK 之上的手动override）----
    const raycaster = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    let drag: {
      joint: JointKey
      startX: number
      startY: number
      start: number
    } | null = null

    const userPose: Pose = { base: 2.2, shoulder: -0.55, elbow: -0.85, wrist: 0.9, grip: 0.5 }
    const current: Pose = { ...userPose }

    // ---- 鼠标追踪（IK 模式）----
    // 目标点 = 鼠标射线与"过机械臂工作区、面向相机"的虚拟平面的交点。
    // 手臂在 XZ 平面内追它：base 朝向目标方位，肩/肘/腕由两连杆 IK 解出。
    const plane = new THREE.Plane(new THREE.Vector3(4.4, 0.6, 6.4).normalize(), 0)
    const planePoint = new THREE.Vector3()
    const mouse = new THREE.Vector2()
    let trackTarget: { x: number; z: number; y: number } | null = null

    const planeCenter = new THREE.Vector3(-0.2, 0.6, 0)
    // plane 常数项：让平面过 planeCenter
    plane.constant = -planeCenter.dot(plane.normal)

    const updateTrackTarget = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      // 鼠标在容器内才追踪；出界返回 null（动画循环据此回落到待机呼吸）
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        trackTarget = null
        return
      }
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      if (raycaster.ray.intersectPlane(plane, planePoint)) {
        trackTarget = { x: planePoint.x, z: planePoint.z, y: planePoint.y }
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      if (drag) {
        const dy = (e.clientY - drag.startY) / mount.clientHeight
        const dx = (e.clientX - drag.startX) / mount.clientWidth
        const [min, max] = JOINT_RANGE[drag.joint]
        let value: number
        if (drag.joint === 'base') {
          value = drag.start + dx * 6 // 横拖 → 转身
        } else if (drag.joint === 'grip') {
          value = drag.start - dy * 3 // 竖拖 → 开合
        } else {
          value = drag.start - dy * 3.5 // 竖拖 → 俯仰
        }
        userPose[drag.joint] = clamp(value, min, max)
        return
      }
      // 空闲状态下鼠标移动 → 更新 IK 追踪目标
      updateTrackTarget(e)
    }

    const onPointerDown = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(ndc, camera)
      const hits = raycaster.intersectObjects(hitMeshes, false)
      if (hits.length > 0) {
        const joint = hits[0].object.userData.joint as JointKey
        drag = {
          joint,
          startX: e.clientX,
          startY: e.clientY,
          start: current[joint],
        }
      }
    }

    const onPointerUp = () => {
      drag = null
    }

    const onPointerLeave = () => {
      trackTarget = null // 鼠标离开画面 → 回待机
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    renderer.domElement.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)

    // ---- 动画循环 ----
    const applyPose = (p: Pose) => {
      base.rotation.y = p.base
      shoulder.rotation.x = p.shoulder
      elbow.rotation.x = p.elbow
      wrist.rotation.x = p.wrist
      gripL.position.x = 0.13 + p.grip * 0.16
      gripR.position.x = -0.13 - p.grip * 0.16
    }
    applyPose(current)

    const clock = new THREE.Clock()
    let raf = 0

    const animate = () => {
      const t = clock.getElapsedTime()

      if (drag) {
        // 手动扳关节：直接跟随用户姿态
        const k = 0.3
        for (const key of Object.keys(current) as JointKey[]) {
          current[key] += (userPose[key] - current[key]) * k
        }
      } else if (trackTarget && !reduceMotion) {
        // IK 追鼠标：把目标收敛到工作包络内再解算
        const shoulderY = -1.66 + 1.02 // 肩关节世界高度（arm.y + 肩局部y）
        const wx = trackTarget.x
        const wz = trackTarget.z
        const wy = clamp(trackTarget.y, shoulderY - 1.2, shoulderY + 1.9)
        const baseYaw = Math.atan2(wx, wz) // 基座 y 旋转使臂平面朝向目标方位
        let dx = Math.hypot(wx, wz) // 目标在臂平面内的水平距离
        const dy = wy - shoulderY
        // 极坐标收敛到可达环带内（留余量防抖，方向保持不变）
        const maxReach = (L1 + L2) * 0.98
        const minReach = Math.abs(L1 - L2) + 0.35
        const r = Math.hypot(dx, dy)
        if (r > maxReach) {
          const s = maxReach / r
          dx *= s
        } else if (r < minReach && r > 0.001) {
          const s = minReach / r
          dx *= s
        }
        const ik = solveIK(dx, dy)
        if (ik) {
          const target: Pose = {
            base: baseYaw,
            shoulder: clamp(ik.shoulder, ...JOINT_RANGE.shoulder),
            elbow: clamp(ik.elbow, ...JOINT_RANGE.elbow),
            // 腕部补偿：让夹爪保持指向目标（连杆夹角 + 竖直补偿）
            wrist: clamp(-(ik.shoulder + ik.elbow) * 0.55, ...JOINT_RANGE.wrist),
            grip: 0.5 + Math.sin(t * 2.2) * 0.18, // 伸取时夹爪轻微开合，像在"够"
          }
          const k = 0.085 // 追踪平滑度（越小越柔和）
          for (const key of Object.keys(current) as JointKey[]) {
            current[key] += (target[key] - current[key]) * k
          }
        }
      } else {
        // 待机呼吸
        const target = idlePose(t)
        const k = 0.04
        for (const key of Object.keys(current) as JointKey[]) {
          current[key] += (target[key] - current[key]) * k
        }
      }
      applyPose(current)

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
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
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

  return <div ref={mountRef} className={`arm-canvas ${className}`.trim()} />
}
