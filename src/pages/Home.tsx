import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getProducts } from '../lib/shopify'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { isExcluded } from '../lib/filters'

const BRANDS = [
  'POWELL PERALTA', 'SANTA CRUZ', 'CREATURE', 'INDEPENDENT',
  'SPITFIRE', 'NIKE SB', 'VANS', 'BAKER', 'GIRL', 'CHOCOLATE',
  'BONES', 'REAL', 'ALIEN WORKSHOP', 'QUASI', 'HABITAT'
]

// Tricks rotate weekly
const TRICKS = [
  {
    name: 'OLLIE',
    difficulty: 'Beginner',
    steps: [
      'Tail foot on the very end of the tail, front foot mid-board.',
      'Snap the tail down hard and jump — pop comes from the tail, not your legs.',
      'Slide your front foot up to level the board out at the peak.',
      'Land with both feet over the bolts and bend your knees.',
    ]
  },
  {
    name: 'KICKFLIP',
    difficulty: 'Intermediate',
    steps: [
      'Set up like an ollie — tail foot on tail, front foot below the front bolts.',
      'Pop the tail and flick your front foot off the pocket (front edge of nose).',
      'Let the board flip under you and watch for it to come around.',
      'Catch it with your back foot first, then stomp both feet over the bolts.',
    ]
  },
  {
    name: 'HEELFLIP',
    difficulty: 'Intermediate',
    steps: [
      'Front foot near the nose with toes hanging off the heel edge.',
      'Pop the tail and kick your heel out toward the nose to flip the board.',
      'The board flips the opposite direction of a kickflip — watch it spin.',
      'Catch with back foot, then front, land balanced over the bolts.',
    ]
  },
  {
    name: '50-50 GRIND',
    difficulty: 'Intermediate',
    steps: [
      'Approach the obstacle at a slight angle with enough speed.',
      'Ollie up and aim both trucks onto the edge or rail.',
      'Grind forward keeping your weight centered and level.',
      'Ollie or ride off the end — don\'t lean back or you\'ll hang up.',
    ]
  },
  {
    name: 'MANUAL',
    difficulty: 'Beginner',
    steps: [
      'Roll at comfortable speed and shift weight to your back foot.',
      'Lift the front wheels just enough to clear the ground — not too high.',
      'Keep your arms out for balance and make tiny adjustments.',
      'Roll the front wheels back down before you lose it.',
    ]
  },
  {
    name: 'SHOVE-IT',
    difficulty: 'Beginner',
    steps: [
      'Back foot on the tail, front foot loosely over the middle of the board.',
      'Scoop your back foot toward your heelside to spin the board 180°.',
      'Let your front foot float up and out of the way as the board rotates.',
      'Catch it with both feet once it completes the spin and ride away.',
    ]
  },
  {
    name: 'FRONTSIDE 180',
    difficulty: 'Beginner',
    steps: [
      'Set up like an ollie but wind your shoulders slightly backside.',
      'Pop and spin your body frontside (chest leading) while you ollie.',
      'Let the board follow your body rotation — don\'t force it.',
      'Land fakie and roll away smooth. Practice on flat ground first.',
    ]
  },
  {
    name: 'NOSESLIDE',
    difficulty: 'Intermediate',
    steps: [
      'Approach the ledge or rail parallel and at a comfortable speed.',
      'Ollie and turn your board 90° so the nose lands on the obstacle.',
      'Slide forward on the nose, keeping weight over the front truck.',
      'Pop out at the end with a small nollie motion and roll away.',
    ]
  },
  {
    name: 'BOARDSLIDE',
    difficulty: 'Intermediate',
    steps: [
      'Approach the rail at a slight angle — not straight on.',
      'Ollie and turn 90° so the middle of your board lands on the rail.',
      'Keep your weight centered and your knees slightly bent.',
      'Let the board slide naturally, then pop off and land bolts.',
    ]
  },
  {
    name: '5-0 GRIND',
    difficulty: 'Intermediate',
    steps: [
      'Approach like a 50-50 but shift your weight slightly back.',
      'Ollie up and only lock your back truck onto the ledge or rail.',
      'Keep the nose up — if it drops, you\'ll hang up or fall.',
      'Push off with your back foot at the end to clear the obstacle.',
    ]
  },
  {
    name: 'KICKFLIP 50-50',
    difficulty: 'Advanced',
    steps: [
      'You need a solid kickflip and a solid 50-50 separately first.',
      'Approach the obstacle and set up your kickflip stance.',
      'Pop the kickflip and catch it early, then direct both trucks onto the ledge.',
      'Grind out and pop off the end — timing the catch is the hardest part.',
    ]
  },
  {
    name: 'NOLLIE',
    difficulty: 'Intermediate',
    steps: [
      'Reverse your foot position — front foot on the nose, back foot mid-board.',
      'Pop the nose down like an ollie in reverse, jumping up as you do.',
      'Slide your back foot toward the tail to level the board out.',
      'Land with both feet over the bolts. It feels awkward at first — stick with it.',
    ]
  },
  {
    name: 'FAKIE OLLIE',
    difficulty: 'Beginner',
    steps: [
      'Roll backwards (fakie) at a comfortable speed.',
      'Your feet stay in normal position — tail foot, front foot mid.',
      'Pop the tail and ollie as normal, but you\'re rolling backwards.',
      'Land and keep rolling fakie or pivot out to regular.',
    ]
  },
  {
    name: 'SWITCH OLLIE',
    difficulty: 'Advanced',
    steps: [
      'Roll in switch stance — everything is mirrored from your normal position.',
      'Your non-dominant foot is now on the tail. It will feel completely wrong.',
      'Pop as hard as you can and slide your other foot up like a normal ollie.',
      'The goal is clean and controlled — height comes later.',
    ]
  },
  {
    name: 'INDY GRAB',
    difficulty: 'Intermediate',
    steps: [
      'Hit a ramp or launch off a bump to get some serious air.',
      'Suck your knees up hard so the board comes close to your hand.',
      'Grab the toeside edge of the board between your feet with your back hand.',
      'Hold it for a moment, let go before you land, and stomp it down.',
    ]
  },
  {
    name: 'CROOKED GRIND',
    difficulty: 'Advanced',
    steps: [
      'Approach at a slight frontside angle — a little more than a noseslide.',
      'Ollie and lock your front truck on the obstacle at a diagonal.',
      'The nose hangs over the ledge while the front truck grinds — that\'s the crook.',
      'Pop the nose over the end of the obstacle to come out clean.',
    ]
  },
  {
    name: 'BLUNTSLIDE',
    difficulty: 'Advanced',
    steps: [
      'Approach the obstacle with a little more speed than a noseslide.',
      'Ollie and push the tail over the ledge so it slides on the tail, not the trucks.',
      'Keep pressure on the tail or you\'ll slip out. It\'s a committed trick.',
      'Pop out toward frontside or backside and land smooth.',
    ]
  },
  {
    name: 'VARIAL KICKFLIP',
    difficulty: 'Advanced',
    steps: [
      'A kickflip and a backside pop shove-it at the same time.',
      'Back foot scoops backside while front foot flicks the kickflip.',
      'The board does both motions simultaneously — it takes a while to sync.',
      'Watch for the grip tape to come back around and stomp it.',
    ]
  },
  {
    name: 'DROP IN',
    difficulty: 'Beginner',
    steps: [
      'Place your tail on the coping with your back foot, front foot off the board.',
      'Put your front foot on the board and lean forward — commit fully.',
      'The moment your board drops, bend your knees and lean into the ramp.',
      'Never hesitate. The hesitation is what causes falls, not the trick itself.',
    ]
  },
  {
    name: 'FS FEEBLE GRIND',
    difficulty: 'Advanced',
    steps: [
      'Approach frontside with decent speed — this trick needs commitment.',
      'Ollie up and lock your back truck on the rail, letting the nose hang over.',
      'The front truck clears the obstacle while the back truck grinds.',
      'Stay frontside through the grind and pop off the end cleanly.',
    ]
  },
  {
    name: 'HARDFLIP',
    difficulty: 'Advanced',
    steps: [
      'A frontside pop shove-it and kickflip combined — one of the hardest basics.',
      'Back foot scoops frontside while front foot flicks the kickflip.',
      'The motions fight each other, which is what makes it hard to learn.',
      'Keep your shoulders square and watch the board all the way through.',
    ]
  },
]

