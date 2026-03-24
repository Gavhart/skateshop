import { Link } from 'react-router-dom'

function Updates() {
  return (
    <div className="page updates-page">
      <div className="page-header">
        <h1 className="glitch" data-text="UPDATES">UPDATES</h1>
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
          
          {/* YOUR BEHOLD WIDGET */}
          <div className="behold-container">
            <behold-widget feed-id="aIDGUZuwy7im6UeCTBMW"></behold-widget>
            <script dangerouslySetInnerHTML={{
              __html: `(() => {
                const d=document,s=d.createElement("script");
                s.type="module";
                s.src="https://w.behold.so/widget.js";
                d.head.append(s);
              })();`
            }} />
          </div>
        </div>
        
        <div className="hashtag-box">
          <p>Tag <strong>#hartboysskateshop</strong> to be featured!</p>
          <span className="hashtag-icon">📸</span>
        </div>
      </section>
      
      <div className="gallery-back">
        <Link to="/" className="btn btn-secondary">← BACK TO HOME</Link>
      </div>
    </div>
  )
}

export default Updates
