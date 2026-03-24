
import { Link } from 'react-router-dom'

const BRANDS = [
  'POWELL PERALTA', 'SANTA CRUZ', 'CREATURE', 'INDEPENDENT',
  'SPITFIRE', 'NIKE SB', 'VANS', 'BAKER', 'GIRL', 'CHOCOLATE',
  'BONES', 'REAL', 'ALIEN WORKSHOP', 'QUASI', 'HABITAT'
]

function Home() {
  return (
    <>
      {/* HERO - LOGO AT TOP */}
      <section className="hero">
        <div className="grain"></div>
        
        <div className="x-mark x-1"></div>
        <div className="x-mark x-2"></div>
        <div className="x-mark x-3"></div>
        <div className="x-mark x-4"></div>
        
        <div className="hero-logo">
          <img src="/logo.png" alt="Hart Boys Skate Shop" className="main-logo" />
        </div>
        
        <div className="tagline now-open">
          <span>📍 SOLDOTNA, ALASKA</span>
          <span className="slash">/</span>
          <span className="open-badge">NOW OPEN</span>
        </div>
        
        <p className="store-location">Peninsula Center Mall • Suite 48C</p>

        <div className="hero-buttons">
          <Link to="/shop" className="btn btn-primary">SHOP NOW</Link>
          <Link to="/classes" className="btn btn-secondary">SKATE CLASSES</Link>
        </div>
      </section>

      {/* MARQUEE - BRANDS FLOATING */}
      <div className="marquee-wrap">
        <div className="marquee">
          {[...BRANDS, ...BRANDS, ...BRANDS].map((brand, i) => (
            <span key={i}>{brand} <span className="star">✦</span></span>
          ))}
        </div>
      </div>

      {/* FEATURES - MIDDLE */}
      <section className="features">
        <div className="feature-card">
          <span className="feature-icon">🛹</span>
          <h3>VISIT US</h3>
          <p>Peninsula Center Mall<br />Suite 48C, Soldotna<br />Mon-Sat 10am-8pm</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">⚡</span>
          <h3>TOP BRANDS</h3>
          <p>Premium decks, trucks<br />Wheels & apparel<br />20+ brands in stock</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🔥</span>
          <h3>SKATE CLASSES</h3>
          <p>Beginner to advanced<br />Private & group lessons<br />Book online</p>
        </div>
      </section>

      {/* INSTAGRAM CTA - AT BOTTOM (BEFORE FOOTER) */}
      <section className="instagram-cta">
        <h2>FOLLOW THE DROP</h2>
        <p>New gear & restocks daily</p>
        <a href="https://instagram.com/hartboysskateshop" className="btn btn-primary" target="_blank" rel="noreferrer">
          📸 @hartboysskateshop
        </a>
      </section>
    </>
  )
}

export default Home