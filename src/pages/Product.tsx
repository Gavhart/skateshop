import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProductByHandle, type Product } from '../lib/shopify'
import { isExcluded } from '../lib/filters'
import { productDescription } from '../lib/stock'
import Seo from '../components/Seo'
import { defaultMeta, formatUsd, shopInfo } from '../lib/shopInfo'
import { useCart } from '../context/CartContext'

const GOLD = '#C9A961'
const GOLD_LIGHT = '#D4AF37'
const BG = '#0a0a0a'
const BG2 = '#111'
const BG3 = '#1a1a1a'
const TEXT = '#F5F1E8'
const MUTED = '#8a857a'
const BORDER = '#2a2a2a'
const RED = '#dc2626'

function trackRecentlyViewed(product: Product) {
  try {
    const prev = JSON.parse(localStorage.getItem('hb_recent') || '[]')
    const list = Array.isArray(prev) ? prev : []
    const next = [product, ...list.filter((p: Product) => p.id !== product.id)].slice(0, 8)
    localStorage.setItem('hb_recent', JSON.stringify(next))
  } catch { /* ignore */ }
}

export default function ProductPage() {
  const { handle } = useParams<{ handle: string }>()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [imageIdx, setImageIdx] = useState(0)
  const [variantId, setVariantId] = useState<string>('')
  const [justAdded, setJustAdded] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setNotFound(false)
    setImageIdx(0)
    window.scrollTo(0, 0)

    getProductByHandle(handle || '')
      .then(p => {
        if (cancelled) return
        if (!p || isExcluded(p)) {
          setNotFound(true)
          setProduct(null)
        } else {
          setProduct(p)
          const firstAvailable = p.variants.edges.find(v => v.node.availableForSale)?.node
            || p.variants.edges[0]?.node
          setVariantId(firstAvailable?.id || '')
          trackRecentlyViewed(p)
        }
        setLoading(false)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Unable to load product')
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [handle])

  if (loading) {
    return (
      <div style={{ marginTop: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: MUTED }}>
        <Seo title={`Loading… | ${shopInfo.name}`} path={`/shop/${handle || ''}`} />
        <div style={{ width: 44, height: 44, border: `3px solid ${BORDER}`, borderTopColor: GOLD, borderRadius: '50%', animation: 'hb-spin 0.8s linear infinite', marginBottom: '1.5rem' }} />
        <p style={{ fontSize: '0.9rem', letterSpacing: '0.1em' }}>LOADING PRODUCT</p>
        <style>{`@keyframes hb-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page" style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
        <Seo title={`Product error | ${shopInfo.name}`} path={`/shop/${handle || ''}`} />
        <h1 style={{ color: RED, marginBottom: '1rem' }}>Unable to load product</h1>
        <p style={{ color: MUTED, marginBottom: '1.5rem' }}>{error}</p>
        <Link to="/shop" className="btn btn-primary">BACK TO SHOP</Link>
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="page" style={{ textAlign: 'center', padding: '6rem 1.5rem', maxWidth: 560, margin: '0 auto' }}>
        <Seo
          title={`Product not found | ${shopInfo.name}`}
          description="That product isn’t in the Hart Boys shop — or it was removed."
          path={`/shop/${handle || ''}`}
        />
        <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛹</p>
        <h1 className="glitch" data-text="NOT FOUND" style={{ color: GOLD, marginBottom: '0.75rem' }}>NOT FOUND</h1>
        <p style={{ color: MUTED, marginBottom: '1.75rem' }}>
          We don’t have a product at this URL. It may be sold through, unpublished, or the link is old.
        </p>
        <Link to="/shop" className="btn btn-primary">BROWSE THE SHOP</Link>
      </div>
    )
  }

  const images = product.images.edges.map(e => e.node)
  const variants = product.variants.edges
  const variant = variants.find(v => v.node.id === variantId)?.node || variants[0]?.node
  const inStock = variant?.availableForSale ?? false
  const qty = variant?.quantityAvailable ?? 0
  const price = parseFloat(variant?.price?.amount || product.priceRange.minVariantPrice.amount)
  const desc = productDescription(product)
  const currentImg = images[Math.min(imageIdx, Math.max(images.length - 1, 0))]?.url
  const ogImage = images[0]?.url || defaultMeta.imagePath
  const path = `/shop/${product.handle}`

  const addToCart = (e?: React.MouseEvent) => {
    e?.preventDefault()
    if (!variant || !inStock) return
    addItem({
      variantId: variant.id,
      title: product.title,
      vendor: product.vendor,
      variantTitle: variant.title,
      price: String(price),
      image: images[0]?.url,
      quantity: 1,
      productType: product.productType,
    })
    setJustAdded(true)
    window.setTimeout(() => setJustAdded(false), 1200)
  }

  return (
    <div className="page product-page" style={{ background: BG, paddingTop: '7rem', paddingBottom: '4rem' }}>
      <Seo
        title={`${product.title} | ${shopInfo.name}`}
        description={desc.slice(0, 180)}
        image={ogImage}
        path={path}
        type="product"
      />
      <style>{`
        .product-page-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 1.25rem;
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
          gap: 2.5rem;
          align-items: start;
        }
        .product-crumb {
          max-width: 1100px;
          margin: 0 auto 1.25rem;
          padding: 0 1.25rem;
          font-size: 0.78rem;
          letter-spacing: 0.08em;
          color: ${MUTED};
        }
        .product-crumb a { color: ${GOLD}; text-decoration: none; }
        .product-crumb a:hover { text-decoration: underline; }
        .product-add:hover:not(:disabled) { background: ${GOLD_LIGHT} !important; }
        @media (max-width: 800px) {
          .product-page-inner { grid-template-columns: 1fr; gap: 1.5rem; }
        }
      `}</style>

      <p className="product-crumb">
        <Link to="/shop">SHOP</Link>
        <span> / </span>
        <span style={{ color: TEXT }}>{product.title}</span>
      </p>

      <div className="product-page-inner">
        <div>
          <div style={{ position: 'relative', aspectRatio: '1', background: BG3, borderRadius: 10, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
            {currentImg
              ? <img src={currentImg} alt={images[imageIdx]?.altText || product.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', opacity: 0.2 }}>🛹</div>}
            {!inStock && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ background: '#111', color: MUTED, padding: '0.4rem 0.9rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', borderRadius: 4, border: `1px solid ${BORDER}` }}>SOLD OUT</span>
              </div>
            )}
            {inStock && qty > 0 && qty <= 3 && (
              <span style={{ position: 'absolute', top: 12, left: 12, background: RED, color: '#fff', padding: '0.25rem 0.6rem', fontSize: '0.7rem', fontWeight: 700, borderRadius: 4, letterSpacing: '0.06em' }}>
                ONLY {qty} LEFT
              </span>
            )}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() => setImageIdx(i => (i - 1 + images.length) % images.length)}
                  style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.65)', border: `1px solid ${BORDER}`, color: TEXT, cursor: 'pointer' }}
                >‹</button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() => setImageIdx(i => (i + 1) % images.length)}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.65)', border: `1px solid ${BORDER}`, color: TEXT, cursor: 'pointer' }}
                >›</button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginTop: '0.75rem' }}>
              {images.map((img, i) => (
                <button
                  key={img.url + i}
                  type="button"
                  onClick={() => setImageIdx(i)}
                  style={{
                    flexShrink: 0, width: 64, height: 64, borderRadius: 6, overflow: 'hidden', padding: 0,
                    border: `2px solid ${i === imageIdx ? GOLD : BORDER}`, background: BG3, cursor: 'pointer',
                  }}
                >
                  <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {product.vendor && (
            <p style={{ margin: 0, color: GOLD, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{product.vendor}</p>
          )}
          <h1 style={{ margin: 0, color: TEXT, fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 700, lineHeight: 1.25 }}>{product.title}</h1>
          <p style={{ margin: 0, color: GOLD, fontSize: '1.6rem', fontWeight: 700 }}>{formatUsd(price)}</p>

          <p style={{ margin: 0, color: MUTED, fontSize: '0.95rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{desc}</p>

          {variants.length > 1 && (
            <div>
              <p style={{ margin: '0 0 0.4rem', color: MUTED, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Size / option</p>
              <select
                value={variant?.id || ''}
                onChange={e => setVariantId(e.target.value)}
                style={{
                  width: '100%', padding: '0.7rem 0.75rem',
                  background: BG3, border: `1px solid ${BORDER}`,
                  color: TEXT, borderRadius: 6, fontSize: '0.9rem',
                  cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
                }}
              >
                {variants.map(v => (
                  <option key={v.node.id} value={v.node.id} disabled={!v.node.availableForSale} style={{ background: BG2 }}>
                    {v.node.title}{!v.node.availableForSale ? ' — Sold Out' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!inStock && (
            <p style={{ margin: 0, color: RED, fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.06em' }}>OUT OF STOCK</p>
          )}
          {inStock && typeof qty === 'number' && qty > 0 && (
            <p style={{ margin: 0, color: MUTED, fontSize: '0.8rem' }}>
              {qty <= 3 ? `Only ${qty} left` : 'In stock'}
            </p>
          )}

          <button
            className="product-add"
            onClick={addToCart}
            disabled={!inStock}
            style={{
              padding: '0.95rem',
              background: justAdded ? '#1a3a1a' : (inStock ? GOLD : '#222'),
              border: justAdded ? '1px solid #3a6a3a' : 'none',
              color: justAdded ? '#6fcf6f' : (inStock ? BG : MUTED),
              borderRadius: 7, fontWeight: 700, fontSize: '0.95rem',
              cursor: inStock ? 'pointer' : 'not-allowed',
              letterSpacing: '0.08em', fontFamily: 'inherit',
              boxShadow: inStock && !justAdded ? '0 4px 16px rgba(201,169,97,0.25)' : 'none',
            }}
          >
            {justAdded ? '✓ ADDED TO CART' : (inStock ? 'ADD TO CART' : 'SOLD OUT')}
          </button>

          <p style={{ margin: 0, color: MUTED, fontSize: '0.8rem', lineHeight: 1.6 }}>
            Ships from {shopInfo.city}, {shopInfo.state}. Free shipping at {formatUsd(shopInfo.freeShippingThreshold)}+.
            Local pickup at {shopInfo.mall} — see <Link to="/shipping" style={{ color: GOLD }}>shipping &amp; pickup</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
