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
          
          {/* CLEANER INFO GRID */}
          <div className="info-grid">
            
            {/* Find Us */}
            <div className="info-card">
              <div className="info-header">
                <span className="info-icon">📍</span>
                <h3>FIND US</h3>
              </div>
              <div className="info-body">
                <p>Peninsula Center Mall</p>
                <p>Suite 48C</p>
                <p>44332 Sterling Highway</p>
                <p>Soldotna, AK 99669</p>
              </div>
            </div>

            {/* Hours - Combined */}
            <div className="info-card hours-card">
              <div className="info-header">
                <span className="info-icon">🕐</span>
                <h3>HOURS</h3>
              </div>
              <div className="info-body">
                <div className="hours-block">
                  <span className="season-tag winter">Winter</span>
                  <p>Mon - Sat: 11:00 AM - 6:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
                <div className="hours-block">
                  <span className="season-tag summer">Summer</span>
                  <p>Mon - Sat: 10:00 AM - 7:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>

            {/* Say Hello */}
            <div className="info-card">
              <div className="info-header">
                <span className="info-icon">📱</span>
                <h3>SAY HELLO</h3>
              </div>
              <div className="info-body">
                <p>Drop by the shop</p>
                <p>
                  <a href="https://instagram.com/hartboysskateshop" target="_blank" rel="noreferrer">
                    DM @hartboysskateshop
                  </a>
                </p>
                <p>Or just come hang 🤙</p>
              </div>
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
