import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getProducts } from "../lib/shopify"
import { isExcluded } from "../lib/filters"

const BG    = '#0f0f0f'
const BG2   = '#161616'
const BG3   = '#1c1c1c'
const GOLD  = '#c9a961'
const GOLD2 = 'rgba(201,169,97,0.12)'
const TEXT  = '#e8e8e8'
const MUTED = '#666'
const BORDER = '#2a2a2a'
const GREEN = '#4ade80'

const STEPS = [
  {
    id: 'deck',
    label: 'Deck',
    icon: '🛹',
    description: 'The foundation of your setup',
    keywords: ['deck'],
    tip: 'Deck width is measured in inches. Most skaters ride 8.0"–8.5". Wider = more stability, narrower = easier flip tricks.',
  },
  {
    id: 'trucks',
    label: 'Trucks',
    icon: '⚙️',
    description: 'Controls your turning & stability',
    keywords: ['truck'],
    tip: 'Match truck width to your deck width. You need 2 trucks per board — we\'ll add them automatically.',
    qty: 2,
  },
  {
    id: 'wheels',
    label: 'Wheels',
    icon: '⭕',
    description: 'Ride quality, speed & style',
    keywords: ['wheel'],
    tip: 'Smaller wheels (50–54mm) are great for street. Larger (55mm+) are better for cruising or transition.',
  },
  {
    id: 'hardware',
    label: 'Hardware',
    icon: '🔩',
    description: 'Bearings, griptape, bolts & more',
    keywords: ['bearing', 'hardware', 'grip', 'bolt', 'griptape'],
    tip: 'Don\'t forget bearings (2 per wheel = 8 total) and hardware bolts to mount your trucks to your deck.',
  },
]

function getStepProducts(products: any[], step: typeof STEPS[0]) {
  return products.filter(p => {
    const text = [p.title, p.productType, ...(p.tags || [])].join(' ').toLowerCase()
    return step.keywords.some(kw => text.includes(kw))
  })
}

