import { Link } from 'react-router-dom'

function Gallery() {
  return (
    <div className="page gallery-page">
      <div className="page-header">
        <h1 className="glitch" data-text="GALLERY">GALLERY</h1>
        <p>Follow @hartboysskateshop on Instagram</p>
      </div>
      
      <section className="instagram-section">
        <div className="instagram-header">
          <h2>📸 LIVE FROM THE SHOP</h2>
          <p>Real moments. Real skaters. Real Alaska.</p>
          <a 
            href="https://instagram.com/hartboysskateshop" 
            target="_blank" 
            rel="noreferrer"
            className="btn btn-primary"
          >
            FOLLOW @HARTBOYSSKATESHOP
          </a>
        </div>
        
        {/* Behold.so Instagram Feed */}
        <div className="instagram-feed glitch-box">
          <div className="tape-corner"></div>
          <div className="image-overlay">
            <span>REC ● LIVE</span>
          </div>
          
          {/* Replace this with your Behold embed script */}
          <div className="feed-placeholder">
            <span className="feed-icon">📡</span>
            <p className="feed-status">CONNECTING BEHOLD FEED...</p>
            <p className="feed-instruction">
              Connect your Instagram to <a href="https://behold.so" target="_blank" rel="noreferrer">behold.so</a> then paste your embed script here.
            </p>
            <a href="https://behold.so" target="_blank" rel="noreferrer" className="btn btn-secondary">
              SET UP BEHOLD
            </a>
          </div>
          
          {/* 
            Your Behold embed will look like this:
            <div data-behold-id="YOUR-BEHOLD-ID"></div>
            <script src="https://behold.so/embed/YOUR-SCRIPT.js" async></script>
          */}
        </div>
        
        <div className="hashtag-box">
          <p>Tag <strong>#hartboysskateshop</strong> to be featured.</p>
          <span className="hashtag-icon">📸</span>
        </div>
      </section>
      
      <div className="gallery-back">
        <Link to="/" className="btn btn-secondary">← BACK TO HOME</Link>
      </div>
    </div>
  )
}

export default Gallery
