import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

export default function NavSearch({
  id,
  className = '',
  onSubmitExtra,
}: {
  id: string
  className?: string
  onSubmitExtra?: () => void
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [q, setQ] = useState('')

  useEffect(() => {
    if (location.pathname === '/shop') {
      setQ(searchParams.get('q') || '')
    }
  }, [location.pathname, searchParams])

  const goToResults = (value: string, replace: boolean) => {
    const term = value.trim()
    navigate(term ? `/shop?q=${encodeURIComponent(term)}` : '/shop', { replace })
  }

  return (
    <form
      className={`nav-search ${className}`.trim()}
      role="search"
      onSubmit={e => {
        e.preventDefault()
        goToResults(q, false)
        onSubmitExtra?.()
      }}
    >
      <svg className="nav-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        id={id}
        type="search"
        placeholder="Search gear..."
        value={q}
        onChange={e => {
          const value = e.target.value
          setQ(value)
          if (location.pathname === '/shop') goToResults(value, true)
        }}
        aria-label="Search products"
        autoComplete="off"
      />
      <button type="submit" className="nav-search-submit" aria-label="Submit search">Go</button>
    </form>
  )
}
