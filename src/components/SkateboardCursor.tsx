import { useEffect, useRef } from 'react'

export default function SkateboardCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const trailRef = useRef<HTMLDivElement[]>([])
  const rafRef = useRef<number>(0)
  const pos = useRef({ x: -100, y: -100 })
  const cur = useRef({ x: -100, y: -100 })

  useEffect(() => {
    // Only enable on pointer (non-touch) devices
    if (window.matchMedia('(pointer: coarse)').matches) return

    const el = cursorRef.current
    if (!el) return

    document.body.classList.add('custom-cursor-active')

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
    }

    const onEnterLink = () => el.classList.add('cursor-hover')
    const onLeaveLink = () => el.classList.remove('cursor-hover')

    document.addEventListener('mousemove', onMove)

    // Add hover effect on interactive elements
    const addHoverListeners = () => {
      document.querySelectorAll('a, button, [role="button"], select, input').forEach(el => {
        el.addEventListener('mouseenter', onEnterLink)
        el.addEventListener('mouseleave', onLeaveLink)
      })
    }
    addHoverListeners()

    // Smooth cursor with lerp
    const animate = () => {
      cur.current.x += (pos.current.x - cur.current.x) * 0.14
      cur.current.y += (pos.current.y - cur.current.y) * 0.14

      const dx = pos.current.x - cur.current.x
      const angle = Math.atan2(dx, 0) * (180 / Math.PI)

      el.style.transform = `translate(${cur.current.x - 16}px, ${cur.current.y - 16}px) rotate(${angle * 0.4 - 15}deg)`

      // Spawn trail particles occasionally
      if (Math.random() < 0.08) {
        spawnTrail(cur.current.x, cur.current.y)
      }

      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      document.removeEventListener('mousemove', onMove)
      document.body.classList.remove('custom-cursor-active')
    }
  }, [])

  const spawnTrail = (x: number, y: number) => {
    const trail = document.createElement('div')
    trail.className = 'cursor-trail'
    trail.style.left = `${x}px`
    trail.style.top = `${y}px`
    document.body.appendChild(trail)
    setTimeout(() => trail.remove(), 600)
  }

  return (
    <div ref={cursorRef} className="skate-cursor" aria-hidden="true">
      🛹
    </div>
  )
}
