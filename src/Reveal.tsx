import type { ReactNode } from 'react'
import { useReveal } from './useReveal'

export function Reveal({
  children,
  className = '',
  as: Tag = 'div',
  id,
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'article' | 'figure'
  id?: string
}) {
  const ref = useReveal<HTMLDivElement>()
  return (
    <Tag ref={ref} id={id} className={`reveal ${className}`.trim()}>
      {children}
    </Tag>
  )
}
