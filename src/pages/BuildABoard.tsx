import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getProducts } from "../lib/shopify"
import { isExcluded } from "../lib/filters"
import { useScrollReveal } from "../hooks/useScrollReveal"

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
    qty: 1,
    multiSelect: false,
  },
  {
    id: 'trucks',
    label: 'Trucks',
    icon: '⚙️',
    description: 'Controls your turning & stability',
    keywords: ['truck'],
    tip: "Match truck width to your deck width. You need 2 trucks per board — we'll add them automatically.",
    qty: 2,
    multiSelect: false,
  },
  {
    id: 'wheels',
    label: 'Wheels',
    icon: '⭕',
    description: 'Ride quality, speed & style',
    keywords: ['wheel'],
    tip: 'Smaller wheels (50–54mm) are great for street. Larger (55mm+) are better for cruising or transition.',
    qty: 1,
    multiSelect: false,
  },
  {
    id: 'hardware',
    label: 'Hardware',
    icon: '🔩',
    description: 'Bearings, griptape, bolts & more',
    keywords: ['bearing', 'hardware', 'grip', 'bolt', 'griptape'],
    tip: "Pick as many as you need — bearings, griptape, and hardware bolts all go on the same board.",
    qty: 1,
    multiSelect: true,
  },
]

// selections is Record<stepId, product[]>
type Selections = Record<string, any[]>

// Matches the free assembly/build-and-ship service product by tag OR title
function isAssemblyProduct(p: any): boolean {
  const tags = (p.tags || []).map((t: string) => t.toLowerCase())
  const title = (p.title || '').toLowerCase()
  return (
    tags.some((t: string) => t.includes('assembly') || t.includes('build-and-ship') || t.includes('build and ship')) ||
    title.includes('assembly') ||
    title.includes('build and ship') ||
    title.includes('build & ship')
  )
}

function getStepProducts(products: any[], step: typeof STEPS[0]) {
  return products.filter(p => {
    const text = [p.title, p.productType, ...(p.tags || [])].join(' ').toLowerCase()
    const matchesStep = step.keywords.some(kw => text.includes(kw))
    const inStock = p.variants.edges.some((v: any) => v.node.availableForSale)
    return matchesStep && inStock
  })
}

