import { useEffect, useState } from 'react'
import type { Theme } from './theme'

/**
 * 观察 <html data-theme> 属性（ThemeProvider 写入），
 * 让 three.js 场景在主题切换时拿到当前值并重读配色。
 * 用 MutationObserver 而非 Context：组件在 lazy 树里，直连 DOM 最简单可靠。
 */
export function useDataTheme(): Theme {
  const read = (): Theme =>
    document.documentElement.dataset.theme === 'night' ? 'night' : 'day'

  const [theme, setTheme] = useState<Theme>(read)

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(read()))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  return theme
}
