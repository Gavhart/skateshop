import { useEffect } from 'react'

export function useScrollReveal(deps: any[] = []) {
  useEffect(() => {
    const revealAll = () => {
      document.querySelectorAll('.reveal:not(.revealed)').forEach(el => {
        el.classList.add('revealed')
      })
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      // No bottom margin, lower threshold — fires as soon as any part is visible
      { threshold: 0.01, rootMargin: '0px' }
    )

    // Wait for React to finish painting, then start observing
    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal:not(.revealed)').forEach(el => {
        observer.observe(el)
      })
    }, 80)

    // Hard fallback: if observer hasn't fired after 600ms, reveal everything
    const fallback = setTimeout(revealAll, 600)

    return () => {
      clearTimeout(timer)
      clearTimeout(fallback)
      observer.disconnect()
    }
  }, deps)
}
