import { useState, useEffect, useRef } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']
const PARTICLES = ['🛹','🔥','⚡','✦','🤘','💀','⭐','🛹','🔥','⚡','✦','🤘']

function KonamiOverlay({ onDone }: { onDone: () => void }) {
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    emoji: PARTICLES[i % PARTICLES.length],
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 1.2 + Math.random() * 1,
    size: 1.2 + Math.random() * 1.8,
    drift: (Math.random() - 0.5) * 120,
  }))

  useEffect(() => {
    const t = setTimeout(onDone, 3200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.55)',
    }}>
      <style>{`
        @keyframes konamiFloat {
          0%   { transform: translateY(110vh) translateX(0) rotate(0deg); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(-10vh) translateX(var(--drift)) rotate(360deg); opacity: 0; }
        }
        @keyframes konamiPop {
          0%   { transform: scale(0.4); opacity: 0; }
          15%  { transform: scale(1.15); opacity: 1; }
          25%  { transform: scale(0.95); }
          35%  { transform: scale(1.05); }
          50%  { transform: scale(1); opacity: 1; }
          80%  { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.1); opacity: 0; }
        }
      `}</style>

      {/* Floating emoji confetti */}
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.left}%`,
          bottom: 0,
          fontSize: `${p.size}rem`,
          // @ts-ignore
          '--drift': `${p.drift}px`,
          animation: `konamiFloat ${p.duration}s ease-out ${p.delay}s both`,
        }}>
          {p.emoji}
        </div>
      ))}

      {/* Center flash */}
      <div style={{
        animation: 'konamiPop 3s ease forwards',
        textAlign: 'center',
        userSelect: 'none',
      }}>
        <div style={{ fontSize: '5rem', marginBottom: '0.5rem' }}>🛹</div>
        <div style={{
          fontSize: 'clamp(2rem, 8vw, 4rem)',
          fontWeight: 900,
          color: '#c9a961',
          letterSpacing: '0.1em',
          textShadow: '0 0 40px #c9a96188',
        }}>
          SKATE OR DIE
        </div>
        <div style={{ color: '#555', fontSize: '0.85rem', marginTop: '0.75rem', letterSpacing: '0.12em' }}>
          ↑↑↓↓←→←→BA
        </div>
      </div>
    </div>
  )
}

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [konami, setKonami] = useState(false)
  const konamiProgress = useRef(0)
  const clickCount = useRef(0)
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Konami code listener
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === KONAMI[konamiProgress.current]) {
        konamiProgress.current += 1
        if (konamiProgress.current === KONAMI.length) {
          konamiProgress.current = 0
          setKonami(true)
        }
      } else {
        konamiProgress.current = e.key === KONAMI[0] ? 1 : 0
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function handleLogoTap(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    clickCount.current += 1
    if (clickTimer.current) clearTimeout(clickTimer.current)
    if (clickCount.current >= 3) {
      clickCount.current = 0
      navigate('/admin')
    } else {
      clickTimer.current = setTimeout(() => { clickCount.current = 0 }, 2000)
    }
  }

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

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
      {konami && <KonamiOverlay onDone={() => setKonami(false)} />}

      <nav className="navbar">
        <Link to="/" className="logo" onClick={handleLogoTap} onTouchEnd={handleLogoTap}>
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
