import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../lib/shopify'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { isExcluded } from '../lib/filters'

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────
// To add a new post: copy one of the objects below, paste it at the TOP of the
// array, fill in your content, and save. Oldest posts drop off the bottom.
// Types: 'drop' | 'event' | 'news' | 'class'
const ANNOUNCEMENTS = [
  {
    type: 'news',
    date: 'April 2026',
    title: 'Family Visit + A Stop at the Shop',
    body: 'Was in the area visiting family and of course had to swing by Hart Boys. Love seeing what the guys have been building out here — the shop has a real feel to it. Good people, good product, good vibes. If you\'re ever passing through Soldotna, don\'t sleep on stopping in. Worth it every time.',
    cta: { label: 'COME FIND US', href: 'https://maps.google.com/?q=44332+Sterling+Highway+Soldotna+AK+99669' },
  },
  {
    type: 'drop',
    date: 'March 2025',
    title: 'Spring Drop Just Landed',
    body: 'Fresh decks, new wheels, and a bunch of apparel just hit the shelves. Come in and check it out — or shop online.',
    cta: { label: 'SHOP NOW', to: '/shop' },
  },
  {
    type: 'class',
    date: 'Ongoing',
    title: 'Beginner Classes Are Back',
    body: 'Free beginner sessions are running again. If you\'ve never stepped on a board or want to teach your kid — this is the spot. Small groups, relaxed vibe.',
    cta: { label: 'SIGN UP', to: '/classes' },
  },
  {
    type: 'news',
    date: 'Winter 2025',
    title: 'Now Open at Peninsula Center Mall',
    body: 'Hart Boys is officially open at Suite 48C in the Peninsula Center Mall, Soldotna. Come find us, say hi, and support local.',
    cta: { label: 'GET DIRECTIONS', href: 'https://maps.google.com/?q=44332+Sterling+Highway+Soldotna+AK+99669' },
  },
  {
    type: 'event',
    date: 'Coming Soon',
    title: 'Community Skate Session',
    body: 'We\'re planning a community session at Soldotna Skatepark. All ages and skill levels welcome. Follow our Instagram for the date announcement.',
    cta: { label: 'FOLLOW US', href: 'https://instagram.com/hartboysskateshop' },
  },
]

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  drop:  { label: 'NEW DROP',  color: '#C9A961', icon: '🔥' },
  event: { label: 'EVENT',     color: '#3b82f6', icon: '📅' },
  news:  { label: 'NEWS',      color: '#22c55e', icon: '📢' },
  class: { label: 'CLASSES',   color: '#a855f7', icon: '🛹' },
}