const weekTrick = TRICKS[Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)) % TRICKS.length]

const LOCAL_SPOTS = [
  {
    icon: '🏟️',
    name: 'Soldotna Skatepark',
    type: 'Public Park',
    desc: 'The main spot. Bowls, street section, and plenty of room to session with the local crew.',
  },
  {
    icon: '🛒',
    name: 'Peninsula Center',
    type: 'Parking Lot',
    desc: 'Smooth asphalt, low curbs, and right next to the shop. Great for learning manuals and flat ground.',
  },
  {
    icon: '🏫',
    name: 'Soldotna High School',
    type: 'School Grounds',
    desc: 'Banks and ledges after hours. Respect the space and skate clean.',
  },
  {
    icon: '🌲',
    name: 'Kenai River Flats',
    type: 'DIY Spot',
    desc: 'Open pavement with good lines. Bring a broom and make it your own.',
  },
]

export default function Home() {
  const [freshProducts, setFreshProducts] = useState<any[]>([])
  const [loadingFresh, setLoadingFresh] = useState(true)

  useScrollReveal([freshProducts])

  useEffect(() => {
    getProducts()
      .then(products => {
        setFreshProducts(products.filter(p => !isExcluded(p)).slice(0, 3))
        setLoadingFresh(false)
      })
      .catch(() => setLoadingFresh(false))
  }, [])

  return (
    <>
      {/* ── HERO ── */}
      <section className="hero">
        <div className="grain"></div>

        <div className="x-mark x-1"></div>
        <div className="x-mark x-2"></div>
        <div className="x-mark x-3"></div>
        <div className="x-mark x-4"></div>

        <div className="hero-logo reveal reveal-scale">
          <img src="/logo.jpeg" alt="Hart Boys Skate Shop" className="main-logo" />
        </div>

        <div className="tagline now-open reveal reveal-delay-1">
          <span>📍 SOLDOTNA, ALASKA</span>
          <span className="slash">/</span>
          <span className="open-badge">NOW OPEN</span>
        </div>

        <p className="store-location reveal reveal-delay-2">Peninsula Center Mall • Suite 48C</p>

        <div className="hero-buttons reveal reveal-delay-3">
          <Link to="/shop" className="btn btn-primary">SHOP NOW</Link>
          <Link to="/classes" className="btn btn-secondary">SKATE CLASSES</Link>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="marquee-wrap">
        <div className="marquee">
          {[...BRANDS, ...BRANDS, ...BRANDS].map((brand, i) => (
            <span key={i}>{brand} <span className="star">✦</span></span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="features">
        <div className="feature-card reveal reveal-delay-1">
          <span className="feature-icon">🛹</span>
          <h3>VISIT US</h3>
          <p>Peninsula Center Mall<br />Suite 48C, Soldotna<br />Mon–Sat 11am–6pm</p>
        </div>
        <div className="feature-card reveal reveal-delay-2">
          <span className="feature-icon">⚡</span>
          <h3>TOP BRANDS</h3>
          <p>Premium decks, trucks<br />Wheels &amp; apparel<br />20+ brands in stock</p>
        </div>
        <div className="feature-card reveal reveal-delay-3">
          <span className="feature-icon">🔥</span>
          <h3>SKATE CLASSES</h3>
          <p>Beginner to advanced<br />Private &amp; group lessons<br />Book online</p>
        </div>
      </section>

      {/* ── FRESH DROP ── */}
      {(loadingFresh || freshProducts.length > 0) && (
        <section className="fresh-drop-section">
          <p className="section-eyebrow reveal">Just Dropped</p>
          <h2 className="section-title reveal">FRESH IN THE SHOP</h2>

          <div className="fresh-cards">
            {loadingFresh ? (
              // Skeleton loaders
              [0, 1, 2].map(i => (
                <div key={i} style={{
                  background: '#111', borderRadius: 10, overflow: 'hidden',
                  border: '1px solid #1e1e1e'
                }}>
                  <div style={{ width: '100%', aspectRatio: '1', background: '#1a1a1a', animation: 'pulse 1.4s ease-in-out infinite' }} />
                  <div style={{ padding: '1rem' }}>
                    <div style={{ height: 10, background: '#1a1a1a', borderRadius: 4, marginBottom: 8, width: '40%', animation: 'pulse 1.4s ease-in-out infinite' }} />
                    <div style={{ height: 14, background: '#1a1a1a', borderRadius: 4, marginBottom: 8, animation: 'pulse 1.4s ease-in-out infinite' }} />
                    <div style={{ height: 18, background: '#1a1a1a', borderRadius: 4, width: '30%', animation: 'pulse 1.4s ease-in-out infinite' }} />
                  </div>
                </div>
              ))
            ) : (
              freshProducts.map((p, i) => {
                const img = p.images?.edges?.[0]?.node?.url
                const price = parseFloat(p.priceRange?.minVariantPrice?.amount || '0')
                const diffDays = (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                const isNew = diffDays < 180

                return (
                  <Link
                    key={p.id}
                    to="/shop"
                    className={`fresh-card reveal reveal-delay-${i + 1}`}
                  >
                    <div className="fresh-card-img-wrap">
                      {img
                        ? <img src={img} alt={p.title} className="fresh-card-img" />
                        : <div style={{ width: '100%', aspectRatio: '1', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#333' }}>🛹</div>
                      }
                      {isNew && <span className="fresh-new-badge">NEW</span>}
                    </div>
                    <div className="fresh-card-body">
                      {p.vendor && <p className="fresh-card-vendor">{p.vendor}</p>}
                      <p className="fresh-card-title">{p.title}</p>
                      <p className="fresh-card-price">${price.toFixed(2)}</p>
                    </div>
                  </Link>
                )
              })
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/shop" className="btn btn-secondary">VIEW ALL PRODUCTS →</Link>
          </div>
        </section>
      )}

      <div className="sticker-divider">✦ ✦ ✦</div>

      {/* ── TRICK OF THE WEEK ── */}
      <section className="trick-section">
        <div className="trick-inner">
          <div className="reveal reveal-left">
            <span className="trick-label">✦ Trick of the Week</span>
            <h2 className="trick-name">{weekTrick.name}</h2>
            <p className="trick-difficulty">Difficulty: {weekTrick.difficulty}</p>
            <Link to="/classes" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.75rem 1.5rem' }}>
              Learn with the Harts →
            </Link>
          </div>

          <div className="reveal reveal-delay-2">
            {weekTrick.steps.map((step, i) => (
              <div key={i} className="trick-step">
                <span className="trick-step-num">{i + 1}.</span>
                {step}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="sticker-divider">✦ ✦ ✦</div>

      {/* ── LOCAL SPOTS ── */}
      <section className="spots-section">
        <p className="section-eyebrow reveal">Soldotna & Kenai Peninsula</p>
        <h2 className="section-title reveal">LOCAL SKATE SPOTS</h2>

        <div className="spots-grid">
          {LOCAL_SPOTS.map((spot, i) => (
            <div key={spot.name} className={`spot-card reveal reveal-delay-${i + 1}`}>
              <span className="spot-icon">{spot.icon}</span>
              <h3 className="spot-name">{spot.name}</h3>
              <p className="spot-type">{spot.type}</p>
              <p className="spot-desc">{spot.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── INSTAGRAM CTA ── */}
      <section className="instagram-cta reveal">
        <h2>FOLLOW THE DROP</h2>
        <p>New gear &amp; restocks daily</p>
        <a href="https://instagram.com/hartboysskateshop" className="btn btn-primary" target="_blank" rel="noreferrer">
          📸 @hartboysskateshop
        </a>
      </section>
    </>
  )
}
