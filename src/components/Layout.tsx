import { useState, useEffect, useRef } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const clickCount = useRef(0)
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleLogoClick(e: React.MouseEvent) {
    clickCount.current += 1
    if (clickTimer.current) clearTimeout(clickTimer.current)
    if (clickCount.current >= 3) {
      clickCount.current = 0
      e.preventDefault()
      navigate('/admin')
    } else {
      e.preventDefault()
      clickTimer.current = setTimeout(() => { clickCount.current = 0 }, 800)
    }
  }

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const navLinks = [
    { to: '/', label: 'HOME' },
    { to: '/shop', label: 'SHOP' },
    { to: '/build', label: 'BUILD A BOARD' },
    { to: '/updates', label: 'UPDATES' },
    { to: '/about', label: 'ABOUT' },
    { to: '/classes', label: 'CLASSES' },
    { to: '/wall', label: 'WALL OF STOKE' },
  ]

  return (
    <div className="site">
      <nav className="navbar">
        <Link to="/" className="logo" onClick={handleLogoClick}>
          <img src="/logo.jpeg" alt="Hart Boys" className="logo-img" />
        </Link>

        {/* Desktop nav */}
        <div className="nav-links">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className={location.pathname === to ? 'active' : ''}>
              {label}
            </Link>
          ))}
        </div>

        {/* Hamburger button — mobile only */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span className={`ham-bar ${menuOpen ? 'open' : ''}`} />
          <span className={`ham-bar ${menuOpen ? 'open' : ''}`} />
          <span className={`ham-bar ${menuOpen ? 'open' : ''}`} />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />
      )}

      {/* Mobile menu drawer */}
      <div className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`}>
        <div className="mobile-menu-inner">
          <img src="/logo.jpeg" alt="Hart Boys" className="mobile-menu-logo" />
          <nav className="mobile-nav-links">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`mobile-nav-link ${location.pathname === to ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="mobile-menu-footer">
            <a href="https://instagram.com/hartboysskateshop" target="_blank" rel="noreferrer">INSTAGRAM</a>
            <a href="https://facebook.com/hartboysskateshop" target="_blank" rel="noreferrer">FACEBOOK</a>
          </div>
        </div>
      </div>

      <main>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <img src="/logo.jpeg" alt="Hart Boys" className="footer-logo" />
            <p>Peninsula Center Mall<br />Suite 48C • Soldotna, AK<br />Mon–Sat: 10AM–7PM</p>
          </div>
          <div className="footer-links">
            <a href="https://instagram.com/hartboysskateshop">INSTAGRAM</a>
            <a href="https://facebook.com/hartboysskateshop">FACEBOOK</a>
          </div>
        </div>
        <p className="copyright">© 2025 HART BOYS SKATE SHOP • MON–SAT 10AM–7PM</p>
      </footer>
    </div>
  )
}

export default Layout
