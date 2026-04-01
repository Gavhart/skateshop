import { useEffect } from 'react'

export function useScrollReveal(deps: any[] = []) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            // Once revealed, stop observing
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )

    // Small delay so DOM is fully rendered
    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal:not(.revealed)').forEach(el => {
        observer.observe(el)
      })
    }, 50)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, deps)
}
