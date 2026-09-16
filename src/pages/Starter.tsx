import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, type Product } from '../lib/shopify'
import {
  productsForCompletes,
  productsForPart,
  unitPrice,
  type StarterPartId,
} from '../lib/catalog'
import { firstAvailableVariant, isInStock } from '../lib/stock'
import { formatUsd, shopInfo } from '../lib/shopInfo'
import type { CartItem } from '../lib/cart'
import { useCart } from '../context/CartContext'
import Seo from '../components/Seo'

const GOLD = '#C9A961'
const GOLD_LIGHT = '#D4AF37'
const BG = '#0a0a0a'
const BG2 = '#111'
const BG3 = '#1a1a1a'
const TEXT = '#F5F1E8'
const MUTED = '#8a857a'
const BORDER = '#2a2a2a'
const GREEN = '#4ade80'

type Mode = 'complete' | 'parts'

type PartDef = {
  id: StarterPartId
  label: string
  icon: string
  required: boolean
  qty: number
  blurb: string
}

const PARTS: PartDef[] = [
  { id: 'deck', label: 'Deck', icon: '🛹', required: true, qty: 1, blurb: 'The board you stand on. Width is often in the title — around 8.0–8.25 is a common first size.' },
  { id: 'trucks', label: 'Trucks', icon: '⚙️', required: true, qty: 2, blurb: 'You need a pair. We add two when you pick one style.' },
  { id: 'wheels', label: 'Wheels', icon: '⭕', required: true, qty: 1, blurb: 'A set of four. Smaller is typical for street; bigger rolls easier outside.' },
  { id: 'grip', label: 'Griptape', icon: '⬛', required: true, qty: 1, blurb: 'The grip layer on top of the deck.' },
  { id: 'bearings', label: 'Bearings', icon: '⚪', required: false, qty: 1, blurb: 'Go inside the wheels. Skip only if your wheels already include them.' },
  { id: 'hardware', label: 'Hardware', icon: '🔩', required: false, qty: 1, blurb: 'Bolts that hold the trucks to the deck. Easy to add if we have them in stock.' },
]

function toCartItem(p: Product, quantity: number): CartItem | null {
  const variant = firstAvailableVariant(p)
  if (!variant || !variant.availableForSale) return null
  return {
    variantId: variant.id,
    title: p.title,
    vendor: p.vendor,
    variantTitle: variant.title === 'Default Title' ? '' : variant.title,
    price: variant.price?.amount || p.priceRange.minVariantPrice.amount,
    image: p.images.edges[0]?.node.url,
    quantity,
    productType: p.productType,
  }
}

