import { useState, useEffect, useRef } from "react"
import { getProducts, createCheckout } from "../lib/shopify"
import { isExcluded } from "../lib/filters"

const GOLD = '#C9A961'
const GOLD_LIGHT = '#D4AF37'
const BG = '#0a0a0a'
const BG2 = '#111'
const BG3 = '#1a1a1a'
const TEXT = '#F5F1E8'
const MUTED = '#8a857a'
const BORDER = '#2a2a2a'
const RED = '#dc2626'

const CATEGORIES = [
  { id: 'all', label: 'All Products', subcategories: [] },
  {
    id: 'skate', label: 'Skate',
    subcategories: [
      { id: 'completes', label: 'Complete Setups', keywords: ['complete', 'pre-built', 'setup'] },
      { id: 'decks', label: 'Decks', keywords: ['deck', 'skateboard deck'] },
      { id: 'trucks', label: 'Trucks', keywords: ['truck', 'trucks', 'independent', 'thunder', 'venture', 'ace'] },
      { id: 'wheels', label: 'Wheels', keywords: ['wheel', 'wheels', 'spitfire', 'bones', 'ricta', 'powell'] },
      { id: 'bearings', label: 'Bearings', keywords: ['bearing', 'bearings', 'abec'] },
      { id: 'grip', label: 'Griptape', keywords: ['grip', 'griptape', 'grizzly', 'mob'] },
      { id: 'hardware', label: 'Hardware', keywords: ['hardware', 'bolt', 'nuts', 'bolts'] },
    ]
  },
  {
    id: 'apparel', label: 'Apparel',
    subcategories: [
      { id: 'tshirts', label: 'T-Shirts', keywords: ['shirt', 't-shirt', 'tee'] },
      { id: 'hoodies', label: 'Hoodies & Fleece', keywords: ['hoodie', 'sweatshirt', 'crewneck', 'fleece'] },
      { id: 'pants', label: 'Pants & Shorts', keywords: ['pant', 'pants', 'shorts', 'jeans', 'chino'] },
      { id: 'hats', label: 'Hats & Beanies', keywords: ['hat', 'cap', 'beanie', 'snapback', 'fitted'] },
      { id: 'socks', label: 'Socks', keywords: ['sock', 'socks'] },
    ]
  },
  {
    id: 'accessories', label: 'Accessories',
    subcategories: [
      { id: 'bags', label: 'Bags & Backpacks', keywords: ['bag', 'backpack', 'pack'] },
      { id: 'protection', label: 'Protection', keywords: ['helmet', 'pad', 'protective', 'guard'] },
      { id: 'other', label: 'Misc & Stickers', keywords: ['sticker', 'keychain', 'wax', 'skate tool', 'tool'] },
    ]
  }
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'az', label: 'Name: A–Z' },
  { value: 'za', label: 'Name: Z–A' },
  { value: 'low', label: 'Price: Low → High' },
  { value: 'high', label: 'Price: High → Low' },
]

// Products added within this many days get a "NEW" badge
const NEW_DAYS = 180

// Only matches against productType field — not title/description/tags
function matchesProductType(product: any, keywords: string[]) {
  const type = (product.productType || '').toLowerCase()
  return keywords.some(kw => type.includes(kw.toLowerCase()))
}

function matchesSearch(product: any, term: string) {
  if (!term) return true
  const t = term.toLowerCase()
  const text = [product.title, product.productType, product.description, product.vendor, ...(product.tags || [])]
    .filter(Boolean).join(' ').toLowerCase()
  return text.includes(t)
}


function sortProducts(list: any[], sortBy: string) {
  const sorted = [...list]
  // 'newest' keeps API order (already CREATED_AT desc from Shopify)
  if (sortBy === 'oldest') sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  else if (sortBy === 'az') sorted.sort((a, b) => a.title.localeCompare(b.title))
  else if (sortBy === 'za') sorted.sort((a, b) => b.title.localeCompare(a.title))
  else if (sortBy === 'low') sorted.sort((a, b) => parseFloat(a.priceRange.minVariantPrice.amount) - parseFloat(b.priceRange.minVariantPrice.amount))
  else if (sortBy === 'high') sorted.sort((a, b) => parseFloat(b.priceRange.minVariantPrice.amount) - parseFloat(a.priceRange.minVariantPrice.amount))
  return sorted
}

function isNew(createdAt: string) {
  if (!createdAt) return false
  const diffMs = Date.now() - new Date(createdAt).getTime()
  return diffMs < NEW_DAYS * 24 * 60 * 60 * 1000
}

const PER_PAGE = 16

