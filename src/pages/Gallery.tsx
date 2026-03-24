import { Link } from 'react-router-dom'

function Gallery() {
  return (
    <div className="page gallery-page">
      <div className="page-header">
        <h1 className="glitch" data-text="GALLERY">GALLERY</h1>
        <p>Follow @hartboysskateshop on Instagram</p>
      </div>
      
      <div className="instagram-section">
        <div className="instagram-header">
          <h2>📸 Latest from the Shop</h2>
          <a 
            href="https://instagram.com/hartboysskateshop" 
            target="_blank" 
            rel="noreferrer"
            className="btn btn-primary"
          >
            FOLLOW ON INSTAGRAM
          </a>
        </div>
        
        {/* SnapWidget Embed - Get your code from snapwidget.com */}
        <div className="instagram-feed">
          <div style={{ 
            padding: '4rem', 
            textAlign: 'center', 
            background: 'var(--bg2)',
            border: '2px dashed var(--accent)',
            color: 'var(--muted)'
          }}>
            <p>🛹 Instagram feed coming soon!</p>
            <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
              Get your SnapWidget code from <a href="https://snapwidget.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>snapwidget.com</a>
            </p>
          </div>
        </div>
        
        <p className="instagram-note">
          Tag your photos <strong>#hartboysskateshop</strong> to be featured!
        </p>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link to="/" className="btn btn-secondary">BACK TO HOME</Link>
      </div>
    </div>
  )
}

export default Gallery