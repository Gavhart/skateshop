import { Link } from 'react-router-dom'
import { useState } from 'react'

const GALLERY = [
  { src: '/shop-front.jpeg', label: 'Peninsula Center Mall' },
  { src: '/shop-inside.jpeg', label: 'Deck Wall' },
  { src: '/shop-classes.jpeg', label: 'Shop' },
]

function About() {
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null)

  return (
    <div className="page about-page">
      <style>{`
        /* ── Page header ── */
        .about-page .page-header {
          padding-bottom: 3rem;
        }

        /* ── Owner section: wide two-column ── */
        .about-owner-wrap {
          max-width: 1100px;
          margin: 0 auto 5rem;
          padding: 0 2rem;
        }

        .about-owner-intro {
          text-align: center;
          font-size: 1.1rem;
          color: #888;
          font-style: italic;
          margin-bottom: 3rem;
        }

        .about-owner-layout {
          display: grid;
          grid-template-columns: 420px 1fr;
          gap: 4rem;
          align-items: start;
        }

        @media (max-width: 960px) {
          .about-owner-layout {
            grid-template-columns: 320px 1fr;
            gap: 2.5rem;
          }
        }

        @media (max-width: 700px) {
          .about-owner-layout {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .about-owner-wrap {
            padding: 0 1.25rem;
          }
        }

        /* ── Big portrait image ── */
        .about-portrait {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          background: #1a1a1a;
          border: 2px solid #c9a961;
          box-shadow:
            6px 6px 0 rgba(201,169,97,0.25),
            12px 12px 0 rgba(201,169,97,0.1);
          overflow: hidden;
        }

        .about-portrait img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          display: block;
          filter: contrast(1.05) saturate(0.95);
          transition: transform 0.6s ease;
        }

        .about-portrait:hover img {
          transform: scale(1.03);
        }

        /* Tape strip */
        .about-portrait .tape-corner {
          position: absolute;
          top: -10px;
          right: 24px;
          width: 70px;
          height: 26px;
          background: rgba(255,255,255,0.15);
          transform: rotate(12deg);
          backdrop-filter: blur(2px);
          z-index: 2;
        }

        /* VHS badge */
        .about-portrait .vhs-badge {
          position: absolute;
          bottom: 14px;
          left: 14px;
          background: rgba(0,0,0,0.85);
          padding: 3px 10px;
          font-family: 'Courier New', monospace;
          font-size: 0.7rem;
          color: #ff3e00;
          letter-spacing: 0.1em;
          border: 1px solid #333;
        }

        .about-portrait .vhs-badge::before {
          content: 'REC ● ';
          color: #ff0000;
          animation: rec-blink 1s infinite;
        }

        /* Gold accent bar under image */
        .about-portrait-bar {
          height: 4px;
          background: linear-gradient(90deg, #c9a961, transparent);
          margin-top: 0;
        }

        /* ── Story side ── */
        .about-story-side {
          padding-top: 0.5rem;
        }

        .about-story-name {
          font-family: 'Bebas Neue', cursive;
          font-size: 3rem;
          letter-spacing: 0.04em;
          color: #fff;
          margin: 0 0 0.1rem;
          line-height: 1;
        }

        .about-story-role {
          color: #c9a961;
          font-size: 0.85rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-bottom: 1.75rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .about-story-role::after {
          content: '';
          display: block;
          flex: 1;
          height: 1px;
          background: rgba(201,169,97,0.3);
        }

        .about-story-body p {
          color: #ccc;
          line-height: 1.9;
          font-size: 1.05rem;
          margin-bottom: 1.4rem;
        }

        .about-story-body p strong {
          color: #c9a961;
          font-weight: 600;
        }

        .about-quote {
          border-left: 3px solid #c9a961;
          padding: 1.25rem 1.5rem;
          margin: 2rem 0;
          background: rgba(201,169,97,0.05);
          font-style: italic;
          color: #c9a961;
          font-size: 1.05rem;
          line-height: 1.7;
        }

        .about-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin: 1.5rem 0 1.75rem;
        }

        .about-tag {
          background: rgba(201,169,97,0.1);
          border: 1px solid rgba(201,169,97,0.25);
          color: #c9a961;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
        }

        .about-ig-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #c9a961;
          text-decoration: none;
          font-size: 0.9rem;
          border-bottom: 1px solid rgba(201,169,97,0.4);
          padding-bottom: 2px;
          transition: border-color 0.2s;
        }

        .about-ig-link:hover {
          border-color: #c9a961;
        }

        /* ── Gallery ── */
        .about-gallery-wrap {
          max-width: 1100px;
          margin: 0 auto 4rem;
          padding: 0 2rem;
        }

        .about-gallery-wrap h3 {
          font-family: 'Bebas Neue', cursive;
          font-size: 2rem;
          letter-spacing: 0.1em;
          margin-bottom: 1.5rem;
          color: #fff;
        }

        .about-gallery-wrap .photo-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          grid-template-rows: auto auto;
          gap: 1rem;
          align-items: stretch;
        }

        .about-gallery-wrap .photo-item {
          height: 240px;
          overflow: hidden;
        }

        .about-gallery-wrap .photo-item.large {
          grid-row: span 2;
          height: 100%;
          min-height: 380px;
        }

        @media (max-width: 700px) {
          .about-gallery-wrap .photo-grid {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
          }
          .about-gallery-wrap .photo-item.large {
            grid-row: span 1;
            min-height: 240px;
          }
          .about-gallery-wrap .photo-item {
            height: 220px;
          }
        }

        /* ── Info section ── */
        .about-info-wrap {
          max-width: 1100px;
          margin: 0 auto 5rem;
          padding: 0 2rem;
        }

        .about-info-wrap h2 {
          font-family: 'Bebas Neue', cursive;
          font-size: 2.5rem;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }

        .about-info-lead {
          color: #888;
          font-size: 1.05rem;
          line-height: 1.8;
          max-width: 700px;
          margin-bottom: 2.5rem;
        }

        .about-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
          margin-bottom: 2.5rem;
        }

        @media (max-width: 767px) {
          .about-cards {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 1023px) and (min-width: 768px) {
          .about-cards {
            grid-template-columns: 1fr 1fr;
          }
        }

        .about-card {
          background: #141414;
          border: 1px solid #2a2a2a;
          border-radius: 12px;
          padding: 1.75rem;
          transition: border-color 0.25s, box-shadow 0.25s;
        }

        .about-card:hover {
          border-color: rgba(201,169,97,0.4);
          box-shadow: 0 0 20px rgba(201,169,97,0.08);
        }

        .about-card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .about-card-icon {
          font-size: 1.4rem;
        }

        .about-card-header h3 {
          font-family: 'Bebas Neue', cursive;
          font-size: 1.25rem;
          letter-spacing: 0.1em;
          margin: 0;
          color: #c9a961;
        }

        .about-card-body p {
          color: #999;
          font-size: 0.95rem;
          margin: 0.35rem 0;
          line-height: 1.5;
        }

        .about-season {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }

        .about-season.winter {
          background: rgba(100,150,255,0.15);
          color: #6496ff;
        }

        .about-season.summer {
          background: rgba(255,180,50,0.15);
          color: #ffb432;
        }

        .about-hours-block {
          margin-bottom: 1rem;
        }

        .maps-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: #c9a961;
          text-decoration: none;
          font-size: 0.82rem;
          margin-top: 0.75rem;
          border: 1px solid rgba(201,169,97,0.35);
          padding: 0.4rem 0.9rem;
          border-radius: 20px;
          transition: background 0.2s;
        }

        .maps-link:hover {
          background: rgba(201,169,97,0.1);
        }

        .contact-link {
          color: #c9a961;
          text-decoration: none;
        }

        .contact-link:hover {
          text-decoration: underline;
        }

        .about-cta-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        /* ── Centered info lead ── */
        .about-info-wrap {
          text-align: center;
        }
        .about-info-wrap h2 {
          text-align: center;
        }
        .about-info-lead {
          text-align: center;
          margin-left: auto;
          margin-right: auto;
        }
        .about-cards {
          text-align: left;
        }
        .about-cta-row {
          justify-content: center;
        }

        /* ── Clickable gallery ── */
        .about-gallery-wrap .photo-item {
          cursor: zoom-in;
        }

        /* ── Lightbox ── */
        .about-lightbox {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.92);
          backdrop-filter: blur(8px);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          animation: lb-fade-in 0.2s ease;
        }
        @keyframes lb-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .about-lightbox-inner {
          position: relative;
          max-width: min(900px, 90vw);
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          animation: lb-scale-in 0.2s ease;
        }
        @keyframes lb-scale-in {
          from { transform: scale(0.94); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        .about-lightbox-img {
          max-width: 100%;
          max-height: 75vh;
          object-fit: contain;
          border: 2px solid rgba(201,169,97,0.4);
          border-radius: 4px;
          display: block;
        }
        .about-lightbox-label {
          color: #c9a961;
          font-size: 0.85rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 600;
        }
        .about-lightbox-close {
          position: absolute;
          top: -14px;
          right: -14px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #1a1a1a;
          border: 1px solid #333;
          color: #aaa;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: color 0.15s, background 0.15s;
          line-height: 1;
        }
        .about-lightbox-close:hover {
          color: #fff;
          background: #2a2a2a;
        }

        /* Gallery nav arrows */
        .about-lightbox-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(10,10,10,0.7);
          border: 1px solid #333;
          color: #c9a961;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.2rem;
          transition: background 0.15s;
          user-select: none;
        }
        .about-lightbox-nav:hover { background: rgba(201,169,97,0.15); }
        .about-lightbox-prev { left: -56px; }
        .about-lightbox-next { right: -56px; }
        @media (max-width: 600px) {
          .about-lightbox-prev { left: -44px; }
          .about-lightbox-next { right: -44px; }
        }
      `}</style>

      {/* ── Page Header ── */}
      <div className="page-header">
        <h1 className="glitch" data-text="OUR STORY">OUR STORY</h1>
        <p>Small town roots. Big Alaska dreams.</p>
      </div>

      {/* ── Owner Section ── */}
      <section className="about-owner-wrap">
        <p className="about-owner-intro">From Oregon sidewalks to Soldotna streets — a family passion</p>

        <div className="about-owner-layout">

          {/* Big portrait */}
          <div>
            <div className="about-portrait">
              <img src="/owner1.jpg" alt="Brandon Hart" />
              <div className="tape-corner"></div>
              <div className="vhs-badge">00:12:42</div>
            </div>
            <div className="about-portrait-bar"></div>
          </div>

          {/* Story */}
          <div className="about-story-side">
            <h4 className="about-story-name">Brandon Hart</h4>
            <p className="about-story-role">Founder &amp; Instructor</p>

            <div className="about-story-body">
              <p>
                It started in a <strong>small Oregon town</strong>. No skatepark nearby — just cracked sidewalks
                and empty parking lots. That's where young Brandon first stepped on a board and never wanted to step off.
              </p>
              <p>
                Since moving to <strong>Soldotna years ago</strong>, that love for skating never faded.
                It only grew into something bigger: a dream of sharing this passion with the community.
                Teaching kids their first push. Helping nervous parents feel confident.
                Building something real for Alaska's Kenai Peninsula.
              </p>
              <p>
                Hart Boys isn't a corporate chain. It's a <strong>family-owned business</strong> run by skaters
                who actually care. Every product recommendation, every class, every conversation
                at the counter comes from decades of real experience and genuine love for the sport.
              </p>
            </div>

            <blockquote className="about-quote">
              "Skating gave me freedom as a kid. I just want to pass that on to the next generation out here."
            </blockquote>

            <div className="about-tags">
              <span className="about-tag">🏔️ Oregon → Alaska</span>
              <span className="about-tag">🛹 20+ years skating</span>
              <span className="about-tag">👨‍👩‍👧 Family owned</span>
            </div>

            <a
              href="https://instagram.com/hartboysskateshop"
              target="_blank"
              rel="noreferrer"
              className="about-ig-link"
            >
              📸 Follow @hartboysskateshop
            </a>
          </div>

        </div>
      </section>

      {/* ── Shop Gallery ── */}
      <section className="about-gallery-wrap">
        <h3>THE SHOP</h3>
        <div className="photo-grid">
          {GALLERY.map((photo, i) => (
            <div
              key={photo.src}
              className={`photo-item glitch-box${i === 0 ? ' large' : ''}`}
              onClick={() => setLightbox(photo)}
              title="Click to enlarge"
            >
              <img src={photo.src} alt={photo.label} />
              <div className="tape-corner"></div>
              <div className="image-overlay"><span>{i === 0 ? '00:08:15' : i === 1 ? '00:15:33' : '00:22:08'}</span></div>
              <span className="photo-label">{photo.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Lightbox ── */}
      {lightbox && (() => {
        const idx = GALLERY.findIndex(p => p.src === lightbox.src)
        const prev = GALLERY[(idx - 1 + GALLERY.length) % GALLERY.length]
        const next = GALLERY[(idx + 1) % GALLERY.length]
        return (
          <div className="about-lightbox" onClick={() => setLightbox(null)}>
            <div className="about-lightbox-inner" onClick={e => e.stopPropagation()}>
              <button className="about-lightbox-close" onClick={() => setLightbox(null)}>×</button>
              <button className="about-lightbox-nav about-lightbox-prev" onClick={() => setLightbox(prev)}>‹</button>
              <button className="about-lightbox-nav about-lightbox-next" onClick={() => setLightbox(next)}>›</button>
              <img src={lightbox.src} alt={lightbox.label} className="about-lightbox-img" />
              <span className="about-lightbox-label">{lightbox.label}</span>
            </div>
          </div>
        )
      })()}

      {/* ── Info + CTA ── */}
      <section className="about-info-wrap">
        <h2>Now Open in Soldotna</h2>
        <p className="about-info-lead">
          Whether you're stepping on a board for the first time or looking to level up your tricks,
          we got you. Gear, guidance, and a genuine love for the sport — that's what you'll find at Hart Boys.
        </p>

        <div className="about-cards">

          {/* Find Us */}
          <div className="about-card">
            <div className="about-card-header">
              <span className="about-card-icon">📍</span>
              <h3>FIND US</h3>
            </div>
            <div className="about-card-body">
              <p>Peninsula Center Mall</p>
              <p>Suite 48C</p>
              <p>44332 Sterling Highway</p>
              <p>Soldotna, AK 99669</p>
              <a
                className="maps-link"
                href="https://maps.google.com/?q=44332+Sterling+Highway+Soldotna+AK+99669"
                target="_blank"
                rel="noreferrer"
              >
                📍 Get Directions
              </a>
            </div>
          </div>

          {/* Hours */}
          <div className="about-card">
            <div className="about-card-header">
              <span className="about-card-icon">🕐</span>
              <h3>HOURS</h3>
            </div>
            <div className="about-card-body">
              <div className="about-hours-block">
                <span className="about-season winter">Winter</span>
                <p>Mon – Sat: 11:00 AM – 6:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
              <div className="about-hours-block">
                <span className="about-season summer">Summer</span>
                <p>Mon – Sat: 10:00 AM – 7:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>

          {/* Say Hello */}
          <div className="about-card">
            <div className="about-card-header">
              <span className="about-card-icon">📱</span>
              <h3>SAY HELLO</h3>
            </div>
            <div className="about-card-body">
              <p>
                <a href="tel:+19075550123" className="contact-link">📞 (907) 555-0123</a>
              </p>
              <p>
                <a href="https://instagram.com/hartboysskateshop" target="_blank" rel="noreferrer" className="contact-link">
                  📸 @hartboysskateshop
                </a>
              </p>
              <p>Or just come hang 🤙</p>
            </div>
          </div>

        </div>

        <div className="about-cta-row">
          <Link to="/classes" className="btn btn-primary">TAKE A CLASS</Link>
          <Link to="/shop" className="btn btn-secondary">CHECK THE SHOP</Link>
        </div>
      </section>
    </div>
  )
}

export default About