export default function Shop() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeCategory, setActiveCategory] = useState('all')
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [expandedCats, setExpandedCats] = useState<string[]>(['skate'])
  const [page, setPage] = useState(1)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [cart, setCart] = useState<any[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartAnimating, setCartAnimating] = useState(false)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [addedProduct, setAddedProduct] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [modalImageIdx, setModalImageIdx] = useState(0)
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; icon: string }[]>([])

  const searchRef = useRef<HTMLInputElement>(null)

  // Reset gallery index whenever a new product modal opens
  useEffect(() => { setModalImageIdx(0) }, [selectedProduct])

  useEffect(() => {
    getProducts()
      .then(p => { setProducts(p.filter((x: any) => !isExcluded(x))); setLoading(false) })
      .catch((e: any) => { setError(e.message); setLoading(false) })
  }, [])

  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1024) setIsSidebarOpen(false) }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedProduct(null) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // ── Filter by productType only (no keyword search across title/description) ──
  const filtered = (() => {
    let result = products
    if (activeSubcategory) {
      const allSubs = CATEGORIES.flatMap(c => c.subcategories)
      const sub = allSubs.find((s: any) => s.id === activeSubcategory)
      if (sub) result = result.filter(p => matchesProductType(p, (sub as any).keywords))
    } else if (activeCategory !== 'all') {
      const cat = CATEGORIES.find(c => c.id === activeCategory)
      if (cat) {
        const allKeywords = cat.subcategories.flatMap((s: any) => s.keywords)
        result = result.filter(p => matchesProductType(p, allKeywords))
      }
    }
    if (searchTerm.trim()) result = result.filter(p => matchesSearch(p, searchTerm))
    return sortProducts(result, sortBy)
  })()

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const display = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const selectCategory = (catId: string, subId: string | null = null) => {
    setActiveCategory(catId)
    setActiveSubcategory(subId)
    setPage(1)
    // Only close sidebar when a subcategory or "all" is picked — not on parent category click
    if (subId !== null || catId === 'all') setIsSidebarOpen(false)
  }

  const toggleExpand = (catId: string) => {
    setExpandedCats(prev => prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId])
  }

  const clearFilters = () => {
    setActiveCategory('all'); setActiveSubcategory(null)
    setSearchTerm(''); setSortBy('newest'); setPage(1)
  }

  const hasActiveFilters = activeCategory !== 'all' || !!searchTerm

  // Staff picks: products tagged 'staff-pick' in Shopify, or fall back to 4 newest
  const staffPicks = (() => {
    const tagged = products.filter(p => (p.tags || []).map((t: string) => t.toLowerCase()).includes('staff-pick'))
    return (tagged.length >= 2 ? tagged : products.slice(0, 4)).slice(0, 6)
  })()

  const currentLabel = (() => {
    if (searchTerm) return `Results for "${searchTerm}"`
    if (activeSubcategory) {
      const sub = CATEGORIES.flatMap(c => c.subcategories).find((s: any) => s.id === activeSubcategory)
      return (sub as any)?.label || ''
    }
    if (activeCategory !== 'all') return CATEGORIES.find(c => c.id === activeCategory)?.label || ''
    return 'All Products'
  })()

  const getVariant = (p: any) => {
    const sel = selectedVariants[p.id]
    return p.variants.edges.find((v: any) => v.node.id === sel)?.node || p.variants.edges[0]?.node
  }

  const CONFETTI_ICONS = ['🛹', '⭐', '✦', '🔥', '⚡', '🤘', '★']

  const spawnConfetti = (e?: React.MouseEvent) => {
    const cx = e?.clientX ?? window.innerWidth / 2
    const cy = e?.clientY ?? window.innerHeight / 2
    const particles = Array.from({ length: 10 }, (_, i) => ({
      id: Date.now() + i,
      x: cx,
      y: cy,
      icon: CONFETTI_ICONS[Math.floor(Math.random() * CONFETTI_ICONS.length)],
    }))
    setConfetti(prev => [...prev, ...particles])
    setTimeout(() => {
      setConfetti(prev => prev.filter(c => !particles.find(p => p.id === c.id)))
    }, 1000)
  }

  const addToCart = (p: any, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const v = getVariant(p)
    if (!v || !v.availableForSale) return
    const exists = cart.find(i => i.variantId === v.id)
    if (exists) {
      setCart(cart.map(i => i.variantId === v.id ? { ...i, quantity: i.quantity + 1 } : i))
    } else {
      setCart([...cart, {
        variantId: v.id, title: p.title, vendor: p.vendor, variantTitle: v.title,
        price: v.price?.amount || p.priceRange.minVariantPrice.amount,
        image: p.images.edges[0]?.node.url, quantity: 1
      }])
    }
    spawnConfetti(e)
    setCartAnimating(true)
    setAddedProduct(p.id)
    setTimeout(() => { setCartAnimating(false); setAddedProduct(null) }, 1200)
    setIsCartOpen(true)
  }

  const removeFromCart = (id: string) => setCart(cart.filter(i => i.variantId !== id))
  const updateQty = (id: string, delta: number) =>
    setCart(cart.map(i => i.variantId === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))

  const cartTotal = cart.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0)
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)

  const handleCheckout = async () => {
    if (!cart.length) return
    setIsCheckingOut(true)
    setCheckoutError(null)
    try {
      const checkout = await createCheckout(cart)
      // Redirect to Shopify-hosted checkout
      window.location.href = checkout.url
    } catch (err: any) {
      const msg = err.message || 'Checkout failed. Please try again.'
      setCheckoutError(msg)
      setIsCheckingOut(false)
    }
  }

  // Detect if customer returned from a cancelled Shopify checkout
  const [checkoutCancelled, setCheckoutCancelled] = useState(false)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('checkout_cancelled') === '1') {
      setCheckoutCancelled(true)
      // Clean the URL without reloading
      window.history.replaceState({}, '', '/shop')
    }
  }, [])

  /* ─── Sidebar content — render function (not a component) to avoid remount issues ─── */
  const renderSidebar = () => (
    <div style={{ padding: '1rem' }}>
      {/* Search */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setPage(1) }}
            style={{
              width: '100%', padding: '0.625rem 2.25rem 0.625rem 0.875rem',
              background: BG3, border: `1px solid ${BORDER}`,
              color: TEXT, borderRadius: 6, fontSize: '0.9rem',
              outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
            }}
            onFocus={e => (e.target.style.borderColor = GOLD)}
            onBlur={e => (e.target.style.borderColor = BORDER)}
          />
          {searchTerm && (
            <button onClick={() => { setSearchTerm(''); setPage(1) }}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>×</button>
          )}
        </div>
      </div>

      {/* Category nav */}
      <p style={{ color: MUTED, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', marginBottom: '0.75rem' }}>BROWSE</p>

      <button className="cat-link"
        onClick={() => selectCategory('all')}
        style={{
          display: 'block', width: '100%', textAlign: 'left',
          padding: '0.55rem 0.75rem', background: activeCategory === 'all' ? `rgba(201,169,97,0.12)` : 'none',
          border: 'none', borderRadius: 5, cursor: 'pointer',
          color: activeCategory === 'all' ? GOLD : TEXT,
          fontWeight: activeCategory === 'all' ? 700 : 400,
          fontSize: '0.9rem', marginBottom: '0.2rem', letterSpacing: '0.02em', fontFamily: 'inherit'
        }}>
        All Products
      </button>

      {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
        <div key={cat.id} style={{ marginBottom: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button className="cat-link"
              onClick={() => { setActiveCategory(cat.id); setActiveSubcategory(null); setPage(1); toggleExpand(cat.id) }}
              style={{
                flex: 1, textAlign: 'left',
                padding: '0.55rem 0.75rem',
                background: (activeCategory === cat.id && !activeSubcategory) ? `rgba(201,169,97,0.12)` : 'none',
                border: 'none', borderRadius: 5, cursor: 'pointer',
                color: activeCategory === cat.id ? GOLD : TEXT,
                fontWeight: activeCategory === cat.id ? 700 : 500,
                fontSize: '0.9rem', letterSpacing: '0.02em', fontFamily: 'inherit'
              }}>
              {cat.label}
            </button>
            <button onClick={() => toggleExpand(cat.id)}
              style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', padding: '0.4rem 0.5rem', fontSize: '0.75rem', lineHeight: 1, flexShrink: 0 }}>
              {expandedCats.includes(cat.id) ? '▾' : '▸'}
            </button>
          </div>
          {expandedCats.includes(cat.id) && (
            <div style={{ paddingLeft: '0.75rem', marginTop: '0.15rem' }}>
              {cat.subcategories.map((sub: any) => (
                <button key={sub.id} className="subcat-link"
                  onClick={() => selectCategory(cat.id, sub.id)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '0.45rem 0.75rem',
                    background: activeSubcategory === sub.id ? `rgba(201,169,97,0.1)` : 'none',
                    border: 'none', borderRadius: 4, cursor: 'pointer',
                    color: activeSubcategory === sub.id ? GOLD : MUTED,
                    fontWeight: activeSubcategory === sub.id ? 600 : 400,
                    fontSize: '0.875rem', marginBottom: '0.1rem', letterSpacing: '0.01em', fontFamily: 'inherit'
                  }}>
                  {sub.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )

  if (loading) return (
    <div style={{ marginTop: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: MUTED }}>
      <div style={{ width: 44, height: 44, border: `3px solid ${BORDER}`, borderTopColor: GOLD, borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '1.5rem' }} />
      <p style={{ fontSize: '0.9rem', letterSpacing: '0.1em' }}>LOADING PRODUCTS</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (error) return (
    <div style={{ marginTop: 120, textAlign: 'center', padding: '4rem 1rem', color: RED }}>
      <h2 style={{ marginBottom: '1rem' }}>Unable to load products</h2>
      <p style={{ color: MUTED }}>{error}</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: BG, paddingTop: 'var(--shop-top, 90px)' }}>
      <style>{`
        :root { --shop-top: 90px; }
        @media (max-width: 1023px) { :root { --shop-top: 68px; } }
        @media (max-width: 600px)  { :root { --shop-top: 60px; } }

        @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .modal-inner { animation: modalIn 0.22s ease; }
        .modal-close:hover { color: ${TEXT} !important; background: #2a2a2a !important; }

        @media (max-width: 600px) {
          .modal-inner > div { flex-direction: column !important; }
          .modal-inner > div > div:first-child { width: 100% !important; height: 260px; }
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .cat-link, .subcat-link { transition: color 0.15s, background 0.15s; }
        .cat-link:hover { color: ${GOLD} !important; background: rgba(201,169,97,0.06) !important; }
        .subcat-link:hover { color: ${GOLD} !important; background: rgba(201,169,97,0.06) !important; }

        .product-card { transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s; }
        .product-card:hover { border-color: ${GOLD} !important; box-shadow: 0 8px 28px rgba(201,169,97,0.12) !important; transform: translateY(-3px); }
        .product-card:hover .card-img { transform: scale(1.04); }

        .add-btn { transition: background 0.2s, color 0.2s; }
        .add-btn:hover:not(:disabled) { background: ${GOLD_LIGHT} !important; }

        .qty-btn { transition: background 0.15s; }
        .qty-btn:hover { background: #333 !important; }
        .cart-remove:hover { color: ${RED} !important; }

        .sort-select option { background: ${BG2}; color: ${TEXT}; }

        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }

        .shop-sidebar-desktop { display: block; }
        .shop-sidebar-mobile-btn { display: none; }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.25rem;
        }

        .shop-layout {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem 1.5rem;
          display: flex;
          gap: 2rem;
          align-items: flex-start;
        }

        .shop-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid ${BORDER};
        }
        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        /* mobile-top-bar sits right below the 68px navbar */
        .mobile-top-bar {
          display: none;
          align-items: center;
          gap: 0.625rem;
          padding: 0.625rem 1rem;
          background: ${BG2};
          border-bottom: 1px solid ${BORDER};
          position: sticky;
          top: 68px;
          z-index: 90;
        }

        /* search bar sits below the filter bar (~44px tall) */
        .mobile-search-bar {
          display: none;
          padding: 0.5rem 1rem;
          background: ${BG};
          border-bottom: 1px solid ${BORDER};
          position: sticky;
          top: 112px;
          z-index: 89;
        }

        .cart-sidebar { width: 420px; }

        /* ── Tablet (< 1024px): hide sidebar, show filter button ── */
        @media (max-width: 1023px) {
          .shop-sidebar-desktop { display: none !important; }
          .shop-sidebar-mobile-btn { display: flex !important; }
          .shop-layout { padding: 1rem; gap: 0; }
          .mobile-top-bar { display: flex; }
          .mobile-search-bar { display: block; }
          .shop-toolbar { display: none; }
          .products-grid { grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 1rem; }
        }

        /* ── Small tablet / large phone (< 768px) ── */
        @media (max-width: 767px) {
          .products-grid { grid-template-columns: repeat(2, 1fr); gap: 0.625rem; }
          .cart-sidebar { width: 100vw !important; max-width: 100vw !important; }
          .shop-layout { padding: 0.75rem; }
        }

        /* ── Mobile (< 600px): matches 60px navbar height ── */
        @media (max-width: 600px) {
          .mobile-top-bar { top: 60px; }
          .mobile-search-bar { top: 104px; }
          .shop-layout { padding: 0.5rem; }
          .products-grid { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
        }

        /* ── Very small (< 360px): single column ── */
        @media (max-width: 360px) {
          .products-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── CHECKOUT CANCELLED BANNER ────────────────────── */}
      {checkoutCancelled && (
        <div style={{
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
          background: BG2, border: `1px solid ${GOLD}`,
          borderRadius: 10, padding: '1rem 1.5rem',
          display: 'flex', alignItems: 'center', gap: '1rem',
          zIndex: 9995, boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          maxWidth: '90vw',
        }}>
          <span style={{ fontSize: '1.4rem' }}>🛹</span>
          <div>
            <p style={{ margin: 0, color: TEXT, fontWeight: 600, fontSize: '0.9rem' }}>No worries — your cart is still here.</p>
            <p style={{ margin: '0.15rem 0 0', color: MUTED, fontSize: '0.8rem' }}>Pick up where you left off whenever you're ready.</p>
          </div>
          <button onClick={() => { setCheckoutCancelled(false); setIsCartOpen(true) }}
            style={{ background: GOLD, border: 'none', color: BG, padding: '0.5rem 1rem', borderRadius: 6, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
            VIEW CART
          </button>
          <button onClick={() => setCheckoutCancelled(false)}
            style={{ background: 'none', border: 'none', color: MUTED, fontSize: '1.2rem', cursor: 'pointer', padding: '0 0.25rem', lineHeight: 1 }}>×</button>
        </div>
      )}

      {/* ── CART FAB ─────────────────────────────────────── */}
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
          boxShadow: cartCount > 0 ? `0 4px 20px rgba(201,169,97,0.35)` : 'none',
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
            border: `2px solid ${BG}`
          }}>
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        )}
      </button>

      {/* ── CONFETTI OVERLAY ─────────────────────────────── */}
      <div className="confetti-container" aria-hidden="true">
        {confetti.map((c, i) => {
          const angle = (i / 10) * 360 + Math.random() * 40
          const dist = 60 + Math.random() * 80
          const rad = (angle * Math.PI) / 180
          const tx = Math.cos(rad) * dist
          const ty = Math.sin(rad) * dist - 70
          const spin = `${Math.random() * 720 - 360}deg`
          return (
            <span
              key={c.id}
              className="confetti-particle"
              style={{
                left: c.x,
                top: c.y,
                '--fly-to': `translate(${tx}px, ${ty}px)`,
                '--spin': spin,
                animationDelay: `${i * 0.03}s`,
              } as React.CSSProperties}
            >
              {c.icon}
            </span>
          )
        })}
      </div>

      {/* ── PRODUCT DETAIL MODAL ─────────────────────────── */}
      {selectedProduct && (() => {
        const p = selectedProduct
        const img = p.images.edges[0]?.node.url
        const variant = getVariant(p)
        const inStock = variant?.availableForSale ?? false
        const qty = variant?.quantityAvailable ?? 0
        const price = parseFloat(p.priceRange.minVariantPrice.amount)
        const variants = p.variants.edges
        const justAdded = addedProduct === p.id
        return (
          <>
            <div onClick={() => setSelectedProduct(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)', zIndex: 9990 }} />
            <div className="modal-inner" style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(860px, 94vw)', maxHeight: '90vh',
              background: BG2, borderRadius: 12,
              border: `1px solid ${BORDER}`,
              boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
              zIndex: 9991, display: 'flex', flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* Close button */}
              <button className="modal-close" onClick={() => setSelectedProduct(null)}
                style={{
                  position: 'absolute', top: 12, right: 12,
                  width: 36, height: 36, borderRadius: '50%',
                  background: BG3, border: `1px solid ${BORDER}`,
                  color: MUTED, fontSize: '1.2rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 1, transition: 'color 0.15s, background 0.15s', lineHeight: 1
                }}>×</button>

              <div style={{ display: 'flex', flexDirection: 'row', overflow: 'hidden', flex: 1 }}>
                {/* Image */}
                <div style={{ width: '45%', flexShrink: 0, background: BG3, position: 'relative' }}>
                  {img
                    ? <img src={img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    : <div style={{ width: '100%', height: '100%', minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', color: MUTED, opacity: 0.3 }}>🛹</div>
                  }
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
                </div>

                {/* Info */}
                <div className="scrollbar-thin" style={{ flex: 1, padding: '2rem 1.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {p.vendor && (
                    <p style={{ margin: 0, color: GOLD, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{p.vendor}</p>
                  )}
                  <h2 style={{ margin: 0, color: TEXT, fontSize: '1.3rem', fontWeight: 700, lineHeight: 1.35 }}>{p.title}</h2>
                  <p style={{ margin: 0, color: GOLD, fontSize: '1.4rem', fontWeight: 700 }}>${price.toFixed(2)}</p>

                  {p.description && (
                    <p style={{ margin: 0, color: MUTED, fontSize: '0.875rem', lineHeight: 1.65 }}>{p.description}</p>
                  )}

                  {variants.length > 1 && (
                    <div>
                      <p style={{ margin: '0 0 0.4rem', color: MUTED, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em' }}>SELECT VARIANT</p>
                      <select value={variant?.id || ''}
                        onChange={e => {
                          const v = variants.find((x: any) => x.node.id === e.target.value)
                          if (v) setSelectedVariants(prev => ({ ...prev, [p.id]: (v as any).node.id }))
                        }}
                        style={{ width: '100%', padding: '0.5rem 0.75rem', background: BG3, border: `1px solid ${BORDER}`, color: TEXT, borderRadius: 6, fontSize: '0.875rem', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}
                        onFocus={e => (e.target.style.borderColor = GOLD)}
                        onBlur={e => (e.target.style.borderColor = BORDER)}>
                        {variants.map((v: any) => (
                          <option key={v.node.id} value={v.node.id} disabled={!v.node.availableForSale} style={{ background: BG2 }}>
                            {v.node.title}{!v.node.availableForSale ? ' — Sold Out' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button className="add-btn" onClick={e => addToCart(p, e)} disabled={!inStock}
                    style={{
                      marginTop: 'auto', padding: '0.85rem',
                      background: justAdded ? '#1a3a1a' : (inStock ? GOLD : '#222'),
                      border: justAdded ? `1px solid #3a6a3a` : 'none',
                      color: justAdded ? '#6fcf6f' : (inStock ? BG : MUTED),
                      borderRadius: 7, fontWeight: 700, fontSize: '0.9rem',
                      cursor: inStock ? 'pointer' : 'not-allowed',
                      letterSpacing: '0.06em', fontFamily: 'inherit', width: '100%'
                    }}>
                    {justAdded ? '✓ ADDED TO CART' : (inStock ? 'ADD TO CART' : 'SOLD OUT')}
                  </button>
                </div>
              </div>
            </div>
          </>
        )
      })()}

      {/* ── CART OVERLAY ─────────────────────────────────── */}
      {isCartOpen && (
        <div onClick={() => setIsCartOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)', zIndex: 9997 }} />
      )}

      {/* ── CART SIDEBAR ─────────────────────────────────── */}
      <div className="cart-sidebar" style={{
        position: 'fixed', top: 0, right: isCartOpen ? 0 : '-110%',
        maxWidth: '95vw', height: '100vh',
        background: BG2, zIndex: 9998,
        transition: 'right 0.32s cubic-bezier(0.16,1,0.3,1)',
        display: 'flex', flexDirection: 'column',
        borderLeft: `2px solid ${GOLD}`,
        boxShadow: isCartOpen ? '-8px 0 48px rgba(0,0,0,0.7)' : 'none'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.125rem 1.25rem', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ color: GOLD, fontWeight: 700, letterSpacing: '0.08em', fontSize: '1rem' }}>YOUR CART</span>
            {cartCount > 0 && (
              <span style={{ background: GOLD, color: BG, padding: '0.1rem 0.5rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>{cartCount}</span>
            )}
          </div>
          <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', color: MUTED, fontSize: '1.6rem', cursor: 'pointer', lineHeight: 1, padding: '0.2rem 0.4rem' }}>×</button>
        </div>

        <div className="scrollbar-thin" style={{ flex: 1, overflowY: 'auto', padding: '0.875rem' }}>
          {!cart.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: MUTED, textAlign: 'center', gap: '0.875rem' }}>
              <span style={{ fontSize: '2.75rem', opacity: 0.4 }}>🛹</span>
              <p style={{ fontSize: '0.9rem', letterSpacing: '0.06em' }}>YOUR CART IS EMPTY</p>
              <button onClick={() => setIsCartOpen(false)} style={{ padding: '0.7rem 1.5rem', background: GOLD, border: 'none', color: BG, borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', letterSpacing: '0.06em', fontFamily: 'inherit' }}>CONTINUE SHOPPING</button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.variantId} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem', background: BG3, borderRadius: 8, marginBottom: '0.5rem', border: `1px solid ${BORDER}` }}>
                <div style={{ width: 60, height: 60, borderRadius: 6, overflow: 'hidden', background: BG, flexShrink: 0, border: `1px solid ${BORDER}` }}>
                  {item.image
                    ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>🛹</div>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {item.vendor && <p style={{ margin: '0 0 0.1rem', color: GOLD, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{item.vendor}</p>}
                  <p style={{ margin: '0 0 0.2rem', color: TEXT, fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</p>
                  {item.variantTitle && item.variantTitle !== 'Default Title' && (
                    <p style={{ margin: '0 0 0.4rem', color: MUTED, fontSize: '0.72rem' }}>{item.variantTitle}</p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button className="qty-btn" onClick={() => updateQty(item.variantId, -1)} style={{ width: 28, height: 28, background: '#222', border: `1px solid ${BORDER}`, color: TEXT, borderRadius: 4, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ minWidth: 22, textAlign: 'center', fontWeight: 600, color: TEXT, fontSize: '0.875rem' }}>{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.variantId, 1)} style={{ width: 28, height: 28, background: '#222', border: `1px solid ${BORDER}`, color: TEXT, borderRadius: 4, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                    <span style={{ color: GOLD, fontWeight: 700, fontSize: '0.875rem' }}>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                  {/truck/i.test(item.title + ' ' + (item.productType || '')) && item.quantity % 2 !== 0 && (
                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.7rem', color: '#f5a623', background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 4, padding: '0.25rem 0.4rem', lineHeight: 1.4 }}>
                      🛹 A quantity of <strong>2</strong> trucks is required for a complete board.
                    </p>
                  )}
                </div>
                <button className="cart-remove" onClick={() => removeFromCart(item.variantId)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '1.2rem', padding: '0.1rem 0.3rem', flexShrink: 0, transition: 'color 0.15s' }}>×</button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: '1.125rem 1.25rem', borderTop: `1px solid ${BORDER}` }}>
            {checkoutError && (
              <div style={{ background: 'rgba(220,38,38,0.12)', border: `1px solid ${RED}`, color: '#f87171', padding: '0.625rem 0.875rem', borderRadius: 6, marginBottom: '0.875rem', fontSize: '0.82rem' }}>
                {checkoutError}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
              <span style={{ color: MUTED, fontSize: '0.82rem', letterSpacing: '0.06em' }}>SUBTOTAL ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
              <span style={{ color: GOLD, fontSize: '1.4rem', fontWeight: 700 }}>${cartTotal.toFixed(2)}</span>
            </div>
            <button onClick={handleCheckout} disabled={isCheckingOut}
              style={{
                width: '100%', padding: '0.9rem',
                background: isCheckingOut ? '#2a2a2a' : GOLD,
                color: isCheckingOut ? MUTED : BG,
                border: 'none', borderRadius: 6, fontWeight: 700, fontSize: '0.95rem',
                letterSpacing: '0.08em', cursor: isCheckingOut ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'background 0.2s', fontFamily: 'inherit',
                boxShadow: isCheckingOut ? 'none' : `0 4px 16px rgba(201,169,97,0.28)`
              }}>
              {isCheckingOut
                ? <><span style={{ width: 16, height: 16, border: `2px solid #555`, borderTopColor: GOLD, borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> PROCESSING...</>
                : 'PROCEED TO CHECKOUT'
              }
            </button>
            <p style={{ textAlign: 'center', color: MUTED, fontSize: '0.72rem', marginTop: '0.75rem', letterSpacing: '0.04em' }}>🔒 Secure checkout via Shopify</p>
          </div>
        )}
      </div>

      {/* ── MOBILE FILTER DRAWER OVERLAY ─────────────────── */}
      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)', zIndex: 8997 }} />
      )}

      {/* ── MOBILE FILTER DRAWER ─────────────────────────── */}
      <div style={{
        position: 'fixed', top: 0, left: isSidebarOpen ? 0 : '-290px',
        width: 280, height: '100vh',
        background: BG2, zIndex: 8998,
        transition: 'left 0.3s cubic-bezier(0.16,1,0.3,1)',
        display: 'flex', flexDirection: 'column',
        borderRight: `2px solid ${GOLD}`,
        boxShadow: isSidebarOpen ? '8px 0 48px rgba(0,0,0,0.6)' : 'none',
        overflowY: 'auto'
      }} className="scrollbar-thin">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
          <span style={{ color: GOLD, fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.9rem' }}>FILTER</span>
          <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', color: MUTED, fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }} className="scrollbar-thin">
          {renderSidebar()}
        </div>
      </div>

      {/* ── MOBILE TOP BAR ───────────── */}
      <div className="mobile-top-bar">
        <button
          className="shop-sidebar-mobile-btn"
          onClick={() => setIsSidebarOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.5rem 0.875rem',
            background: hasActiveFilters ? `rgba(201,169,97,0.12)` : BG3,
            border: `1px solid ${hasActiveFilters ? GOLD : BORDER}`,
            color: hasActiveFilters ? GOLD : TEXT,
            borderRadius: 6, cursor: 'pointer', fontWeight: 600,
            fontSize: '0.82rem', letterSpacing: '0.04em', fontFamily: 'inherit',
            whiteSpace: 'nowrap'
          }}>
          ☰ Filter{hasActiveFilters ? ' •' : ''}
        </button>

        <select
          value={sortBy}
          onChange={e => { setSortBy(e.target.value); setPage(1) }}
          style={{
            flex: 1, padding: '0.5rem 0.75rem',
            background: BG3, border: `1px solid ${BORDER}`,
            color: TEXT, borderRadius: 6, fontSize: '0.82rem',
            cursor: 'pointer', outline: 'none', fontFamily: 'inherit'
          }}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {hasActiveFilters && (
          <button onClick={clearFilters}
            style={{ padding: '0.5rem 0.75rem', background: 'none', border: `1px solid ${BORDER}`, color: MUTED, borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
            Clear ×
          </button>
        )}
      </div>

      {/* ── MOBILE SEARCH BAR ────────────────────────────── */}
      <div className="mobile-search-bar">
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setPage(1) }}
            style={{
              width: '100%', padding: '0.6rem 2rem 0.6rem 0.875rem',
              background: BG3, border: `1px solid ${BORDER}`,
              color: TEXT, borderRadius: 6, fontSize: '0.9rem',
              outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
            }}
            onFocus={e => (e.target.style.borderColor = GOLD)}
            onBlur={e => (e.target.style.borderColor = BORDER)}
          />
          {searchTerm && (
            <button onClick={() => { setSearchTerm(''); setPage(1) }}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>×</button>
          )}
        </div>
      </div>

      {/* ── MAIN LAYOUT ──────────────────────────────────── */}
      <div className="shop-layout">

        {/* Desktop sidebar */}
        <aside className="shop-sidebar-desktop" style={{ width: 220, flexShrink: 0, position: 'sticky', top: 100, maxHeight: 'calc(100vh - 115px)', overflowY: 'auto' }}>
          {renderSidebar()}
        </aside>

        {/* Product area */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Desktop toolbar */}
          <div className="shop-toolbar">
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: TEXT, margin: 0, letterSpacing: '0.04em' }}>{currentLabel}</h1>
              <p style={{ color: MUTED, fontSize: '0.78rem', margin: '0.15rem 0 0', letterSpacing: '0.04em' }}>{filtered.length} {filtered.length === 1 ? 'product' : 'products'}</p>
            </div>
            <div className="toolbar-right">
              {hasActiveFilters && (
                <button onClick={clearFilters} style={{ padding: '0.45rem 0.875rem', background: 'none', border: `1px solid ${BORDER}`, color: MUTED, borderRadius: 5, cursor: 'pointer', fontSize: '0.8rem', letterSpacing: '0.04em', fontFamily: 'inherit' }}>
                  Clear filters ×
                </button>
              )}
              <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1) }} className="sort-select"
                style={{ padding: '0.45rem 0.875rem', background: BG2, border: `1px solid ${BORDER}`, color: TEXT, borderRadius: 5, fontSize: '0.85rem', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* ── STAFF PICKS ── */}
          {!hasActiveFilters && staffPicks.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.2em', color: GOLD, textTransform: 'uppercase' }}>⭐ Staff Picks</span>
                <div style={{ flex: 1, height: 1, background: BORDER }} />
              </div>
              <div style={{ display: 'flex', gap: '0.875rem', overflowX: 'auto', paddingBottom: '0.75rem' }} className="scrollbar-thin">
                {staffPicks.map(p => {
                  const img = p.images.edges[0]?.node.url
                  const price = parseFloat(p.priceRange.minVariantPrice.amount)
                  const inStock = p.variants.edges[0]?.node.availableForSale ?? false
                  return (
                    <div key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      style={{
                        minWidth: 140, maxWidth: 140, background: BG3, borderRadius: 8,
                        border: `1px solid ${BORDER}`, cursor: 'pointer', flexShrink: 0,
                        transition: 'border-color 0.2s, transform 0.2s',
                        overflow: 'hidden',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = GOLD; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; (e.currentTarget as HTMLElement).style.transform = '' }}
                    >
                      <div style={{ aspectRatio: '1', overflow: 'hidden', background: BG }}>
                        {img
                          ? <img src={img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: MUTED, opacity: 0.3 }}>🛹</div>
                        }
                      </div>
                      <div style={{ padding: '0.625rem' }}>
                        <p style={{ margin: 0, color: TEXT, fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '0.25rem' }}>{p.title}</p>
                        <p style={{ margin: 0, color: GOLD, fontSize: '0.85rem', fontWeight: 700 }}>${price.toFixed(2)}</p>
                        {!inStock && <p style={{ margin: '0.25rem 0 0', color: MUTED, fontSize: '0.62rem', letterSpacing: '0.06em' }}>SOLD OUT</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Grid */}
          {display.length > 0 ? (
            <div className="products-grid">
              {display.map(p => {
                const img = p.images.edges[0]?.node.url
                const variant = getVariant(p)
                const inStock = variant?.availableForSale ?? false
                const qty = variant?.quantityAvailable ?? 0
                const price = parseFloat(p.priceRange.minVariantPrice.amount)
                const variants = p.variants.edges
                const justAdded = addedProduct === p.id
                const productIsNew = isNew(p.createdAt)

                return (
                  <div key={p.id} className="product-card prod-card-wrap"
                    onClick={() => setSelectedProduct(p)}
                    style={{ background: BG2, borderRadius: 8, overflow: 'hidden', border: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                    <div style={{ position: 'relative', aspectRatio: '1', background: BG3, overflow: 'hidden' }}>
                      {img
                        ? <img src={img} alt={p.title} className="card-img" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s ease', display: 'block' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED, fontSize: '2.5rem', opacity: 0.3 }}>🛹</div>
                      }
                      {!inStock && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ background: '#111', color: MUTED, padding: '0.35rem 0.75rem', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', borderRadius: 4, border: `1px solid ${BORDER}` }}>SOLD OUT</span>
                        </div>
                      )}
                      {inStock && qty > 0 && qty <= 3 && (
                        <span style={{ position: 'absolute', top: 8, left: 8, background: RED, color: '#fff', padding: '0.2rem 0.5rem', fontSize: '0.6rem', fontWeight: 700, borderRadius: 4, letterSpacing: '0.06em' }}>
                          ONLY {qty} LEFT
                        </span>
                      )}
                      {productIsNew && inStock && !(qty > 0 && qty <= 3) && (
                        <span style={{ position: 'absolute', top: 8, left: 8, background: GOLD, color: BG, padding: '0.2rem 0.55rem', fontSize: '0.6rem', fontWeight: 800, borderRadius: 4, letterSpacing: '0.08em' }}>
                          NEW
                        </span>
                      )}
                      {/* Quick Add button — slides up on hover */}
                      {inStock && (
                        <button
                          className="prod-card-quick-add"
                          onClick={e => addToCart(p, e)}
                        >
                          + QUICK ADD
                        </button>
                      )}
                    </div>

                    <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {p.vendor && (
                        <p style={{ margin: 0, color: GOLD, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{p.vendor}</p>
                      )}
                      <h3 style={{ margin: 0, color: TEXT, fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                        {p.title}
                      </h3>

                      {variants.length > 1 && (
                        <select value={variant?.id || ''}
                          onClick={e => e.stopPropagation()}
                          onChange={e => {
                            const v = variants.find((x: any) => x.node.id === e.target.value)
                            if (v) setSelectedVariants(prev => ({ ...prev, [p.id]: (v as any).node.id }))
                          }}
                          style={{ width: '100%', padding: '0.4rem 0.5rem', background: BG3, border: `1px solid ${BORDER}`, color: TEXT, borderRadius: 5, fontSize: '0.78rem', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}
                          onFocus={e => (e.target.style.borderColor = GOLD)}
                          onBlur={e => (e.target.style.borderColor = BORDER)}>
                          {variants.map((v: any) => (
                            <option key={v.node.id} value={v.node.id} disabled={!v.node.availableForSale} style={{ background: BG2 }}>
                              {v.node.title}{!v.node.availableForSale ? ' — Sold Out' : ''}
                            </option>
                          ))}
                        </select>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.25rem', gap: '0.375rem' }}>
                        <span style={{ color: TEXT, fontSize: '1rem', fontWeight: 700, flexShrink: 0 }}>${price.toFixed(2)}</span>
                        <button className="add-btn" onClick={e => addToCart(p, e)} disabled={!inStock}
                          style={{
                            padding: '0.45rem 0.625rem',
                            background: justAdded ? '#1a3a1a' : (inStock ? GOLD : '#222'),
                            border: justAdded ? `1px solid #3a6a3a` : 'none',
                            color: justAdded ? '#6fcf6f' : (inStock ? BG : MUTED),
                            borderRadius: 5, fontWeight: 700, fontSize: '0.72rem',
                            cursor: inStock ? 'pointer' : 'not-allowed',
                            letterSpacing: '0.05em', whiteSpace: 'nowrap', fontFamily: 'inherit'
                          }}>
                          {justAdded ? '✓ ADDED' : (inStock ? 'ADD TO CART' : 'SOLD OUT')}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: MUTED }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem', opacity: 0.4 }}>🔍</span>
              <p style={{ fontSize: '1rem', marginBottom: '1.25rem', letterSpacing: '0.04em' }}>No products found</p>
              <button onClick={clearFilters} style={{ padding: '0.7rem 1.75rem', background: GOLD, border: 'none', color: BG, borderRadius: 6, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em', fontSize: '0.875rem', fontFamily: 'inherit' }}>
                VIEW ALL PRODUCTS
              </button>
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={page === 1}
                style={{ padding: '0.4rem 0.9rem', background: page === 1 ? '#222' : GOLD, color: page === 1 ? MUTED : '#000', border: 'none', borderRadius: 6, cursor: page === 1 ? 'default' : 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
              >← Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  style={{ width: 36, height: 36, background: n === page ? GOLD : '#222', color: n === page ? '#000' : TEXT, border: `1px solid ${n === page ? GOLD : BORDER}`, borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
                >{n}</button>
              ))}
              <button
                onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={page === totalPages}
                style={{ padding: '0.4rem 0.9rem', background: page === totalPages ? '#222' : GOLD, color: page === totalPages ? MUTED : '#000', border: 'none', borderRadius: 6, cursor: page === totalPages ? 'default' : 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
              >Next →</button>
            </div>
          )}
        </div>
      </div>

      {/* ── PRODUCT DETAIL MODAL ─────────────────────────── */}
      {selectedProduct && (() => {
        const mp = selectedProduct
        const images: { url: string; altText: string }[] = mp.images.edges.map((e: any) => e.node)
        const mVariant = getVariant(mp)
        const mInStock = mVariant?.availableForSale ?? false
        const mPrice = parseFloat(mp.priceRange.minVariantPrice.amount)
        const mVariants = mp.variants.edges
        const mJustAdded = addedProduct === mp.id
        const clampedIdx = Math.min(modalImageIdx, images.length - 1)
        const currentImg = images[clampedIdx]?.url
        const hasMultiple = images.length > 1

        return (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setSelectedProduct(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)', zIndex: 10000 }}
            />

            {/* Modal box */}
            <div style={{
              position: 'fixed', inset: 0, zIndex: 10001,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1rem', pointerEvents: 'none'
            }}>
              <div className="modal-inner" style={{
                pointerEvents: 'auto',
                background: BG2, borderRadius: 12,
                border: `1px solid ${BORDER}`,
                width: '100%', maxWidth: 860,
                maxHeight: '92vh', overflowY: 'auto',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 24px 80px rgba(0,0,0,0.8)'
              }}>
                {/* Close */}
                <button
                  className="modal-close"
                  onClick={() => setSelectedProduct(null)}
                  style={{
                    position: 'absolute', top: 12, right: 12,
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.6)', border: `1px solid ${BORDER}`,
                    color: MUTED, fontSize: '1.25rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 10, transition: 'color 0.15s, background 0.15s', lineHeight: 1
                  }}>×</button>

                <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>

                  {/* ── Left: Image gallery ── */}
                  <div style={{ flex: '1 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem' }}>

                    {/* Main image */}
                    <div style={{ position: 'relative', aspectRatio: '1', background: BG3, borderRadius: 8, overflow: 'hidden' }}>
                      {currentImg
                        ? <img src={currentImg} alt={mp.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', opacity: 0.2 }}>🛹</div>
                      }

                      {/* Prev / Next arrows */}
                      {hasMultiple && (
                        <>
                          <button
                            onClick={e => { e.stopPropagation(); setModalImageIdx(i => (i - 1 + images.length) % images.length) }}
                            style={{
                              position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                              width: 36, height: 36, borderRadius: '50%',
                              background: 'rgba(0,0,0,0.65)', border: `1px solid ${BORDER}`,
                              color: TEXT, fontSize: '1rem', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>‹</button>
                          <button
                            onClick={e => { e.stopPropagation(); setModalImageIdx(i => (i + 1) % images.length) }}
                            style={{
                              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                              width: 36, height: 36, borderRadius: '50%',
                              background: 'rgba(0,0,0,0.65)', border: `1px solid ${BORDER}`,
                              color: TEXT, fontSize: '1rem', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>›</button>
                          {/* Counter */}
                          <span style={{
                            position: 'absolute', bottom: 10, right: 12,
                            background: 'rgba(0,0,0,0.7)', color: MUTED,
                            fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: 4
                          }}>{clampedIdx + 1} / {images.length}</span>
                        </>
                      )}
                    </div>

                    {/* Thumbnail strip */}
                    {hasMultiple && (
                      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }} className="scrollbar-thin">
                        {images.map((img, i) => (
                          <button
                            key={i}
                            onClick={() => setModalImageIdx(i)}
                            style={{
                              flexShrink: 0, width: 60, height: 60, borderRadius: 6, overflow: 'hidden',
                              border: `2px solid ${i === clampedIdx ? GOLD : BORDER}`,
                              background: BG3, cursor: 'pointer', padding: 0,
                              transition: 'border-color 0.15s'
                            }}>
                            <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── Right: Product info ── */}
                  <div style={{ flex: '1 1 280px', minWidth: 0, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: `1px solid ${BORDER}` }}>
                    {mp.vendor && (
                      <p style={{ margin: 0, color: GOLD, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{mp.vendor}</p>
                    )}
                    <h2 style={{ margin: 0, color: TEXT, fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.35 }}>{mp.title}</h2>

                    <p style={{ margin: 0, color: GOLD, fontSize: '1.5rem', fontWeight: 700 }}>${mPrice.toFixed(2)}</p>

                    {mp.description && (
                      <p style={{ margin: 0, color: MUTED, fontSize: '0.875rem', lineHeight: 1.7, maxHeight: 120, overflowY: 'auto' }} className="scrollbar-thin">
                        {mp.description}
                      </p>
                    )}

                    {/* Variant selector */}
                    {mVariants.length > 1 && (
                      <div>
                        <p style={{ margin: '0 0 0.4rem', color: MUTED, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Option</p>
                        <select
                          value={mVariant?.id || ''}
                          onChange={e => {
                            const v = mVariants.find((x: any) => x.node.id === e.target.value)
                            if (v) setSelectedVariants(prev => ({ ...prev, [mp.id]: (v as any).node.id }))
                          }}
                          style={{
                            width: '100%', padding: '0.6rem 0.75rem',
                            background: BG3, border: `1px solid ${BORDER}`,
                            color: TEXT, borderRadius: 6, fontSize: '0.875rem',
                            cursor: 'pointer', outline: 'none', fontFamily: 'inherit'
                          }}
                          onFocus={e => (e.target.style.borderColor = GOLD)}
                          onBlur={e => (e.target.style.borderColor = BORDER)}>
                          {mVariants.map((v: any) => (
                            <option key={v.node.id} value={v.node.id} disabled={!v.node.availableForSale} style={{ background: BG2 }}>
                              {v.node.title}{!v.node.availableForSale ? ' — Sold Out' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Stock status */}
                    {!mInStock && (
                      <p style={{ margin: 0, color: RED, fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.06em' }}>OUT OF STOCK</p>
                    )}

                    {/* Add to cart */}
                    <button
                      className="add-btn"
                      onClick={e => addToCart(mp, e)}
                      disabled={!mInStock}
                      style={{
                        padding: '0.875rem',
                        background: mJustAdded ? '#1a3a1a' : (mInStock ? GOLD : '#222'),
                        border: mJustAdded ? `1px solid #3a6a3a` : 'none',
                        color: mJustAdded ? '#6fcf6f' : (mInStock ? BG : MUTED),
                        borderRadius: 7, fontWeight: 700, fontSize: '0.9rem',
                        cursor: mInStock ? 'pointer' : 'not-allowed',
                        letterSpacing: '0.08em', fontFamily: 'inherit',
                        transition: 'background 0.2s',
                        boxShadow: mInStock && !mJustAdded ? `0 4px 16px rgba(201,169,97,0.25)` : 'none'
                      }}>
                      {mJustAdded ? '✓ ADDED TO CART' : (mInStock ? 'ADD TO CART' : 'SOLD OUT')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      })()}

    </div>
  )
}