export default function BuildABoard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selections, setSelections] = useState<Selections>({})
  const [added, setAdded] = useState(false)
  const [search, setSearch] = useState('')
  const [buildAndShip, setBuildAndShip] = useState(false)

  // Find the free assembly service product by tag or title
  const assemblyProduct = products.find(isAssemblyProduct)

  useEffect(() => {
    getProducts().then(prods => {
      // Debug: log all products with their tags to help find the assembly service product
      console.log('[BAB] All products from Shopify:', prods.map(p => ({ title: p.title, tags: p.tags, type: p.productType })))
      // Include assembly-service product even if it would normally be excluded
      setProducts(prods.filter(p => !isExcluded(p) || isAssemblyProduct(p)))
      setLoading(false)
    })
  }, [])

  // Clear search whenever the step changes
  useEffect(() => { setSearch('') }, [step])

  const currentStep = STEPS[step]
  const isReview = step === STEPS.length
  const stepProducts = currentStep ? getStepProducts(products, currentStep) : []

  // Re-run scroll reveal whenever step or products change
  useScrollReveal([step, loading, isReview])

  // Total items selected across all steps
  const totalSelectedItems = Object.values(selections).reduce((n, arr) => n + arr.length, 0)

  const isSelectedInStep = (product: any, stepId: string) =>
    (selections[stepId] ?? []).some((p: any) => p.id === product.id)

  const toggle = (product: any) => {
    const stepId = currentStep.id
    const current = selections[stepId] ?? []
    if (currentStep.multiSelect) {
      // Toggle in/out of array
      const alreadyIn = current.some((p: any) => p.id === product.id)
      setSelections(prev => ({
        ...prev,
        [stepId]: alreadyIn ? current.filter((p: any) => p.id !== product.id) : [...current, product]
      }))
    } else {
      // Single select — replace, then auto-advance after a brief pause
      setSelections(prev => ({ ...prev, [stepId]: [product] }))
      setTimeout(() => setStep(s => s + 1), 420)
    }
  }

  const stepSelectionCount = (stepId: string) => (selections[stepId] ?? []).length

  const addAllToCart = () => {
    const existing: any[] = (() => {
      try { return JSON.parse(localStorage.getItem('hb_cart') || '[]') } catch { return [] }
    })()

    const newItems: any[] = []
    for (const [stepId, products] of Object.entries(selections)) {
      const stepDef = STEPS.find(s => s.id === stepId)
      for (const product of products) {
        const variant = product.variants.edges[0]?.node
        newItems.push({
          variantId: variant?.id,
          title: product.title,
          vendor: product.vendor,
          price: product.priceRange.minVariantPrice.amount,
          image: product.images.edges[0]?.node.url || '',
          variantTitle: variant?.title === 'Default Title' ? '' : (variant?.title || ''),
          productType: product.productType,
          quantity: stepDef?.qty ?? 1,
        })
      }
    }

    const merged = [...existing]
    for (const item of newItems) {
      const idx = merged.findIndex(i => i.variantId === item.variantId)
      if (idx >= 0) merged[idx].quantity += item.quantity
      else merged.push(item)
    }

    // If build & ship is checked, add the free assembly service product
    if (buildAndShip && assemblyProduct) {
      const variant = assemblyProduct.variants.edges[0]?.node
      if (variant && !merged.find(i => i.variantId === variant.id)) {
        merged.push({
          variantId: variant.id,
          title: assemblyProduct.title,
          vendor: assemblyProduct.vendor || 'Hart Boys',
          price: '0.00',
          image: assemblyProduct.images.edges[0]?.node.url || '',
          variantTitle: '',
          productType: assemblyProduct.productType,
          quantity: 1,
        })
      }
    }

    localStorage.setItem('hb_cart', JSON.stringify(merged))
    setAdded(true)
    setTimeout(() => navigate('/shop?open_cart=1'), 900)
  }

  const totalPrice = Object.entries(selections).reduce((sum, [stepId, prods]) => {
    const stepDef = STEPS.find(s => s.id === stepId)
    return sum + prods.reduce((s, p) =>
      s + parseFloat(p.priceRange.minVariantPrice.amount) * (stepDef?.qty ?? 1), 0)
  }, 0)

  // Can always advance — just show skip if nothing selected
  const canAdvance = true

  return (
    <div style={{ minHeight: '100vh', background: BG, paddingTop: 90, paddingBottom: 80 }}>
      <style>{`
        @keyframes babCardIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .bab-card { transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s; cursor: pointer; }
        .bab-card:hover { border-color: ${GOLD} !important; transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,0.4); }
        .bab-card.selected { border-color: ${GOLD} !important; box-shadow: 0 0 0 1px ${GOLD}, 0 6px 24px rgba(201,169,97,0.15); }
        .step-dot { transition: background 0.2s, border-color 0.2s; cursor: pointer; }
        .next-btn { transition: background 0.2s; }
        .next-btn:hover { filter: brightness(1.1); }
        .skip-link { transition: color 0.15s; }
        .skip-link:hover { color: ${TEXT} !important; }
        .assembly-check:hover { border-color: ${GOLD} !important; }
      `}</style>

      <div style={{ maxWidth: 920, margin: '0 auto', padding: '0 1.25rem' }}>

        {/* Header */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ color: GOLD, fontSize: '0.72rem', letterSpacing: '0.2em', fontWeight: 700, marginBottom: '0.5rem' }}>HART BOYS SKATE SHOP</p>
          <h1 style={{ color: TEXT, fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 0.75rem' }}>
            BUILD YOUR BOARD
          </h1>
          <p style={{ color: MUTED, fontSize: '0.9rem', maxWidth: 480, margin: '0 auto' }}>
            Pick each component step by step. We'll add everything to your cart at once.
          </p>
        </div>

        {/* Step progress */}
        <div className="reveal reveal-delay-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem', gap: 0 }}>
          {STEPS.map((s, i) => {
            const count = stepSelectionCount(s.id)
            const done = count > 0
            const active = i === step && !isReview
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <button className="step-dot" onClick={() => !isReview && setStep(i)} style={{
                    width: 44, height: 44, borderRadius: '50%',
                    border: `2px solid ${active ? GOLD : done ? GREEN : BORDER}`,
                    background: active ? GOLD2 : done ? 'rgba(74,222,128,0.1)' : BG2,
                    color: active ? GOLD : done ? GREEN : MUTED,
                    fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                  }}>
                    {done && !active ? '✓' : s.id === 'trucks' ? (
                      <div style={{ width: 30, height: 30, overflow: 'hidden', borderRadius: 4 }}>
                        <img src="/trucks.png" alt="trucks" style={{ width: 52, height: 52, objectFit: 'cover', objectPosition: 'center 20%', marginLeft: -11, marginTop: -4 }} />
                      </div>
                    ) : s.icon}
                    {done && count > 1 && (
                      <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, background: GOLD, borderRadius: '50%', fontSize: '0.55rem', color: BG, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>
                    )}
                  </button>
                  <span style={{ fontSize: '0.62rem', color: active ? GOLD : done ? GREEN : MUTED, letterSpacing: '0.08em', fontWeight: active ? 700 : 400, whiteSpace: 'nowrap' }}>
                    {s.label.toUpperCase()}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: 'clamp(20px, 5vw, 56px)', height: 2, background: done ? GREEN : BORDER, margin: '0 4px', marginBottom: 22, transition: 'background 0.3s' }} />
                )}
              </div>
            )
          })}
          {/* Review dot */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 'clamp(20px, 5vw, 56px)', height: 2, background: isReview ? GREEN : BORDER, margin: '0 4px', marginBottom: 22, transition: 'background 0.3s' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
              <button className="step-dot" onClick={() => setStep(STEPS.length)} style={{ width: 44, height: 44, borderRadius: '50%', border: `2px solid ${isReview ? GOLD : BORDER}`, background: isReview ? GOLD2 : BG2, color: isReview ? GOLD : MUTED, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🛒</button>
              <span style={{ fontSize: '0.62rem', color: isReview ? GOLD : MUTED, letterSpacing: '0.08em', fontWeight: isReview ? 700 : 400 }}>REVIEW</span>
            </div>
          </div>
        </div>

        {/* Step content */}
        {!isReview ? (
          <div>
            {/* Step header */}
            <div className="reveal" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h2 style={{ color: TEXT, fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.2rem', letterSpacing: '-0.01em' }}>
                  {currentStep.id === 'trucks'
                    ? <img src="/trucks.png" alt="trucks" style={{ width: 28, height: 20, objectFit: 'cover', objectPosition: 'center 20%', verticalAlign: 'middle', marginRight: 4, borderRadius: 3 }} />
                    : currentStep.icon
                  } Step {step + 1}: Choose Your {currentStep.label}
                </h2>
                <p style={{ color: MUTED, fontSize: '0.82rem', margin: 0 }}>
                  {currentStep.description}
                  {currentStep.multiSelect && <span style={{ color: GOLD, marginLeft: '0.4rem' }}>— pick as many as you need</span>}
                </p>
              </div>
              {stepSelectionCount(currentStep.id) > 0 && (
                <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 8, padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: GREEN, fontSize: '0.75rem', fontWeight: 700 }}>
                    ✓ {stepSelectionCount(currentStep.id)} selected
                  </span>
                </div>
              )}
            </div>

            {/* Pro tip */}
            <div className="reveal reveal-delay-1" style={{ background: GOLD2, border: `1px solid rgba(201,169,97,0.2)`, borderRadius: 8, padding: '0.55rem 0.875rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.8rem', flexShrink: 0 }}>💡</span>
              <p style={{ color: MUTED, fontSize: '0.75rem', margin: 0, lineHeight: 1.5 }}>
                <strong style={{ color: GOLD }}>Pro tip:</strong> {currentStep.tip}
              </p>
            </div>

            {/* Products */}
            {/* Search bar */}
            {!loading && stepProducts.length > 0 && (
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4, pointerEvents: 'none' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={`Search ${currentStep.label.toLowerCase()}s...`}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: BG2, border: `1px solid ${BORDER}`,
                    borderRadius: 8, color: TEXT, fontSize: '0.875rem',
                    padding: '0.6rem 2.25rem 0.6rem 2.5rem',
                    outline: 'none', fontFamily: 'inherit',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = GOLD}
                  onBlur={e => e.target.style.borderColor = BORDER}
                />
                {search && (
                  <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: '0.1rem 0.3rem' }}>×</button>
                )}
              </div>
            )}

            {(() => {
              const filtered = search.trim()
                ? stepProducts.filter(p => [p.title, p.vendor, p.productType].filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase()))
                : stepProducts
              return loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: MUTED }}>Loading products...</div>
            ) : stepProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: MUTED, background: BG2, borderRadius: 10, border: `1px dashed ${BORDER}` }}>
                <p style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.3 }}>😅</p>
                <p style={{ marginBottom: '1rem' }}>No {currentStep.label.toLowerCase()} in stock right now.</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: MUTED, background: BG2, borderRadius: 10, border: `1px dashed ${BORDER}` }}>
                <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem', opacity: 0.3 }}>🔍</p>
                <p>No results for "<strong style={{ color: TEXT }}>{search}</strong>"</p>
                <button onClick={() => setSearch('')} style={{ marginTop: '0.75rem', background: 'none', border: `1px solid ${BORDER}`, color: MUTED, padding: '0.4rem 1rem', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem' }}>Clear search</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
                {filtered.map((p, idx) => {
                  const img = p.images.edges[0]?.node.url
                  const price = p.priceRange.minVariantPrice.amount
                  const selected = isSelectedInStep(p, currentStep.id)
                  return (
                    <div key={p.id}
                      className={`bab-card${selected ? ' selected' : ''}`}
                      onClick={() => toggle(p)}
                      style={{ background: BG2, border: `1.5px solid ${selected ? GOLD : BORDER}`, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', animation: `babCardIn 0.3s ease ${(idx % 6) * 0.05}s both` }}
                    >
                      <div style={{ aspectRatio: '1', background: BG3, position: 'relative', overflow: 'hidden' }}>
                        {img
                          ? <img src={img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', opacity: 0.2 }}>🛹</div>
                        }
                        {selected && (
                          <div style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, background: GOLD, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: BG }}>✓</div>
                        )}
                      </div>
                      <div style={{ padding: '0.6rem' }}>
                        {p.vendor && <p style={{ margin: '0 0 0.1rem', color: GOLD, fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{p.vendor}</p>}
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
            )
            })()}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: `1px solid ${BORDER}` }}>
              <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
                style={{ padding: '0.6rem 1.25rem', background: 'none', border: `1px solid ${step === 0 ? '#1a1a1a' : BORDER}`, color: step === 0 ? '#2a2a2a' : MUTED, borderRadius: 6, cursor: step === 0 ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: '0.85rem' }}>
                ← Back
              </button>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {stepSelectionCount(currentStep.id) === 0 && stepProducts.length > 0 && (
                  <button className="skip-link" onClick={() => setStep(s => s + 1)}
                    style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                    Skip
                  </button>
                )}
                <button className="next-btn" onClick={() => setStep(s => s + 1)}
                  style={{
                    padding: '0.65rem 1.75rem',
                    background: stepSelectionCount(currentStep.id) > 0 ? GOLD : '#2a2a2a',
                    color: stepSelectionCount(currentStep.id) > 0 ? BG : MUTED,
                    border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit',
                    fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.06em',
                  }}>
                  {step === STEPS.length - 1 ? 'Review Board →' : 'Next Step →'}
                </button>
              </div>
            </div>
          </div>

        ) : (
          /* Review step */
          <div>
            <h2 className="reveal" style={{ color: TEXT, fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.5rem', textAlign: 'center', letterSpacing: '-0.01em' }}>🛒 Your Complete Board</h2>
            <p className="reveal reveal-delay-1" style={{ color: MUTED, fontSize: '0.82rem', textAlign: 'center', marginBottom: '1.75rem' }}>
              {totalSelectedItems === 0 ? 'No items selected yet.' : `${totalSelectedItems} item${totalSelectedItems !== 1 ? 's' : ''} ready to add`}
            </p>

            {totalSelectedItems === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: MUTED }}>
                <button onClick={() => setStep(0)} style={{ padding: '0.7rem 1.75rem', background: GOLD, border: 'none', color: BG, borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.06em' }}>Start Building</button>
              </div>
            ) : (
              <>
                {/* Per-step review */}
                {STEPS.map((s, i) => {
                  const picks = selections[s.id] ?? []
                  return (
                    <div key={s.id} className={`reveal reveal-delay-${(i % 4) + 1}`} style={{ marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: picks.length > 0 ? GOLD : MUTED, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                          {s.icon} {s.label.toUpperCase()} {picks.length > 0 ? `(${picks.length})` : ''}
                        </span>
                        <button onClick={() => setStep(STEPS.indexOf(s))} style={{ background: 'none', border: `1px solid ${BORDER}`, color: MUTED, fontSize: '0.68rem', padding: '0.2rem 0.6rem', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit' }}>
                          {picks.length > 0 ? 'Change' : 'Add'}
                        </button>
                      </div>
                      {picks.length === 0 ? (
                        <div style={{ background: BG2, border: `1.5px dashed ${BORDER}`, borderRadius: 8, padding: '0.875rem', textAlign: 'center', color: MUTED, fontSize: '0.78rem' }}>
                          Nothing selected — <button onClick={() => setStep(STEPS.indexOf(s))} style={{ background: 'none', border: 'none', color: GOLD, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem', textDecoration: 'underline' }}>add a {s.label.toLowerCase()}</button>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '0.625rem' }}>
                          {picks.map((p: any) => {
                            const img = p.images.edges[0]?.node.url
                            const unitPrice = parseFloat(p.priceRange.minVariantPrice.amount)
                            const linePrice = unitPrice * (s.qty ?? 1)
                            return (
                              <div key={p.id} style={{ background: BG2, border: `1.5px solid ${GOLD}`, borderRadius: 8, overflow: 'hidden', display: 'flex', gap: '0.625rem', alignItems: 'center', padding: '0.5rem' }}>
                                <div style={{ width: 48, height: 48, borderRadius: 6, overflow: 'hidden', background: BG3, flexShrink: 0 }}>
                                  {img ? <img src={img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>🛹</div>}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{ margin: '0 0 0.1rem', color: TEXT, fontSize: '0.72rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                                  <p style={{ margin: 0, color: GOLD, fontSize: '0.72rem', fontWeight: 700 }}>
                                    ${linePrice.toFixed(2)}
                                    {s.qty && s.qty > 1 && <span style={{ color: MUTED, fontWeight: 400, fontSize: '0.62rem' }}> ×{s.qty}</span>}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Total & checkout */}
                <div className="reveal" style={{ background: BG2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '1.25rem 1.5rem', maxWidth: 420, margin: '1.5rem auto 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: '0.75rem', marginBottom: '0.75rem', borderBottom: `1px solid ${BORDER}` }}>
                    <span style={{ color: MUTED, fontSize: '0.82rem', letterSpacing: '0.06em' }}>ESTIMATED TOTAL</span>
                    <span style={{ color: GOLD, fontSize: '1.5rem', fontWeight: 700 }}>${totalPrice.toFixed(2)}</span>
                  </div>
                  {totalPrice >= 150 && (
                    <p style={{ color: GREEN, fontSize: '0.75rem', textAlign: 'center', margin: '0 0 0.75rem', fontWeight: 600 }}>🎉 Qualifies for FREE shipping!</p>
                  )}
                  {totalPrice > 0 && totalPrice < 150 && (
                    <p style={{ color: MUTED, fontSize: '0.72rem', textAlign: 'center', margin: '0 0 0.75rem' }}>
                      Add ${(150 - totalPrice).toFixed(2)} more for free shipping
                    </p>
                  )}
                  {/* Build & Ship Complete checkbox */}
                  <label className="assembly-check" onClick={() => setBuildAndShip(b => !b)} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    background: buildAndShip ? 'rgba(201,169,97,0.08)' : BG3,
                    border: `1.5px solid ${buildAndShip ? GOLD : BORDER}`,
                    borderRadius: 8, padding: '0.75rem', marginBottom: '1rem',
                    cursor: 'pointer', transition: 'background 0.2s, border-color 0.2s',
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
                      border: `2px solid ${buildAndShip ? GOLD : MUTED}`,
                      background: buildAndShip ? GOLD : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.15s, border-color 0.15s',
                    }}>
                      {buildAndShip && <span style={{ color: BG, fontSize: '0.65rem', fontWeight: 900, lineHeight: 1 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 0.2rem', color: TEXT, fontSize: '0.82rem', fontWeight: 700 }}>
                        🛹 Build &amp; Ship Complete{' '}
                        <span style={{ color: GREEN, fontSize: '0.7rem', fontWeight: 700, background: 'rgba(74,222,128,0.1)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>FREE</span>
                      </p>
                      <p style={{ margin: 0, color: MUTED, fontSize: '0.72rem', lineHeight: 1.5 }}>
                        We'll assemble your board and ship it ready to skate — no extra charge.
                      </p>
                      {buildAndShip && !assemblyProduct && (
                        <p style={{ margin: '0.35rem 0 0', color: '#f87171', fontSize: '0.68rem' }}>
                          ⚠ Assembly service product not found in store — please contact us.
                        </p>
                      )}
                      {buildAndShip && assemblyProduct && (
                        <p style={{ margin: '0.35rem 0 0', color: GREEN, fontSize: '0.68rem', fontWeight: 600 }}>
                          ✓ "{assemblyProduct.title}" will be added to your cart
                        </p>
                      )}
                    </div>
                  </label>

                  <button onClick={addAllToCart} disabled={added}
                    style={{
                      width: '100%', padding: '0.9rem', background: added ? '#1a3a1a' : GOLD,
                      color: added ? GREEN : BG, border: 'none', borderRadius: 6, fontWeight: 700,
                      fontSize: '0.95rem', letterSpacing: '0.08em', cursor: added ? 'default' : 'pointer',
                      fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      transition: 'background 0.3s, color 0.3s', boxShadow: added ? 'none' : `0 4px 16px rgba(201,169,97,0.25)`,
                    }}>
                    {added ? '✓ ADDED — HEADING TO CART...' : `ADD ALL TO CART (${totalSelectedItems} item${totalSelectedItems !== 1 ? 's' : ''})`}
                  </button>
                  <p style={{ textAlign: 'center', color: MUTED, fontSize: '0.72rem', marginTop: '0.75rem' }}>🔒 Secure checkout via Shopify</p>
                </div>

                <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                  <button onClick={() => { setStep(0); setSelections({}) }} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                    ← Start over
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