export default function BuildABoard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selections, setSelections] = useState<Record<string, any>>({})
  const [added, setAdded] = useState(false)

  useEffect(() => {
    getProducts().then(prods => {
      setProducts(prods.filter(p => !isExcluded(p)))
      setLoading(false)
    })
  }, [])

  const currentStep = STEPS[step]
  const isReview = step === STEPS.length
  const stepProducts = currentStep ? getStepProducts(products, currentStep) : []
  const selectedCount = Object.keys(selections).length

  const select = (product: any) => {
    setSelections(prev => ({ ...prev, [currentStep.id]: product }))
  }

  const addAllToCart = () => {
    const existing: any[] = (() => {
      try { return JSON.parse(localStorage.getItem('hb_cart') || '[]') } catch { return [] }
    })()

    const newItems = Object.entries(selections).map(([stepId, product]: [string, any]) => {
      const variant = product.variants.edges[0]?.node
      const stepDef = STEPS.find(s => s.id === stepId)
      return {
        variantId: variant?.id,
        title: product.title,
        vendor: product.vendor,
        price: product.priceRange.minVariantPrice.amount,
        image: product.images.edges[0]?.node.url || '',
        variantTitle: variant?.title === 'Default Title' ? '' : (variant?.title || ''),
        productType: product.productType,
        quantity: stepDef?.qty ?? 1,
      }
    })

    const merged = [...existing]
    for (const item of newItems) {
      const idx = merged.findIndex(i => i.variantId === item.variantId)
      if (idx >= 0) merged[idx].quantity += item.quantity
      else merged.push(item)
    }

    localStorage.setItem('hb_cart', JSON.stringify(merged))
    setAdded(true)
    setTimeout(() => navigate('/shop?open_cart=1'), 900)
  }

  const totalPrice = Object.values(selections).reduce((sum: number, p: any) => {
    const stepId = Object.entries(selections).find(([, v]) => v === p)?.[0]
    const stepDef = STEPS.find(s => s.id === stepId)
    return sum + parseFloat(p.priceRange.minVariantPrice.amount) * (stepDef?.qty ?? 1)
  }, 0)

  return (
    <div style={{ minHeight: '100vh', background: BG, paddingTop: 90, paddingBottom: 80 }}>
      <style>{`
        .bab-card { transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s; cursor: pointer; }
        .bab-card:hover { border-color: ${GOLD} !important; transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,0.4); }
        .bab-card.selected { border-color: ${GOLD} !important; box-shadow: 0 0 0 1px ${GOLD}, 0 6px 24px rgba(201,169,97,0.15); }
        .step-dot { transition: background 0.2s, border-color 0.2s; }
        .next-btn { transition: background 0.2s, opacity 0.2s; }
        .next-btn:hover:not(:disabled) { background: #d4b06a !important; }
        .skip-btn { transition: color 0.2s; }
        .skip-btn:hover { color: ${TEXT} !important; }
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.25rem' }}>

        {/* ── HEADER ── */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ color: GOLD, fontSize: '0.72rem', letterSpacing: '0.2em', fontWeight: 700, marginBottom: '0.5rem' }}>HART BOYS SKATE SHOP</p>
          <h1 style={{ color: TEXT, fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 0.75rem' }}>
            BUILD YOUR BOARD
          </h1>
          <p style={{ color: MUTED, fontSize: '0.9rem', maxWidth: 480, margin: '0 auto' }}>
            Pick each component step by step. We'll add everything to your cart at once.
          </p>
        </div>

        {/* ── STEP PROGRESS ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem', gap: 0 }}>
          {STEPS.map((s, i) => {
            const done = selections[s.id] != null
            const active = i === step && !isReview
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    className="step-dot"
                    onClick={() => !isReview && setStep(i)}
                    style={{
                      width: 44, height: 44, borderRadius: '50%', border: `2px solid ${active ? GOLD : done ? GREEN : BORDER}`,
                      background: active ? GOLD2 : done ? 'rgba(74,222,128,0.1)' : BG2,
                      color: active ? GOLD : done ? GREEN : MUTED,
                      fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {done && !active ? '✓' : s.icon}
                  </button>
                  <span style={{ fontSize: '0.65rem', color: active ? GOLD : done ? GREEN : MUTED, letterSpacing: '0.08em', fontWeight: active ? 700 : 400, whiteSpace: 'nowrap' }}>
                    {s.label.toUpperCase()}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: 'clamp(24px, 6vw, 64px)', height: 2, background: selections[STEPS[i].id] ? GREEN : BORDER, margin: '0 4px', marginBottom: 22, transition: 'background 0.3s' }} />
                )}
              </div>
            )
          })}
          {/* Review dot */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 'clamp(24px, 6vw, 64px)', height: 2, background: isReview ? GREEN : BORDER, margin: '0 4px', marginBottom: 22, transition: 'background 0.3s' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', border: `2px solid ${isReview ? GOLD : BORDER}`, background: isReview ? GOLD2 : BG2, color: isReview ? GOLD : MUTED, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🛒</div>
              <span style={{ fontSize: '0.65rem', color: isReview ? GOLD : MUTED, letterSpacing: '0.08em', fontWeight: isReview ? 700 : 400 }}>REVIEW</span>
            </div>
          </div>
        </div>

        {/* ── STEP CONTENT ── */}
        {!isReview ? (
          <div>
            {/* Step header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ color: TEXT, fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.25rem', letterSpacing: '-0.01em' }}>
                  {currentStep.icon} Step {step + 1}: Choose Your {currentStep.label}
                </h2>
                <p style={{ color: MUTED, fontSize: '0.82rem', margin: 0 }}>{currentStep.description}</p>
              </div>
              {selections[currentStep.id] && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 8, padding: '0.4rem 0.75rem' }}>
                  <span style={{ color: GREEN, fontSize: '0.75rem', fontWeight: 700 }}>✓ Selected</span>
                </div>
              )}
            </div>

            {/* Pro tip */}
            <div style={{ background: GOLD2, border: `1px solid rgba(201,169,97,0.2)`, borderRadius: 8, padding: '0.6rem 0.875rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.8rem' }}>💡</span>
              <p style={{ color: MUTED, fontSize: '0.75rem', margin: 0, lineHeight: 1.5 }}><strong style={{ color: GOLD }}>Pro tip:</strong> {currentStep.tip}</p>
            </div>

            {/* Product grid */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: MUTED }}>Loading products...</div>
            ) : stepProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: MUTED }}>
                <p style={{ fontSize: '2rem', marginBottom: '0.75rem', opacity: 0.3 }}>😅</p>
                <p>No {currentStep.label.toLowerCase()} in stock right now.</p>
                <button className="skip-btn" onClick={() => setStep(s => s + 1)} style={{ marginTop: '1rem', background: 'none', border: `1px solid ${BORDER}`, color: MUTED, padding: '0.5rem 1.25rem', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem' }}>
                  Skip this step →
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
                {stepProducts.map(p => {
                  const img = p.images.edges[0]?.node.url
                  const price = p.priceRange.minVariantPrice.amount
                  const isSelected = selections[currentStep.id]?.id === p.id
                  const inStock = p.variants.edges.some((v: any) => v.node.availableForSale)
                  return (
                    <div
                      key={p.id}
                      className={`bab-card${isSelected ? ' selected' : ''}`}
                      onClick={() => inStock && select(p)}
                      style={{
                        background: BG2, border: `1.5px solid ${isSelected ? GOLD : BORDER}`,
                        borderRadius: 10, overflow: 'hidden', opacity: inStock ? 1 : 0.45,
                        cursor: inStock ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <div style={{ aspectRatio: '1', background: BG3, position: 'relative', overflow: 'hidden' }}>
                        {img
                          ? <img src={img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', opacity: 0.2 }}>🛹</div>
                        }
                        {isSelected && (
                          <div style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, background: GOLD, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: BG }}>✓</div>
                        )}
                        {!inStock && (
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ background: '#111', color: MUTED, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', padding: '0.3rem 0.6rem', borderRadius: 4, border: `1px solid ${BORDER}` }}>SOLD OUT</span>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '0.625rem' }}>
                        {p.vendor && <p style={{ margin: '0 0 0.15rem', color: GOLD, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{p.vendor}</p>}
                        <p style={{ margin: '0 0 0.3rem', color: TEXT, fontSize: '0.78rem', fontWeight: 600, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.title}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: GOLD, fontWeight: 700, fontSize: '0.82rem' }}>${parseFloat(price).toFixed(2)}</span>
                          {currentStep.id === 'trucks' && <span style={{ color: MUTED, fontSize: '0.6rem' }}>×2</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: `1px solid ${BORDER}` }}>
              <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
                style={{ padding: '0.6rem 1.25rem', background: 'none', border: `1px solid ${BORDER}`, color: step === 0 ? BORDER : MUTED, borderRadius: 6, cursor: step === 0 ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', transition: 'border-color 0.2s, color 0.2s' }}>
                ← Back
              </button>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {!selections[currentStep.id] && (
                  <button className="skip-btn" onClick={() => setStep(s => s + 1)}
                    style={{ padding: '0.6rem 1rem', background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                    Skip
                  </button>
                )}
                <button className="next-btn" onClick={() => setStep(s => s + 1)} disabled={!selections[currentStep.id] && stepProducts.length > 0}
                  style={{
                    padding: '0.65rem 1.75rem', background: selections[currentStep.id] ? GOLD : '#2a2a2a',
                    color: selections[currentStep.id] ? BG : MUTED, border: 'none', borderRadius: 6,
                    cursor: selections[currentStep.id] ? 'pointer' : 'default', fontFamily: 'inherit',
                    fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.06em',
                  }}>
                  {step === STEPS.length - 1 ? 'Review Board →' : 'Next Step →'}
                </button>
              </div>
            </div>
          </div>

        ) : (
          /* ── REVIEW STEP ── */
          <div>
            <h2 style={{ color: TEXT, fontSize: '1.3rem', fontWeight: 800, margin: '0 0 1.5rem', letterSpacing: '-0.01em', textAlign: 'center' }}>
              🛒 Your Complete Board
            </h2>

            {selectedCount === 0 ? (
              <div style={{ textAlign: 'center', color: MUTED, padding: '2rem' }}>
                <p>You haven't selected any items yet.</p>
                <button onClick={() => setStep(0)} style={{ marginTop: '1rem', padding: '0.6rem 1.5rem', background: GOLD, border: 'none', color: BG, borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>Start Building</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {STEPS.map(s => {
                  const p = selections[s.id]
                  if (!p) return (
                    <div key={s.id} onClick={() => setStep(STEPS.indexOf(s))} style={{ background: BG2, border: `1.5px dashed ${BORDER}`, borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                      <span style={{ fontSize: '1.8rem', opacity: 0.3 }}>{s.icon}</span>
                      <span style={{ color: MUTED, fontSize: '0.75rem', letterSpacing: '0.08em' }}>ADD {s.label.toUpperCase()}</span>
                    </div>
                  )
                  const img = p.images.edges[0]?.node.url
                  const price = parseFloat(p.priceRange.minVariantPrice.amount) * (s.qty ?? 1)
                  return (
                    <div key={s.id} style={{ background: BG2, border: `1.5px solid ${GOLD}`, borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ aspectRatio: '1', background: BG3, position: 'relative' }}>
                        {img ? <img src={img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', opacity: 0.2 }}>🛹</div>}
                        <div style={{ position: 'absolute', top: 8, left: 8, background: BG, border: `1px solid ${BORDER}`, borderRadius: 4, padding: '0.2rem 0.45rem', fontSize: '0.6rem', color: GOLD, fontWeight: 700, letterSpacing: '0.08em' }}>{s.label.toUpperCase()}</div>
                        <button onClick={() => setStep(STEPS.indexOf(s))} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', border: `1px solid ${BORDER}`, color: MUTED, borderRadius: 4, padding: '0.2rem 0.45rem', fontSize: '0.65rem', cursor: 'pointer', fontFamily: 'inherit' }}>Change</button>
                      </div>
                      <div style={{ padding: '0.625rem' }}>
                        {p.vendor && <p style={{ margin: '0 0 0.1rem', color: GOLD, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{p.vendor}</p>}
                        <p style={{ margin: '0 0 0.3rem', color: TEXT, fontSize: '0.78rem', fontWeight: 600, lineHeight: 1.3 }}>{p.title}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: GOLD, fontWeight: 700, fontSize: '0.85rem' }}>${price.toFixed(2)}</span>
                          {s.qty && s.qty > 1 && <span style={{ color: MUTED, fontSize: '0.65rem' }}>qty: {s.qty}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {selectedCount > 0 && (
              <div style={{ background: BG2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '1.25rem 1.5rem', maxWidth: 400, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: `1px solid ${BORDER}` }}>
                  <span style={{ color: MUTED, fontSize: '0.82rem', letterSpacing: '0.06em' }}>ESTIMATED TOTAL</span>
                  <span style={{ color: GOLD, fontSize: '1.5rem', fontWeight: 700 }}>${totalPrice.toFixed(2)}</span>
                </div>
                {totalPrice >= 150 && (
                  <p style={{ color: GREEN, fontSize: '0.75rem', textAlign: 'center', margin: '0 0 0.75rem', fontWeight: 600 }}>🎉 Qualifies for FREE shipping!</p>
                )}
                <button onClick={addAllToCart} disabled={added}
                  style={{
                    width: '100%', padding: '0.9rem', background: added ? '#1a3a1a' : GOLD,
                    color: added ? GREEN : BG, border: 'none', borderRadius: 6, fontWeight: 700,
                    fontSize: '0.95rem', letterSpacing: '0.08em', cursor: added ? 'default' : 'pointer',
                    fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    transition: 'background 0.3s, color 0.3s', boxShadow: added ? 'none' : `0 4px 16px rgba(201,169,97,0.25)`
                  }}>
                  {added ? '✓ ADDED — HEADING TO CART...' : `ADD ALL TO CART (${selectedCount} item${selectedCount !== 1 ? 's' : ''})`}
                </button>
                <p style={{ textAlign: 'center', color: MUTED, fontSize: '0.72rem', marginTop: '0.75rem' }}>🔒 Secure checkout via Shopify</p>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button onClick={() => setStep(0)} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                ← Start over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
