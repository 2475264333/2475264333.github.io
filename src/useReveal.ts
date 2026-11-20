import { useEffect, useRef } from 'react'

/**
 * 滚动渐显：元素进入视口后加 .visible 类。
 * IntersectionObserver 的好处是浏览器原生支持，
 * 不需要在 scroll 事件里做高频计算，性能几乎为零成本。
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // 保险丝：浏览器不支持 IntersectionObserver 时直接显示，内容永不隐身
    if (!('IntersectionObserver' in window)) {
      el.classList.add('visible')
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.18 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}