function ProductThumb({ product }: { product: Product }) {
  const img = product.images.edges[0]?.node.url
  return (
    <div style={{ aspectRatio: '1', background: BG, position: 'relative', overflow: 'hidden' }}>
      {img
        ? <img src={img} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', opacity: 0.25 }}>🛹</div>}
    </div>
  )
}

export default function Starter() {
  const { addItems, addItem } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>('complete')
  const [step, setStep] = useState(0)
  const [picks, setPicks] = useState<Partial<Record<StarterPartId, Product>>>({})
  const [added, setAdded] = useState(false)

  useEffect(() => {
    getProducts()
      .then(list => {
        setProducts(list)
        setLoading(false)
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Unable to load products')
        setLoading(false)
      })
  }, [])

  const completes = useMemo(() => productsForCompletes(products), [products])
  const pools = useMemo(() => {
    const next: Record<StarterPartId, Product[]> = {
      deck: productsForPart(products, 'deck'),
      trucks: productsForPart(products, 'trucks'),
      wheels: productsForPart(products, 'wheels'),
      grip: productsForPart(products, 'grip'),
      bearings: productsForPart(products, 'bearings'),
      hardware: productsForPart(products, 'hardware'),
    }
    return next
  }, [products])

  useEffect(() => {
    if (loading) return
    setPicks(prev => {
      const next = { ...prev }
      for (const part of PARTS) {
        if (!next[part.id] && pools[part.id][0]) next[part.id] = pools[part.id][0]
      }
      return next
    })
    if (completes.length === 0) setMode('parts')
  }, [loading, pools, completes.length])

  const visibleParts = PARTS.filter(p => p.required || pools[p.id].length > 0)
  const currentPart = visibleParts[step]
  const isReview = step >= visibleParts.length

  const partsTotal = visibleParts.reduce((sum, part) => {
    const product = picks[part.id]
    if (!product) return sum
    return sum + unitPrice(product) * part.qty
  }, 0)

  const requiredReady = PARTS
    .filter(p => p.required)
    .every(p => !pools[p.id].length || !!picks[p.id])

  const remainingForFreeShip = Math.max(0, shopInfo.freeShippingThreshold - partsTotal)
  const freeShipUnlocked = partsTotal >= shopInfo.freeShippingThreshold

  const addPartsToCart = () => {
    if (!requiredReady) return
    const items: CartItem[] = []
    for (const part of visibleParts) {
      const product = picks[part.id]
      if (!product) continue
      const item = toCartItem(product, part.qty)
      if (item) items.push(item)
    }
    addItems(items)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1600)
  }

  const addComplete = (p: Product) => {
    const item = toCartItem(p, 1)
    if (!item) return
    addItem(item)
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, paddingTop: 90, paddingBottom: 80 }}>
      <Seo
        title={`First board | ${shopInfo.name}`}
        description={`Build a first skateboard from in-stock decks, trucks, wheels, and grip at ${shopInfo.name} in ${shopInfo.city}, ${shopInfo.state}. Free shipping at ${formatUsd(shopInfo.freeShippingThreshold)}+.`}
        path="/starter"
      />
      <style>{`
        .starter-card { transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s; }
        .starter-card:hover { border-color: ${GOLD} !important; transform: translateY(-2px); }
        .starter-card.selected { border-color: ${GOLD} !important; box-shadow: 0 0 0 1px ${GOLD}; }
        .starter-tab:hover { color: ${GOLD} !important; }
        .starter-add:hover:not(:disabled) { background: ${GOLD_LIGHT} !important; }
      `}</style>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 1.25rem' }}>
        <p style={{ color: GOLD, fontSize: '0.72rem', letterSpacing: '0.2em', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>
          {shopInfo.name.toUpperCase()}
        </p>
        <h1 style={{ color: TEXT, fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 0.75rem', textAlign: 'center' }}>
          YOUR FIRST BOARD
        </h1>
        <p style={{ color: MUTED, fontSize: '0.95rem', maxWidth: 560, margin: '0 auto 1.75rem', textAlign: 'center', lineHeight: 1.65 }}>
          Don’t know the parts? Grab an in-stock complete, or we’ll walk you through a deck, trucks, wheels, and grip from what’s actually on the wall.
        </p>

        <div style={{
          display: 'flex', justifyContent: 'center', gap: 0, marginBottom: '2rem',
          background: BG2, border: `1px solid ${BORDER}`, borderRadius: 8, overflow: 'hidden', maxWidth: 440, marginLeft: 'auto', marginRight: 'auto',
        }}>
          <button
            type="button"
            className="starter-tab"
            onClick={() => setMode('complete')}
            disabled={completes.length === 0 && !loading}
            style={{
              flex: 1, padding: '0.75rem 1rem', border: 'none', cursor: completes.length === 0 ? 'default' : 'pointer',
              background: mode === 'complete' ? GOLD : 'transparent',
              color: mode === 'complete' ? BG : MUTED,
              fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.78rem', fontFamily: 'inherit',
              opacity: completes.length === 0 && !loading ? 0.45 : 1,
            }}
          >
            READY-MADE
          </button>
          <button
            type="button"
            className="starter-tab"
            onClick={() => setMode('parts')}
            style={{
              flex: 1, padding: '0.75rem 1rem', border: 'none', cursor: 'pointer',
              background: mode === 'parts' ? GOLD : 'transparent',
              color: mode === 'parts' ? BG : MUTED,
              fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.78rem', fontFamily: 'inherit',
            }}
          >
            PICK THE PARTS
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: MUTED }}>
            <div style={{ width: 40, height: 40, border: `3px solid ${BORDER}`, borderTopColor: GOLD, borderRadius: '50%', animation: 'hb-spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
            Loading in-stock gear…
            <style>{`@keyframes hb-spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#f87171' }}>
            <p>{error}</p>
            <Link to="/shop" style={{ color: GOLD }}>Browse the shop</Link>
          </div>
        )}

        {!loading && !error && mode === 'complete' && (
          <div>
            {completes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: BG2, border: `1px dashed ${BORDER}`, borderRadius: 10, color: MUTED }}>
                <p style={{ marginBottom: '1rem' }}>No complete setups in stock right now. Pick the parts instead — or browse the shop.</p>
                <button type="button" onClick={() => setMode('parts')} style={{ padding: '0.7rem 1.4rem', background: GOLD, border: 'none', color: BG, borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  PICK THE PARTS
                </button>
              </div>
            ) : (
              <>
                <p style={{ color: MUTED, fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.25rem' }}>
                  {completes.length} complete{completes.length === 1 ? '' : 's'} ready to skate — in stock only.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  {completes.map(p => {
                    const price = unitPrice(p)
                    const inStock = isInStock(p)
                    return (
                      <div key={p.id} className="starter-card" style={{ background: BG2, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <Link to={`/shop/${p.handle}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <ProductThumb product={p} />
                          <div style={{ padding: '0.75rem 0.85rem 0.4rem' }}>
                            {p.vendor && <p style={{ margin: 0, color: GOLD, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{p.vendor}</p>}
                            <p style={{ margin: '0.2rem 0 0.4rem', color: TEXT, fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.35 }}>{p.title}</p>
                            <p style={{ margin: 0, color: GOLD, fontWeight: 700 }}>{formatUsd(price)}</p>
                          </div>
                        </Link>
                        <div style={{ padding: '0.65rem 0.85rem 0.9rem', marginTop: 'auto' }}>
                          <button
                            type="button"
                            className="starter-add"
                            disabled={!inStock}
                            onClick={() => addComplete(p)}
                            style={{
                              width: '100%', padding: '0.65rem',
                              background: inStock ? GOLD : '#222', color: inStock ? BG : MUTED,
                              border: 'none', borderRadius: 6, fontWeight: 700, letterSpacing: '0.06em',
                              cursor: inStock ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                            }}
                          >
                            ADD COMPLETE
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
            <p style={{ textAlign: 'center', color: MUTED, fontSize: '0.8rem', marginTop: '1.75rem' }}>
              Want every option and hardware tabs? <Link to="/build" style={{ color: GOLD }}>Build a Board</Link> is the full picker.
            </p>
          </div>
        )}

        {!loading && !error && mode === 'parts' && currentPart && !isReview && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {visibleParts.map((part, i) => {
                const chosen = !!picks[part.id]
                return (
                  <button
                    key={part.id}
                    type="button"
                    onClick={() => setStep(i)}
                    style={{
                      padding: '0.4rem 0.7rem',
                      background: i === step ? 'rgba(201,169,97,0.12)' : BG2,
                      border: `1px solid ${i === step ? GOLD : chosen ? GREEN : BORDER}`,
                      color: i === step ? GOLD : chosen ? GREEN : MUTED,
                      borderRadius: 20, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em',
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {chosen ? '✓ ' : ''}{part.label.toUpperCase()}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => requiredReady && setStep(visibleParts.length)}
                disabled={!requiredReady}
                style={{
                  padding: '0.4rem 0.7rem',
                  background: BG2,
                  border: `1px solid ${requiredReady ? GOLD : BORDER}`,
                  color: requiredReady ? GOLD : MUTED,
                  borderRadius: 20, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em',
                  cursor: requiredReady ? 'pointer' : 'default', fontFamily: 'inherit',
                }}
              >
                REVIEW
              </button>
            </div>

            <h2 style={{ color: TEXT, fontSize: '1.25rem', margin: '0 0 0.35rem' }}>
              {currentPart.icon} {currentPart.label}
              {currentPart.qty > 1 ? <span style={{ color: MUTED, fontSize: '0.8rem' }}> ×{currentPart.qty}</span> : null}
              {!currentPart.required && <span style={{ color: MUTED, fontSize: '0.75rem', marginLeft: '0.5rem' }}>(optional)</span>}
            </h2>
            <p style={{ color: MUTED, fontSize: '0.85rem', margin: '0 0 1.25rem', lineHeight: 1.55 }}>{currentPart.blurb}</p>

            {pools[currentPart.id].length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: MUTED, background: BG2, border: `1px dashed ${BORDER}`, borderRadius: 10 }}>
                No in-stock {currentPart.label.toLowerCase()} right now.
                {currentPart.required
                  ? <> Check the <Link to="/shop" style={{ color: GOLD }}>shop</Link> or try again later.</>
                  : ' You can skip this one.'}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))', gap: '0.85rem' }}>
                {pools[currentPart.id].map(p => {
                  const selected = picks[currentPart.id]?.id === p.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={`starter-card${selected ? ' selected' : ''}`}
                      onClick={() => {
                        setPicks(prev => ({ ...prev, [currentPart.id]: p }))
                        if (currentPart.required && step < visibleParts.length - 1) {
                          window.setTimeout(() => setStep(s => s + 1), 280)
                        }
                      }}
                      style={{
                        background: BG2, border: `1.5px solid ${selected ? GOLD : BORDER}`,
                        borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                        textAlign: 'left', padding: 0, fontFamily: 'inherit', color: 'inherit',
                      }}
                    >
                      <ProductThumb product={p} />
                      <div style={{ padding: '0.6rem' }}>
                        {p.vendor && <p style={{ margin: 0, color: GOLD, fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{p.vendor}</p>}
                        <p style={{ margin: '0.15rem 0 0.3rem', color: TEXT, fontSize: '0.78rem', fontWeight: 600, lineHeight: 1.3 }}>{p.title}</p>
                        <p style={{ margin: 0, color: GOLD, fontWeight: 700, fontSize: '0.82rem' }}>
                          {formatUsd(unitPrice(p))}
                          {currentPart.qty > 1 && <span style={{ color: MUTED, fontWeight: 400, fontSize: '0.65rem' }}> ×{currentPart.qty}</span>}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setStep(s => Math.max(0, s - 1))}
                disabled={step === 0}
                style={{ padding: '0.6rem 1.1rem', background: 'none', border: `1px solid ${BORDER}`, color: step === 0 ? '#333' : MUTED, borderRadius: 6, cursor: step === 0 ? 'default' : 'pointer', fontFamily: 'inherit' }}
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(s => s + 1)}
                disabled={currentPart.required && pools[currentPart.id].length > 0 && !picks[currentPart.id]}
                style={{ padding: '0.6rem 1.4rem', background: GOLD, color: BG, border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em' }}
              >
                {step === visibleParts.length - 1 ? 'Review →' : 'Next →'}
              </button>
            </div>
          </div>
        )}

        {!loading && !error && mode === 'parts' && isReview && (
          <div>
            <h2 style={{ color: TEXT, textAlign: 'center', margin: '0 0 0.4rem' }}>Your starter setup</h2>
            <p style={{ color: MUTED, textAlign: 'center', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              In-stock parts from the shop catalog. Change any piece, then add the set to your cart.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxWidth: 560, margin: '0 auto 1.5rem' }}>
              {visibleParts.map((part, i) => {
                const product = picks[part.id]
                return (
                  <div key={part.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: BG2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '0.65rem 0.85rem' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 6, overflow: 'hidden', background: BG3, flexShrink: 0 }}>
                      {product
                        ? <ProductThumb product={product} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>–</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, color: GOLD, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                        {part.label.toUpperCase()}{part.qty > 1 ? ` ×${part.qty}` : ''}{!part.required ? ' · OPTIONAL' : ''}
                      </p>
                      <p style={{ margin: '0.15rem 0 0', color: TEXT, fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product ? product.title : 'Not selected'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {product && <p style={{ margin: 0, color: GOLD, fontWeight: 700 }}>{formatUsd(unitPrice(product) * part.qty)}</p>}
                      <button type="button" onClick={() => setStep(i)} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'inherit', textDecoration: 'underline' }}>
                        Change
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ background: BG2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '1.25rem 1.4rem', maxWidth: 420, margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
                <span style={{ color: MUTED, fontSize: '0.8rem', letterSpacing: '0.06em' }}>ESTIMATED TOTAL</span>
                <span style={{ color: GOLD, fontSize: '1.5rem', fontWeight: 700 }}>{formatUsd(partsTotal)}</span>
              </div>
              <p style={{ margin: '0 0 1rem', color: freeShipUnlocked ? GREEN : MUTED, fontSize: '0.75rem', textAlign: 'center' }}>
                {freeShipUnlocked
                  ? `Free shipping unlocked at ${formatUsd(shopInfo.freeShippingThreshold)}+`
                  : `Free shipping at ${formatUsd(shopInfo.freeShippingThreshold)}+ · add ${formatUsd(remainingForFreeShip)} more`}
              </p>
              <p style={{ margin: '0 0 1rem', color: MUTED, fontSize: '0.75rem', textAlign: 'center', lineHeight: 1.5 }}>
                Pickup in {shopInfo.city} at {shopInfo.mall}, {shopInfo.suite} — or we ship.
              </p>
              <button
                type="button"
                className="starter-add"
                onClick={addPartsToCart}
                disabled={!requiredReady || added || partsTotal <= 0}
                style={{
                  width: '100%', padding: '0.9rem',
                  background: added ? '#1a3a1a' : GOLD,
                  color: added ? GREEN : BG,
                  border: 'none', borderRadius: 6, fontWeight: 700, letterSpacing: '0.07em',
                  cursor: requiredReady ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                  boxShadow: added ? 'none' : '0 4px 16px rgba(201,169,97,0.25)',
                }}
              >
                {added ? '✓ ADDED TO CART' : 'ADD SETUP TO CART'}
              </button>
              <p style={{ textAlign: 'center', marginTop: '0.85rem', fontSize: '0.75rem', color: MUTED }}>
                Need more control? <Link to="/build" style={{ color: GOLD }}>Build a Board</Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