export default function Updates() {
  const [recentProducts, setRecentProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  useScrollReveal([recentProducts])

  useEffect(() => {
    if (!document.querySelector('script[src="https://w.behold.so/widget.js"]')) {
      const script = document.createElement('script')
      script.type = 'module'
      script.src = 'https://w.behold.so/widget.js'
      document.head.appendChild(script)
    }
  }, [])

  useEffect(() => {
    getProducts()
      .then(products => {
        setRecentProducts(products.filter(p => !isExcluded(p)).slice(0, 4))
        setLoadingProducts(false)
      })
      .catch(() => setLoadingProducts(false))
  }, [])

  return (
    <div className="page updates-page">
      <style>{`
        /* ── Page layout ── */
        .updates-wrap {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 2rem 5rem;
        }

        /* ── Announcements ── */
        .announce-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin-bottom: 4rem;
        }
        @media (max-width: 767px) {
          .announce-grid { grid-template-columns: 1fr; }
          .updates-wrap { padding: 0 1.25rem 4rem; }
        }

        .announce-card {
          background: #111;
          border: 1px solid #222;
          border-radius: 12px;
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: border-color 0.25s, box-shadow 0.25s;
          position: relative;
          overflow: hidden;
        }
        .announce-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--stripe-color);
        }
        .announce-card:hover {
          border-color: #333;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }

        .announce-meta {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }
        .announce-badge {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.15em;
          padding: 0.25rem 0.65rem;
          border-radius: 20px;
          background: rgba(255,255,255,0.06);
          color: var(--stripe-color);
          border: 1px solid var(--stripe-color);
          opacity: 0.9;
        }
        .announce-date {
          font-size: 0.75rem;
          color: #555;
          letter-spacing: 0.06em;
        }

        .announce-title {
          font-family: 'Bebas Neue', cursive;
          font-size: 1.6rem;
          letter-spacing: 0.04em;
          color: #f5f1e8;
          line-height: 1.1;
        }

        .announce-body {
          color: #888;
          font-size: 0.9rem;
          line-height: 1.7;
          flex: 1;
        }

        .announce-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--stripe-color);
          text-decoration: none;
          border: 1px solid var(--stripe-color);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          width: fit-content;
          transition: background 0.2s, color 0.2s;
        }
        .announce-cta:hover {
          background: var(--stripe-color);
          color: #0a0a0a;
        }

        /* ── Just Landed ── */
        .just-landed-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 4rem;
        }
        @media (max-width: 900px) {
          .just-landed-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .just-landed-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
        }

        .landed-card {
          background: #111;
          border: 1px solid #1e1e1e;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          transition: border-color 0.2s, transform 0.2s;
          text-decoration: none;
          color: inherit;
          display: block;
        }
        .landed-card:hover {
          border-color: #C9A961;
          transform: translateY(-3px);
        }
        .landed-card-img {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          display: block;
          background: #1a1a1a;
        }
        .landed-card-body {
          padding: 0.75rem;
        }
        .landed-card-vendor {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #C9A961;
          text-transform: uppercase;
          margin-bottom: 0.2rem;
        }
        .landed-card-title {
          font-size: 0.82rem;
          font-weight: 600;
          color: #f5f1e8;
          line-height: 1.3;
          margin-bottom: 0.35rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .landed-card-price {
          font-size: 0.95rem;
          font-weight: 700;
          color: #C9A961;
        }
        .landed-skeleton {
          background: #111;
          border: 1px solid #1e1e1e;
          border-radius: 10px;
          overflow: hidden;
        }
        .skel-img {
          width: 100%;
          aspect-ratio: 1;
          background: #1a1a1a;
        }
        .skel-line {
          background: #1a1a1a;
          border-radius: 4px;
          margin: 0.5rem 0.75rem;
        }

        /* ── Instagram feed ── */
        .ig-wrap {
          background: #0d0d0d;
          border: 1px solid #1e1e1e;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 4rem;
        }
        .ig-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.75rem;
          border-bottom: 1px solid #1e1e1e;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .ig-handle {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }
        .ig-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #C9A961;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        .ig-handle-text {
          font-family: 'Bebas Neue', cursive;
          font-size: 1.25rem;
          letter-spacing: 0.08em;
          color: #f5f1e8;
        }
        .ig-live-tag {
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #C9A961;
          background: rgba(201,169,97,0.1);
          border: 1px solid rgba(201,169,97,0.3);
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
        }
        .ig-follow-btn {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #0a0a0a;
          background: #C9A961;
          border: none;
          padding: 0.5rem 1.25rem;
          border-radius: 20px;
          cursor: pointer;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .ig-follow-btn:hover { opacity: 0.85; }
        .ig-feed-body {
          padding: 1.5rem 1.75rem 1.75rem;
        }

        /* ── Tag callout ── */
        .tag-callout {
          text-align: center;
          padding: 2.5rem;
          background: rgba(201,169,97,0.04);
          border: 1px solid rgba(201,169,97,0.15);
          border-radius: 12px;
          margin-top: 2rem;
        }
        .tag-callout h3 {
          font-family: 'Bebas Neue', cursive;
          font-size: 1.75rem;
          letter-spacing: 0.06em;
          margin-bottom: 0.5rem;
        }
        .tag-callout p {
          color: #888;
          font-size: 0.95rem;
        }
        .tag-callout strong {
          color: #C9A961;
        }

        /* Skeleton pulse */
        @keyframes skel-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .skel-pulse { animation: skel-pulse 1.4s ease-in-out infinite; }

        /* Section header */
        .updates-section-head {
          display: flex;
          align-items: baseline;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .updates-section-head h2 {
          font-family: 'Bebas Neue', cursive;
          font-size: 1.75rem;
          letter-spacing: 0.06em;
          color: #f5f1e8;
          margin: 0;
        }
        .updates-section-head span {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #555;
          text-transform: uppercase;
        }
      `}</style>

      {/* ── Header ── */}
      <div className="page-header">
        <h1 className="glitch" data-text="UPDATES">UPDATES</h1>
        <p>News, drops, and what's going on at Hart Boys</p>
      </div>

      <div className="updates-wrap">

        {/* ── Announcements ── */}
        <section style={{ marginBottom: '4rem' }}>
          <div className="updates-section-head reveal">
            <h2>LATEST NEWS</h2>
            <span>From the shop</span>
          </div>

          <div className="announce-grid">
            {ANNOUNCEMENTS.map((post, i) => {
              const cfg = TYPE_CONFIG[post.type] || TYPE_CONFIG.news
              return (
                <div
                  key={i}
                  className={`announce-card reveal reveal-delay-${(i % 2) + 1}`}
                  style={{ '--stripe-color': cfg.color } as React.CSSProperties}
                >
                  <div className="announce-meta">
                    <span className="announce-badge">{cfg.icon} {cfg.label}</span>
                    <span className="announce-date">{post.date}</span>
                  </div>
                  <h3 className="announce-title">{post.title}</h3>
                  <p className="announce-body">{post.body}</p>
                  {post.cta && (
                    post.cta.to
                      ? <Link to={post.cta.to} className="announce-cta">{post.cta.label} →</Link>
                      : <a href={post.cta.href} target="_blank" rel="noreferrer" className="announce-cta">{post.cta.label} →</a>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Just Landed ── */}
        {(loadingProducts || recentProducts.length > 0) && (
          <section style={{ marginBottom: '4rem' }}>
            <div className="updates-section-head reveal">
              <h2>JUST LANDED</h2>
              <span>New in the shop</span>
            </div>

            <div className="just-landed-grid">
              {loadingProducts
                ? [0,1,2,3].map(i => (
                    <div key={i} className="landed-skeleton">
                      <div className="skel-img skel-pulse" />
                      <div className="skel-line skel-pulse" style={{ height: 10, width: '40%', marginTop: 12 }} />
                      <div className="skel-line skel-pulse" style={{ height: 13, marginBottom: 6 }} />
                      <div className="skel-line skel-pulse" style={{ height: 16, width: '35%', marginBottom: 12 }} />
                    </div>
                  ))
                : recentProducts.map((p, i) => {
                    const img = p.images?.edges?.[0]?.node?.url
                    const price = parseFloat(p.priceRange?.minVariantPrice?.amount || '0')
                    return (
                      <Link
                        key={p.id}
                        to="/shop"
                        className={`landed-card reveal reveal-delay-${i + 1}`}
                      >
                        {img
                          ? <img src={img} alt={p.title} className="landed-card-img" />
                          : <div className="landed-card-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: '#333' }}>🛹</div>
                        }
                        <div className="landed-card-body">
                          {p.vendor && <p className="landed-card-vendor">{p.vendor}</p>}
                          <p className="landed-card-title">{p.title}</p>
                          <p className="landed-card-price">${price.toFixed(2)}</p>
                        </div>
                      </Link>
                    )
                  })
              }
            </div>

            <div style={{ textAlign: 'center' }}>
              <Link to="/shop" className="btn btn-secondary">VIEW ALL PRODUCTS →</Link>
            </div>
          </section>
        )}

        {/* ── Instagram Feed ── */}
        <section>
          <div className="updates-section-head reveal">
            <h2>INSTAGRAM</h2>
            <span>Live from the shop</span>
          </div>

          <div className="ig-wrap reveal">
            <div className="ig-header">
              <div className="ig-handle">
                <div className="ig-dot" />
                <span className="ig-handle-text">@hartboysskateshop</span>
                <span className="ig-live-tag">LIVE FEED</span>
              </div>
              <a
                href="https://instagram.com/hartboysskateshop"
                target="_blank"
                rel="noreferrer"
                className="ig-follow-btn"
              >
                FOLLOW
              </a>
            </div>

            <div className="ig-feed-body">
              <div data-behold-id="aIDGUZuwy7im6UeCTBMW" />

              <div className="tag-callout" style={{ marginTop: '1.5rem' }}>
                <h3>TAG US IN YOUR CLIPS 🤘</h3>
                <p>Use <strong>#hartboysskateshop</strong> or tag <strong>@hartboysskateshop</strong> to get featured right here.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
