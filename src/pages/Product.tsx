import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProductByHandle, type Product } from '../lib/shopify'
import { isExcluded } from '../lib/filters'
import {
  hasShopifyDescription,
  productDescription,
  productMetaDescription,
  shopifyDescriptionHtml,
} from '../lib/stock'
import Seo from '../components/Seo'
import QuantityBadge from '../components/QuantityBadge'
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

function variantLabel(title: string, selectedOptions?: Array<{ name: string; value: string }>) {
  if (selectedOptions && selectedOptions.length > 0) {
    const meaningful = selectedOptions.filter(o => o.value && o.value !== 'Default Title')
    if (meaningful.length) return meaningful.map(o => o.value).join(' / ')
  }
  return title === 'Default Title' ? 'One option' : title
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
  const [imgFailed, setImgFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setNotFound(false)
    setImageIdx(0)
    setImgFailed(false)
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

  const images = product?.images.edges.map(e => e.node) || []

  useEffect(() => {
    if (images.length <= 1) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setImageIdx(i => (i - 1 + images.length) % images.length)
      if (e.key === 'ArrowRight') setImageIdx(i => (i + 1) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [images.length])

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

  const variants = product.variants.edges
  const variant = variants.find(v => v.node.id === variantId)?.node || variants[0]?.node
  const inStock = variant?.availableForSale ?? false
  const qty = variant?.quantityAvailable ?? 0
  const price = parseFloat(variant?.price?.amount || product.priceRange.minVariantPrice.amount)
  const htmlDesc = shopifyDescriptionHtml(product)
  const plainDesc = productDescription(product)
  const hasCopy = hasShopifyDescription(product)
  const currentImg = images[Math.min(imageIdx, Math.max(images.length - 1, 0))]
  const ogImage = images[0]?.url || defaultMeta.imagePath
  const path = `/shop/${product.handle}`
  const showVariantPicker = variants.length > 1
  const useVariantButtons = showVariantPicker && variants.length <= 16
  const selectedLabel = variant ? variantLabel(variant.title, variant.selectedOptions) : ''

  const addToCart = (e?: React.MouseEvent) => {
    e?.preventDefault()
    if (!variant || !inStock) return
    addItem({
      variantId: variant.id,
      title: product.title,
      vendor: product.vendor,
      variantTitle: variant.title === 'Default Title' ? '' : variant.title,
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
        description={productMetaDescription(product)}
        image={ogImage}
        path={path}
        type="product"
      />
      <style>{`
        .product-page-inner {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 1.25rem;
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
          gap: 2.75rem;
          align-items: start;
        }
        .product-crumb {
          max-width: 1120px;
          margin: 0 auto 1.25rem;
          padding: 0 1.25rem;
          font-size: 0.78rem;
          letter-spacing: 0.08em;
          color: ${MUTED};
        }
        .product-crumb a { color: ${GOLD}; text-decoration: none; }
        .product-crumb a:hover { text-decoration: underline; }
        .product-add:hover:not(:disabled) { background: ${GOLD_LIGHT} !important; }
        .product-thumb:hover { border-color: ${GOLD} !important; }
        .product-desc { color: ${MUTED}; font-size: 0.95rem; line-height: 1.75; }
        .product-desc p { margin: 0 0 0.85rem; }
        .product-desc p:last-child { margin-bottom: 0; }
        .product-desc a { color: ${GOLD}; }
        .product-desc ul, .product-desc ol { margin: 0 0 0.85rem 1.2rem; }
        .product-desc li { margin-bottom: 0.3rem; }
        .product-desc img { max-width: 100%; height: auto; border-radius: 8px; margin: 0.5rem 0; }
        .product-desc h1, .product-desc h2, .product-desc h3 { color: ${TEXT}; margin: 0 0 0.6rem; font-size: 1.05rem; }
        .variant-chip { transition: border-color 0.15s, background 0.15s, color 0.15s; }
        .variant-chip:hover:not(:disabled) { border-color: ${GOLD} !important; }
        @media (max-width: 800px) {
          .product-page-inner { grid-template-columns: 1fr; gap: 1.5rem; }
        }
      `}</style>

      <p className="product-crumb">
        <Link to="/shop">SHOP</Link>
        {product.productType ? <><span> / </span><span>{product.productType}</span></> : null}
        <span> / </span>
        <span style={{ color: TEXT }}>{product.title}</span>
      </p>

      <div className="product-page-inner">
        <div>
          <div style={{ position: 'relative', aspectRatio: '1', background: BG2, borderRadius: 12, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
            {currentImg?.url && !imgFailed
              ? <img
                  src={currentImg.url}
                  alt={currentImg.altText || product.title}
                  onError={() => setImgFailed(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', background: BG }}
                />
              : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: MUTED }}>
                  <span style={{ fontSize: '4rem', opacity: 0.2 }}>🛹</span>
                  <span style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>No photo yet</span>
                </div>}
            {!inStock && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ background: '#111', color: MUTED, padding: '0.4rem 0.9rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', borderRadius: 4, border: `1px solid ${BORDER}` }}>SOLD OUT</span>
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() => { setImageIdx(i => (i - 1 + images.length) % images.length); setImgFailed(false) }}
                  style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: `1px solid ${BORDER}`, color: TEXT, cursor: 'pointer', fontSize: '1.25rem' }}
                >‹</button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() => { setImageIdx(i => (i + 1) % images.length); setImgFailed(false) }}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: `1px solid ${BORDER}`, color: TEXT, cursor: 'pointer', fontSize: '1.25rem' }}
                >›</button>
                <span style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.7)', color: TEXT, padding: '0.2rem 0.55rem', borderRadius: 4, fontSize: '0.7rem', letterSpacing: '0.06em', border: `1px solid ${BORDER}` }}>
                  {imageIdx + 1} / {images.length}
                </span>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginTop: '0.85rem', paddingBottom: '0.25rem' }}>
              {images.map((img, i) => (
                <button
                  key={img.url + i}
                  type="button"
                  className="product-thumb"
                  aria-label={`View image ${i + 1}`}
                  aria-current={i === imageIdx}
                  onClick={() => { setImageIdx(i); setImgFailed(false) }}
                  style={{
                    flexShrink: 0, width: 76, height: 76, borderRadius: 8, overflow: 'hidden', padding: 0,
                    border: `2px solid ${i === imageIdx ? GOLD : BORDER}`, background: BG2, cursor: 'pointer',
                  }}
                >
                  <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.05rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
            {product.vendor
              ? <p style={{ margin: 0, color: GOLD, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{product.vendor}</p>
              : <p style={{ margin: 0, color: MUTED, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{product.productType || shopInfo.shortName}</p>}
            <QuantityBadge quantity={qty} available={inStock} />
          </div>
          <h1 style={{ margin: 0, color: TEXT, fontSize: 'clamp(1.45rem, 3vw, 2.1rem)', fontWeight: 700, lineHeight: 1.25 }}>{product.title}</h1>
          <p style={{ margin: 0, color: GOLD, fontSize: '1.7rem', fontWeight: 700 }}>{formatUsd(price)}</p>

          {showVariantPicker && (
            <div>
              <p style={{ margin: '0 0 0.5rem', color: MUTED, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Size / option
                {selectedLabel ? <span style={{ color: TEXT, marginLeft: '0.4rem', letterSpacing: 0, textTransform: 'none', fontWeight: 500 }}>— {selectedLabel}</span> : null}
              </p>
              {useVariantButtons ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  {variants.map(v => {
                    const selected = v.node.id === variant?.id
                    const available = v.node.availableForSale
                    const label = variantLabel(v.node.title, v.node.selectedOptions)
                    return (
                      <button
                        key={v.node.id}
                        type="button"
                        className="variant-chip"
                        disabled={!available}
                        onClick={() => setVariantId(v.node.id)}
                        style={{
                          padding: '0.55rem 0.75rem',
                          background: selected ? 'rgba(201,169,97,0.14)' : BG3,
                          border: `1px solid ${selected ? GOLD : BORDER}`,
                          color: available ? (selected ? GOLD : TEXT) : MUTED,
                          borderRadius: 6, fontSize: '0.82rem', fontWeight: selected ? 700 : 500,
                          cursor: available ? 'pointer' : 'not-allowed',
                          fontFamily: 'inherit',
                          textDecoration: available ? 'none' : 'line-through',
                          opacity: available ? 1 : 0.55,
                        }}
                      >
                        {label}{available ? '' : ' · Sold out'}
                      </button>
                    )
                  })}
                </div>
              ) : (
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
                      {variantLabel(v.node.title, v.node.selectedOptions)}{!v.node.availableForSale ? ' — Sold Out' : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
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

          <div>
            <p style={{ margin: '0 0 0.5rem', color: TEXT, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Details</p>
            {htmlDesc ? (
              <div className="product-desc" dangerouslySetInnerHTML={{ __html: htmlDesc }} />
            ) : hasCopy ? (
              <p className="product-desc" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{plainDesc}</p>
            ) : (
              <div style={{ background: BG2, border: `1px dashed ${BORDER}`, borderRadius: 8, padding: '0.9rem 1rem' }}>
                <p style={{ margin: 0, color: MUTED, fontSize: '0.88rem', lineHeight: 1.65 }}>
                  No description in Shopify yet — we won’t invent one. Ask in the shop or on{' '}
                  <a href={shopInfo.instagramUrl} target="_blank" rel="noreferrer" style={{ color: GOLD }}>{shopInfo.instagramHandle}</a>
                  {' '}if you need specs.
                </p>
              </div>
            )}
          </div>

          <p style={{ margin: 0, color: MUTED, fontSize: '0.8rem', lineHeight: 1.6 }}>
            Ships from {shopInfo.city}, {shopInfo.state}. Free shipping at {formatUsd(shopInfo.freeShippingThreshold)}+.
            Pickup at {shopInfo.mall}, {shopInfo.suite} — see <Link to="/shipping" style={{ color: GOLD }}>shipping &amp; pickup</Link>.
          </p>
          <p style={{ margin: 0, color: MUTED, fontSize: '0.78rem' }}>
            First board? <Link to="/starter" style={{ color: GOLD }}>Guided starter setup</Link>
            {' · '}
            <Link to="/build" style={{ color: GOLD }}>Build a Board</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
