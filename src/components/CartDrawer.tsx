import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { shopInfo, formatUsd } from '../lib/shopInfo'

const GOLD = '#C9A961'
const BG = '#0a0a0a'
const BG2 = '#111'
const BG3 = '#1a1a1a'
const TEXT = '#F5F1E8'
const MUTED = '#8a857a'
const BORDER = '#2a2a2a'
const RED = '#dc2626'

export default function CartDrawer() {
  const {
    cart,
    removeItem,
    updateQty,
    clearCart,
    cartCount,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    cartAnimating,
    orderNote,
    setOrderNote,
    isCheckingOut,
    checkoutError,
    handleCheckout,
  } = useCart()

  const remaining = Math.max(0, shopInfo.freeShippingThreshold - cartTotal)
  const pct = Math.min(100, (cartTotal / shopInfo.freeShippingThreshold) * 100)
  const unlocked = cartTotal >= shopInfo.freeShippingThreshold

  return (
    <>
      <style>{`
        @keyframes hb-cart-spin { to { transform: rotate(360deg); } }
        .hb-cart-sidebar { width: 420px; }
        .hb-qty-btn:hover { background: #333 !important; }
        .hb-cart-remove:hover { color: ${RED} !important; }
        .hb-cart-scroll::-webkit-scrollbar { width: 4px; }
        .hb-cart-scroll::-webkit-scrollbar-track { background: transparent; }
        .hb-cart-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        @media (max-width: 767px) {
          .hb-cart-sidebar { width: 100vw !important; max-width: 100vw !important; }
        }
      `}</style>

      <button
        onClick={() => setIsCartOpen(true)}
        style={{
          position: 'fixed', bottom: 24, right: 20,
          width: 56, height: 56, borderRadius: '50%',
          background: cartCount > 0 ? GOLD : '#222',
          border: `2px solid ${cartCount > 0 ? GOLD : BORDER}`,
          color: cartCount > 0 ? BG : MUTED,
          cursor: 'pointer', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.3rem',
          boxShadow: cartCount > 0 ? '0 4px 20px rgba(201,169,97,0.35)' : 'none',
          transform: cartAnimating ? 'scale(1.18)' : 'scale(1)',
          transition: 'all 0.25s',
        }}
        aria-label="Open cart"
      >
        🛒
        {cartCount > 0 && (
          <span style={{
            position: 'absolute', top: -6, right: -6,
            background: RED, color: '#fff',
            width: 20, height: 20, borderRadius: '50%',
            fontSize: '0.65rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `2px solid ${BG}`,
          }}>
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        )}
      </button>

      {isCartOpen && (
        <div
          onClick={() => setIsCartOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)', zIndex: 9997 }}
        />
      )}

      <div
        className="hb-cart-sidebar"
        style={{
          position: 'fixed', top: 0, right: isCartOpen ? 0 : '-110%',
          maxWidth: '95vw', height: '100vh',
          background: BG2, zIndex: 9998,
          transition: 'right 0.32s cubic-bezier(0.16,1,0.3,1)',
          display: 'flex', flexDirection: 'column',
          borderLeft: `2px solid ${GOLD}`,
          boxShadow: isCartOpen ? '-8px 0 48px rgba(0,0,0,0.7)' : 'none',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.125rem 1.25rem', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ color: GOLD, fontWeight: 700, letterSpacing: '0.08em', fontSize: '1rem' }}>YOUR CART</span>
            {cartCount > 0 && (
              <span style={{ background: GOLD, color: BG, padding: '0.1rem 0.5rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>{cartCount}</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {cart.length > 0 && (
              <button onClick={clearCart} style={{ background: 'none', border: 'none', color: MUTED, fontSize: '0.7rem', cursor: 'pointer', letterSpacing: '0.05em', textDecoration: 'underline', textUnderlineOffset: 2, fontFamily: 'inherit' }}>
                Clear all
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              style={{ background: 'none', border: 'none', color: MUTED, fontSize: '1.6rem', cursor: 'pointer', lineHeight: 1, padding: '0.2rem 0.4rem' }}
            >×</button>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(180deg, rgba(201,169,97,0.16) 0%, rgba(201,169,97,0.06) 100%)',
          borderBottom: `1px solid rgba(201,169,97,0.35)`,
          padding: '0.9rem 1.25rem',
          flexShrink: 0,
        }}>
          <p style={{ margin: 0, color: GOLD, fontSize: '0.92rem', fontWeight: 800, letterSpacing: '0.06em' }}>
            Pick up in {shopInfo.city}
          </p>
          <p style={{ margin: '0.3rem 0 0', color: TEXT, fontSize: '0.8rem', lineHeight: 1.5 }}>
            {shopInfo.mall} · {shopInfo.suite}
          </p>
          <p style={{ margin: '0.35rem 0 0', color: MUTED, fontSize: '0.72rem', lineHeight: 1.5 }}>
            Shipping is also available — free at {formatUsd(shopInfo.freeShippingThreshold)}+.
            {' '}
            <Link to="/shipping" onClick={() => setIsCartOpen(false)} style={{ color: GOLD }}>Shipping &amp; pickup</Link>
          </p>
        </div>

        <div className="hb-cart-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0.875rem' }}>
          {!cart.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: MUTED, textAlign: 'center', gap: '1rem', padding: '2rem' }}>
              <div style={{ fontSize: '4rem', opacity: 0.15, lineHeight: 1 }}>🛹</div>
              <div>
                <p style={{ fontSize: '0.95rem', letterSpacing: '0.08em', fontWeight: 700, color: TEXT, margin: '0 0 0.4rem' }}>YOUR CART IS EMPTY</p>
                <p style={{ fontSize: '0.78rem', color: MUTED, margin: 0 }}>Add some gear to get started</p>
              </div>
              <Link
                to="/shop"
                onClick={() => setIsCartOpen(false)}
                style={{ padding: '0.7rem 1.75rem', background: GOLD, border: 'none', color: BG, borderRadius: 6, fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.08em', fontFamily: 'inherit', marginTop: '0.5rem', textDecoration: 'none' }}
              >
                SHOP NOW
              </Link>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.variantId} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start', padding: '0.875rem', background: BG3, borderRadius: 10, marginBottom: '0.625rem', border: `1px solid ${BORDER}` }}>
                <div style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', background: BG, flexShrink: 0, border: `1px solid ${BORDER}` }}>
                  {item.image
                    ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>🛹</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {item.vendor && <p style={{ margin: '0 0 0.15rem', color: GOLD, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{item.vendor}</p>}
                  <p style={{ margin: '0 0 0.2rem', color: TEXT, fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                  {item.variantTitle && item.variantTitle !== 'Default Title' && (
                    <p style={{ margin: '0 0 0.5rem', color: MUTED, fontSize: '0.7rem' }}>{item.variantTitle}</p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: '#1a1a1a', border: `1px solid ${BORDER}`, borderRadius: 6, overflow: 'hidden' }}>
                      <button className="hb-qty-btn" onClick={() => updateQty(item.variantId, -1)} style={{ width: 30, height: 28, background: 'none', border: 'none', color: TEXT, cursor: 'pointer', fontSize: '1rem' }}>−</button>
                      <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 700, color: TEXT, fontSize: '0.85rem', borderLeft: `1px solid ${BORDER}`, borderRight: `1px solid ${BORDER}`, lineHeight: '28px' }}>{item.quantity}</span>
                      <button className="hb-qty-btn" onClick={() => updateQty(item.variantId, 1)} style={{ width: 30, height: 28, background: 'none', border: 'none', color: TEXT, cursor: 'pointer', fontSize: '1rem' }}>+</button>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: GOLD, fontWeight: 700, fontSize: '0.9rem' }}>{formatUsd(parseFloat(item.price) * item.quantity)}</div>
                      {item.quantity > 1 && <div style={{ color: MUTED, fontSize: '0.65rem' }}>{formatUsd(item.price)} each</div>}
                    </div>
                  </div>
                  {/truck/i.test(`${item.title} ${item.productType || ''}`) && item.quantity % 2 !== 0 && (
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.7rem', color: '#f5a623', background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.25)', borderRadius: 5, padding: '0.3rem 0.5rem', lineHeight: 1.4 }}>
                      🛹 A quantity of <strong>2</strong> trucks is required for a complete board.
                    </p>
                  )}
                </div>
                <button
                  className="hb-cart-remove"
                  onClick={() => removeItem(item.variantId)}
                  title="Remove item"
                  style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', padding: '0.25rem', flexShrink: 0, lineHeight: 1 }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: '1.125rem 1.25rem', borderTop: `1px solid ${BORDER}` }}>
            <div style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '0.65rem 0.75rem' }}>
              <p style={{ margin: '0 0 0.45rem', fontSize: '0.72rem', color: unlocked ? '#4ade80' : MUTED, letterSpacing: '0.05em', textAlign: 'center' }}>
                {unlocked
                  ? "🎉 You've unlocked FREE SHIPPING!"
                  : `🚚 Add ${formatUsd(remaining)} more for FREE shipping`}
              </p>
              <div style={{ height: 6, background: '#2a2a2a', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: unlocked ? '#4ade80' : `linear-gradient(90deg, ${GOLD}, #e8a020)`,
                  borderRadius: 99,
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: MUTED, fontSize: '0.72rem', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>ORDER NOTE (OPTIONAL)</label>
              <textarea
                value={orderNote}
                onChange={e => setOrderNote(e.target.value)}
                placeholder="Pickup at the Soldotna shop, gift message, or delivery notes..."
                rows={3}
                style={{
                  width: '100%', background: '#1a1a1a', border: `1px solid ${BORDER}`,
                  borderRadius: 6, color: TEXT, fontSize: '0.8rem', padding: '0.5rem 0.625rem',
                  resize: 'vertical', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = GOLD }}
                onBlur={e => { e.target.style.borderColor = BORDER }}
              />
            </div>

            {checkoutError && (
              <div style={{ background: 'rgba(220,38,38,0.12)', border: `1px solid ${RED}`, color: '#f87171', padding: '0.625rem 0.875rem', borderRadius: 6, marginBottom: '0.875rem', fontSize: '0.82rem' }}>
                {checkoutError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
              <span style={{ color: MUTED, fontSize: '0.82rem', letterSpacing: '0.06em' }}>SUBTOTAL ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
              <span style={{ color: GOLD, fontSize: '1.4rem', fontWeight: 700 }}>{formatUsd(cartTotal)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              style={{
                width: '100%', padding: '0.9rem',
                background: isCheckingOut ? '#2a2a2a' : GOLD,
                color: isCheckingOut ? MUTED : BG,
                border: 'none', borderRadius: 6, fontWeight: 700, fontSize: '0.95rem',
                letterSpacing: '0.08em', cursor: isCheckingOut ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                fontFamily: 'inherit',
                boxShadow: isCheckingOut ? 'none' : '0 4px 16px rgba(201,169,97,0.28)',
              }}
            >
              {isCheckingOut
                ? <><span style={{ width: 16, height: 16, border: '2px solid #555', borderTopColor: GOLD, borderRadius: '50%', animation: 'hb-cart-spin 0.8s linear infinite', display: 'inline-block' }} /> PROCESSING...</>
                : 'PROCEED TO CHECKOUT'}
            </button>
            <p style={{ textAlign: 'center', color: MUTED, fontSize: '0.72rem', marginTop: '0.75rem', letterSpacing: '0.03em', lineHeight: 1.55 }}>
              Shipping is calculated at checkout. Prefer pickup? Leave a note or choose pickup at checkout if Shopify shows it — we don’t invent a fake pickup button here.
              {' '}
              <a href={shopInfo.instagramUrl} target="_blank" rel="noreferrer" style={{ color: GOLD }}>{shopInfo.instagramHandle}</a>
              {' · '}
              <Link to="/shipping" onClick={() => setIsCartOpen(false)} style={{ color: GOLD }}>Details</Link>
            </p>
            <p style={{ textAlign: 'center', color: MUTED, fontSize: '0.72rem', marginTop: '0.4rem', letterSpacing: '0.04em' }}>🔒 Secure checkout via Shopify</p>
          </div>
        )}
      </div>
    </>
  )
}
