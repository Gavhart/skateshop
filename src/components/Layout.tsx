import { Outlet, Link, useLocation } from 'react-router-dom'

function Layout() {
  const location = useLocation()
  
  return (
    <div className="site">
      <nav className="navbar">
        <Link to="/" className="logo">
          <img src="/logo.jpeg" alt="Hart Boys" className="logo-img" />
        </Link>
        
        <div className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>HOME</Link>
          <Link to="/shop" className={location.pathname === '/shop' ? 'active' : ''}>SHOP</Link>
          <Link to="/updates" className={location.pathname === '/updates' ? 'active' : ''}>UPDATES</Link>
          <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>ABOUT</Link>
          <Link to="/classes" className={location.pathname === '/classes' ? 'active' : ''}>CLASSES</Link>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <img src="/logo.jpeg" alt="Hart Boys" className="footer-logo" />
            <p>Peninsula Center Mall<br />Suite 48C • Soldotna, AK<br />Now Open</p>
          </div>
          <div className="footer-links">
            <a href="https://instagram.com/hartboysskateshop">INSTAGRAM</a>
            <a href="https://facebook.com/hartboysskateshop">FACEBOOK</a>
          </div>
        </div>
        <p className="copyright">© 2025 HART BOYS SKATE SHOP • NOW OPEN</p>
      </footer>
    </div>
  )
}

export default Layout