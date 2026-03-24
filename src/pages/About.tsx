import { Link } from 'react-router-dom'

function About() {
  return (
    <div className="page about-page">
      <div className="page-header">
        <h1 className="glitch" data-text="OUR STORY">OUR STORY</h1>
        <p>Small town roots. Big Alaska dreams.</p>
      </div>

      <section className="owners-section">
        <h3>MEET BRANDON</h3>
        <p className="owners-intro">From Oregon sidewalks to Soldotna streets — a family passion</p>
        
        <div className="owners-grid">
          <div className="owner-card story-card">
            <div className="owner-image glitch-box">
              <img src="/owner1.jpg" alt="Brandon Hart" />
              <div className="tape-corner"></div>
              <div className="image-overlay">
                <span>00:12:42</span>
              </div>
            </div>
            
            <div className="story-content">
              <h4>Brandon Hart</h4>
              <p className="owner-role">Founder / Instructor</p>
              
              <div className="story-text">
                <p>
                  It started in a <strong>small Oregon town</strong>. No skatepark nearby, just cracked sidewalks 
                  and empty parking lots. That's where young Brandon first stepped on a board — and never wanted to step off.
                </p>
                
                <p>
                  Since moving to <strong>Soldotna years ago</strong>, that love for skating never faded. 
                  It only grew into something bigger: a dream of sharing this passion with others. 
                  Teaching kids their first push. Helping nervous parents feel confident. 
                  Building something real for this community.
                </p>
                
                <p>
                  Hart Boys isn't a corporate chain. It's a <strong>family-owned business</strong> run by skaters 
                  who actually care. Every product recommendation, every Saturday class, every conversation 
                  at the counter — it comes from decades of real experience and love for this sport.
                </p>
                
                <p className="mission">
                  "Skating gave me freedom as a kid. I just want to pass that on to the next generation out here."
                </p>
              </div>
              
              <div className="owner-details">
                <span>🏔️ Oregon → Alaska</span>
                <span>🛹 20+ years skating</span>
                <span>👨‍👩‍👧 Family owned</span>
              </div>
              
              <div className="owner-social">
                <a href="https://instagram.com/hartboysskateshop" target="_blank" rel="noreferrer">
                  Follow along @hartboysskateshop
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shop-gallery">
        <h3>THE SHOP</h3>
        <div className="photo-grid">
          <div className="photo-item large glitch-box">
            <img src="/shop-front.jpeg" alt="Store Front" />
            <div className="tape-corner"></div>
            <div className="image-overlay">
              <span>00:08:15</span>
            </div>
            <span className="photo-label">Peninsula Center Mall</span>
          </div>
          <div className="photo-item glitch-box">
            <img src="/shop-inside.jpeg" alt="Inside Shop" />
            <div className="tape-corner"></div>
            <div className="image-overlay">
              <span>00:15:33</span>
            </div>
            <span className="photo-label">Deck Wall</span>
          </div>
          <div className="photo-item glitch-box">
            <img src="/shop-classes.jpeg" alt="Classes" />
            <div className="tape-corner"></div>
            <div className="image-overlay">
              <span>00:22:08</span>
            </div>
            <span className="photo-label">Shop</span>
          </div>
        </div>
      </section>

      <section className="about-content">
        <div className="about-text">
          <h2>Now Open in Soldotna</h2>
          <p>
            Whether you're stepping on a board for the first time or looking to level up your tricks, 
            we got you. Gear, guidance, and a genuine love for the sport — that's what you'll find at Hart Boys.
          </p>
          <p>
            This is more than retail. It's a place for the community to gather, learn, and grow. 
            From free beginner classes to honest gear recommendations, we're here for skaters at every level.
          </p>
          
          <div className="about-info">
            <div className="info-item">
              <h4>📍 FIND US</h4>
              <p>Peninsula Center Mall<br />Suite 48C<br />44332 Sterling Highway<br />Soldotna, AK 99669</p>
            </div>
            <div className="info-item">
              <h4>🕐 HOURS</h4>
              <p>Monday - Saturday<br />10:00 AM - 8:00 PM<br />Sunday<br />Closed</p>
            </div>
            <div className="info-item">
              <h4>📱 SAY HELLO</h4>
              <p>Drop by the shop<br />DM @hartboysskateshop<br />Or just come hang 🤙</p>
            </div>
          </div>
          
          <div className="about-cta">
            <Link to="/classes" className="btn btn-primary">TAKE A CLASS</Link>
            <Link to="/shop" className="btn btn-secondary">CHECK THE SHOP</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
