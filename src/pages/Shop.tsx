import { useState, useEffect, useRef } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { getProducts } from "../lib/shopify"
import { isExcluded } from "../lib/filters"
import { pickStaffPicks } from "../lib/stock"
import { useScrollReveal } from "../hooks/useScrollReveal"
import { useCart } from "../context/CartContext"

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
      { id: 'completes', label: 'Complete Setups', keywords: ['complete', 'pre-built', 'setup', 'complete skateboard', 'complete setup', 'completes'] },
      { id: 'decks', label: 'Decks', keywords: ['deck', 'decks', 'skateboard deck', 'skateboard decks', 'skate deck', 'skate decks'] },
      { id: 'trucks', label: 'Trucks', keywords: ['truck', 'trucks', 'skateboard truck', 'skateboard trucks'] },
      { id: 'wheels', label: 'Wheels', keywords: ['wheel', 'wheels', 'skateboard wheel', 'skateboard wheels'] },
      { id: 'bearings', label: 'Bearings', keywords: ['bearing', 'bearings', 'abec'] },
      { id: 'grip', label: 'Griptape', keywords: ['grip', 'griptape', 'grip tape', 'grip tapes'] },
      { id: 'hardware', label: 'Hardware', keywords: ['hardware', 'bolt', 'bolts', 'nuts and bolts', 'mounting hardware', 'riser', 'risers', 'riser pad', 'skate hardware'] },
    ]
  },
  {
    id: 'apparel', label: 'Apparel',
    subcategories: [
      { id: 'tshirts', label: 'T-Shirts', keywords: ['shirt', 't-shirt', 'tee', 'tees', 't shirt', 'short sleeve', 'top'] },
      { id: 'hoodies', label: 'Hoodies & Fleece', keywords: ['hoodie', 'hoodies', 'sweatshirt', 'crewneck', 'crew neck', 'fleece', 'pullover', 'zip up', 'zip-up', 'long sleeve'] },
      { id: 'pants', label: 'Pants & Shorts', keywords: ['pant', 'pants', 'shorts', 'jeans', 'chino', 'chinos', 'jogger', 'joggers', 'denim', 'bottoms'] },
      { id: 'hats', label: 'Hats & Beanies', keywords: ['hat', 'hats', 'cap', 'caps', 'beanie', 'beanies', 'snapback', 'fitted', 'headwear', 'dad hat', 'bucket hat'] },
      { id: 'socks', label: 'Socks', keywords: ['sock', 'socks'] },
      { id: 'womens', label: "Women's", keywords: ['women', "women's", 'womens', 'ladies', "lady's", 'woman', 'female'] },
      { id: 'kids', label: "Kids'", keywords: ['kid', "kid's", 'kids', 'youth', 'toddler', 'junior', 'juniors', 'child', 'children', "children's", 'boys', 'girls'] },
    ]
  },
  {
    id: 'accessories', label: 'Accessories',
    subcategories: [
      { id: 'bags', label: 'Bags & Backpacks', keywords: ['bag', 'bags', 'backpack', 'backpacks', 'pack', 'tote', 'duffle', 'duffel', 'fanny', 'hip bag'] },
      { id: 'protection', label: 'Protection', keywords: ['helmet', 'helmets', 'pad', 'pads', 'protective', 'guard', 'guards', 'knee pad', 'elbow pad', 'wrist guard'] },
      { id: 'other', label: 'Misc & Stickers', keywords: ['sticker', 'stickers', 'keychain', 'wax', 'skate tool', 'tool', 'accessory', 'accessories', 'misc', 'patch', 'patches', 'lanyard'] },
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

// Match against productType, tags, title, and vendor so categories work
// even when Shopify products don't have productType filled in
function matchesProductType(product: any, keywords: string[]) {
  const searchable = [
    product.productType || '',
    product.title || '',
    product.vendor || '',
    ...(product.tags || []),
  ].join(' ').toLowerCase()
  return keywords.some(kw => searchable.includes(kw.toLowerCase()))
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
  const [searchParams, setSearchParams] = useSearchParams()
  const { addItem, setIsCartOpen } = useCart()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeCategory, setActiveCategory] = useState('all')
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('q') || '')
  const [sortBy, setSortBy] = useState('newest')
  const [expandedCats, setExpandedCats] = useState<string[]>(['skate'])
  const [page, setPage] = useState(1)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [addedProduct, setAddedProduct] = useState<string | null>(null)
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; icon: string }[]>([])
  const [searchFocused, setSearchFocused] = useState(false)
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('hb_recent') || '[]') } catch { return [] }
  })

  const searchRef = useRef<HTMLInputElement>(null)
  const searchDropdownRef = useRef<HTMLDivElement>(null)

  // Re-run scroll reveal whenever products, page, or active filters change
  useScrollReveal([products, page, activeCategory, activeSubcategory, searchTerm])

  const qParam = searchParams.get('q') || ''
  useEffect(() => {
    setSearchTerm(qParam)
    setPage(1)
  }, [qParam])

  const setSearch = (value: string) => {
    setSearchTerm(value)
    setPage(1)
    const next = new URLSearchParams(searchParams)
    if (value.trim()) next.set('q', value.trim())
    else next.delete('q')
    setSearchParams(next, { replace: true })
  }

  useEffect(() => {
    getProducts()
      .then(p => {
        const filtered = p.filter((x: any) => !isExcluded(x))
        // Log unique productTypes so we can tune category keywords
        const types = [...new Set(filtered.map((x: any) => x.productType).filter(Boolean))]
        console.log('[Shop] productTypes in store:', types)
        setProducts(filtered)
        setLoading(false)
      })
      .catch((e: any) => { setError(e.message); setLoading(false) })
  }, [])

  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1024) setIsSidebarOpen(false) }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
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
    setSearch(''); setSortBy('newest'); setPage(1)
  }

  const hasActiveFilters = activeCategory !== 'all' || !!searchTerm

  // Staff picks: in-stock `staff-pick` tags, else newest in-stock
  const staffPicks = pickStaffPicks(products, 6)

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
    e?.preventDefault()
    const v = getVariant(p)
    if (!v || !v.availableForSale) return
    addItem({
      variantId: v.id,
      title: p.title,
      vendor: p.vendor,
      variantTitle: v.title,
      price: v.price?.amount || p.priceRange.minVariantPrice.amount,
      image: p.images.edges[0]?.node.url,
      quantity: 1,
      productType: p.productType,
    })
    spawnConfetti(e)
    setAddedProduct(p.id)
    setTimeout(() => { setAddedProduct(null) }, 1200)
  }

  const trackRecentlyViewed = (product: any) => {
    setRecentlyViewed(prev => {
      const next = [product, ...prev.filter(p => p.id !== product.id)].slice(0, 8)
      try { localStorage.setItem('hb_recent', JSON.stringify(next)) } catch {}
      return next
    })
  }

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target as Node) &&
          searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Detect if customer returned from a cancelled Shopify checkout
  const [checkoutCancelled, setCheckoutCancelled] = useState(false)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('checkout_cancelled') === '1') {
      setCheckoutCancelled(true)
      params.delete('checkout_cancelled')
      const next = params.toString()
      window.history.replaceState({}, '', `/shop${next ? `?${next}` : ''}`)
    }
  }, [])

  /* ─── Sidebar content — render function (not a component) to avoid remount issues ─── */
  const renderSidebar = () => (
    <div style={{ padding: '1rem' }}>
      {/* Search */}
      <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.4, pointerEvents: 'none', flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onKeyDown={e => e.key === 'Escape' && setSearchFocused(false)}
            style={{
              width: '100%', padding: '0.625rem 2.25rem 0.625rem 2rem',
              background: BG3, border: `1px solid ${searchFocused ? GOLD : BORDER}`,
              color: TEXT, borderRadius: 6, fontSize: '0.875rem',
              outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
              transition: 'border-color 0.2s'
            }}
          />
          {searchTerm && (
            <button onClick={() => { setSearch(''); searchRef.current?.focus() }}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}>×</button>
          )}
        </div>

        {/* Live dropdown */}
        {searchFocused && searchTerm.trim().length > 0 && (() => {
          const hits = products.filter(p => !isExcluded(p) && matchesSearch(p, searchTerm)).slice(0, 6)
          return (
            <div ref={searchDropdownRef} style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
              background: BG2, border: `1px solid ${BORDER}`, borderRadius: 8,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 999, overflow: 'hidden'
            }}>
              {hits.length === 0 ? (
                <div style={{ padding: '0.875rem', color: MUTED, fontSize: '0.8rem', textAlign: 'center' }}>No results for "{searchTerm}"</div>
              ) : (
                <>
                  {hits.map(p => {
                    const img = p.images.edges[0]?.node.url
                    const price = p.priceRange.minVariantPrice.amount
                    return (
                      <Link key={p.id} to={`/shop/${p.handle}`} onMouseDown={() => {
                        trackRecentlyViewed(p)
                        setSearchFocused(false)
                      }} style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
                        padding: '0.6rem 0.75rem', background: 'none', border: 'none',
                        borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', textAlign: 'left',
                        transition: 'background 0.15s', textDecoration: 'none',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = BG3)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                        <div style={{ width: 40, height: 40, borderRadius: 5, overflow: 'hidden', background: BG3, flexShrink: 0 }}>
                          {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>🛹</div>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, color: TEXT, fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                          {p.vendor && <p style={{ margin: 0, color: MUTED, fontSize: '0.68rem' }}>{p.vendor}</p>}
                        </div>
                        <span style={{ color: GOLD, fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>${parseFloat(price).toFixed(2)}</span>
                      </Link>
                    )
                  })}
                  <button onMouseDown={() => { setSearchFocused(false) }}
                    style={{ width: '100%', padding: '0.5rem', background: 'none', border: 'none', color: MUTED, fontSize: '0.72rem', cursor: 'pointer', letterSpacing: '0.05em' }}>
                    See all {products.filter(p => !isExcluded(p) && matchesSearch(p, searchTerm)).length} results in grid ↓
                  </button>
                </>
              )}
            </div>
          )
        })()}
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
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: ${BG2};
          border-bottom: 1px solid ${BORDER};
          position: sticky;
          top: 68px;
          z-index: 90;
        }

        /* search bar sits below the filter bar */
        .mobile-search-bar {
          display: none;
          padding: 0.375rem 0.75rem;
          background: ${BG};
          border-bottom: 1px solid ${BORDER};
          position: sticky;
          top: 108px;
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
          .products-grid { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
          .cart-sidebar { width: 100vw !important; max-width: 100vw !important; }
          .shop-layout { padding: 0.5rem; }
        }

        /* ── Mobile (< 600px) ── */
        @media (max-width: 600px) {
          .mobile-top-bar { top: 60px; padding: 0.375rem 0.625rem; gap: 0.375rem; }
          .mobile-search-bar { top: 100px; padding: 0.3rem 0.625rem; }
          .shop-layout { padding: 0.375rem; }
          .products-grid { grid-template-columns: repeat(2, 1fr); gap: 0.375rem; }
          .card-info { padding: 0.4rem !important; gap: 0.2rem !important; }
          .card-vendor { display: none !important; }
          .card-title { font-size: 0.75rem !important; -webkit-line-clamp: 1 !important; }
          .card-price { font-size: 0.85rem !important; }
          .card-add-btn { padding: 0.3rem 0.375rem !important; font-size: 0.65rem !important; letter-spacing: 0 !important; }
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
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.45rem 2rem 0.45rem 0.75rem',
              background: BG3, border: `1px solid ${BORDER}`,
              color: TEXT, borderRadius: 6, fontSize: '0.85rem',
              outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
            }}
            onFocus={e => (e.target.style.borderColor = GOLD)}
            onBlur={e => (e.target.style.borderColor = BORDER)}
          />
          {searchTerm && (
            <button onClick={() => setSearch('')}
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
            <div className="reveal">
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
              <div className="reveal" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.2em', color: GOLD, textTransform: 'uppercase' }}>⭐ Staff Picks</span>
                <div style={{ flex: 1, height: 1, background: BORDER }} />
              </div>
              <div style={{ display: 'flex', gap: '0.875rem', overflowX: 'auto', paddingBottom: '0.75rem' }} className="scrollbar-thin">
                {staffPicks.map((p, i) => {
                  const img = p.images.edges[0]?.node.url
                  const price = parseFloat(p.priceRange.minVariantPrice.amount)
                  const inStock = p.variants.edges[0]?.node.availableForSale ?? false
                  return (
                    <Link key={p.id} to={`/shop/${p.handle}`}
                      onClick={() => trackRecentlyViewed(p)}
                      className={`reveal reveal-scale reveal-delay-${(i % 4) + 1}`}
                      style={{
                        minWidth: 140, maxWidth: 140, background: BG3, borderRadius: 8,
                        border: `1px solid ${BORDER}`, cursor: 'pointer', flexShrink: 0,
                        transition: 'border-color 0.2s, transform 0.2s',
                        overflow: 'hidden', textDecoration: 'none',
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
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Grid */}
          {display.length > 0 ? (
            <div className="products-grid">
              {display.map((p, idx) => {
                const img = p.images.edges[0]?.node.url
                const variant = getVariant(p)
                const inStock = variant?.availableForSale ?? false
                const qty = variant?.quantityAvailable ?? 0
                const price = parseFloat(p.priceRange.minVariantPrice.amount)
                const variants = p.variants.edges
                const justAdded = addedProduct === p.id
                const productIsNew = isNew(p.createdAt)

                return (
                  <div key={p.id} className={`product-card prod-card-wrap reveal reveal-delay-${(idx % 4) + 1}`}
                    style={{ background: BG2, borderRadius: 8, overflow: 'hidden', border: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ position: 'relative', aspectRatio: '1', background: BG3, overflow: 'hidden' }}>
                      <Link to={`/shop/${p.handle}`} onClick={() => trackRecentlyViewed(p)} style={{ display: 'block', color: 'inherit', textDecoration: 'none', height: '100%' }}>
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
                      </Link>
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

                    <div className="card-info" style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {p.vendor && (
                        <p className="card-vendor" style={{ margin: 0, color: GOLD, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{p.vendor}</p>
                      )}
                      <h3 className="card-title" style={{ margin: 0, color: TEXT, fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                        <Link to={`/shop/${p.handle}`} onClick={() => trackRecentlyViewed(p)} style={{ color: 'inherit', textDecoration: 'none' }}>{p.title}</Link>
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
                        <span className="card-price" style={{ color: TEXT, fontSize: '1rem', fontWeight: 700, flexShrink: 0 }}>${price.toFixed(2)}</span>
                        <button className="add-btn card-add-btn" onClick={e => addToCart(p, e)} disabled={!inStock}
                          style={{
                            padding: '0.45rem 0.625rem',
                            background: justAdded ? '#1a3a1a' : (inStock ? GOLD : '#222'),
                            border: justAdded ? `1px solid #3a6a3a` : 'none',
                            color: justAdded ? '#6fcf6f' : (inStock ? BG : MUTED),
                            borderRadius: 5, fontWeight: 700, fontSize: '0.72rem',
                            cursor: inStock ? 'pointer' : 'not-allowed',
                            letterSpacing: '0.05em', whiteSpace: 'nowrap', fontFamily: 'inherit'
                          }}>
                          {justAdded ? '✓' : (inStock ? 'ADD' : '—')}
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
            <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={page === 1}
                style={{ padding: '0.3rem 0.7rem', background: page === 1 ? '#222' : GOLD, color: page === 1 ? MUTED : '#000', border: 'none', borderRadius: 5, cursor: page === 1 ? 'default' : 'pointer', fontWeight: 700, fontSize: '0.72rem' }}
              >← Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  style={{ width: 28, height: 28, background: n === page ? GOLD : '#222', color: n === page ? '#000' : TEXT, border: `1px solid ${n === page ? GOLD : BORDER}`, borderRadius: 5, cursor: 'pointer', fontWeight: 700, fontSize: '0.72rem' }}
                >{n}</button>
              ))}
              <button
                onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={page === totalPages}
                style={{ padding: '0.3rem 0.7rem', background: page === totalPages ? '#222' : GOLD, color: page === totalPages ? MUTED : '#000', border: 'none', borderRadius: 5, cursor: page === totalPages ? 'default' : 'pointer', fontWeight: 700, fontSize: '0.72rem' }}
              >Next →</button>
            </div>
          )}

          {/* ── RECENTLY VIEWED ── */}
          {recentlyViewed.length > 0 && (
            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: `1px solid ${BORDER}`, animation: 'fadeUp 0.4s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.2em', color: MUTED, textTransform: 'uppercase' }}>🕐 Recently Viewed</span>
                <div style={{ flex: 1, height: 1, background: BORDER }} />
                <button
                  onClick={() => {
                    setRecentlyViewed([])
                    try { localStorage.removeItem('hb_recent') } catch {}
                  }}
                  style={{ background: 'none', border: 'none', color: MUTED, fontSize: '0.68rem', cursor: 'pointer', letterSpacing: '0.05em', textDecoration: 'underline', textUnderlineOffset: 2, fontFamily: 'inherit', flexShrink: 0 }}>
                  Clear
                </button>
              </div>
              <div style={{ display: 'flex', gap: '0.875rem', overflowX: 'auto', paddingBottom: '0.75rem' }} className="scrollbar-thin">
                {recentlyViewed.map((p, i) => {
                  const img = p.images?.edges?.[0]?.node?.url
                  const price = parseFloat(p.priceRange?.minVariantPrice?.amount ?? '0')
                  const inStock = p.variants?.edges?.[0]?.node?.availableForSale ?? false
                  return (
                    <Link key={p.id} to={p.handle ? `/shop/${p.handle}` : '/shop'}
                      onClick={() => trackRecentlyViewed(p)}
                      style={{
                        minWidth: 140, maxWidth: 140, background: BG3, borderRadius: 8,
                        border: `1px solid ${BORDER}`, cursor: 'pointer', flexShrink: 0,
                        overflow: 'hidden', transition: 'border-color 0.2s, transform 0.2s',
                        animation: `fadeUp 0.35s ease ${i * 0.06}s both`,
                        textDecoration: 'none',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = GOLD; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; (e.currentTarget as HTMLElement).style.transform = '' }}
                    >
                      <div style={{ aspectRatio: '1', overflow: 'hidden', background: BG, position: 'relative' }}>
                        {img
                          ? <img src={img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: MUTED, opacity: 0.3 }}>🛹</div>
                        }
                        {!inStock && (
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ background: '#111', color: MUTED, padding: '0.25rem 0.5rem', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.08em', borderRadius: 3, border: `1px solid ${BORDER}` }}>SOLD OUT</span>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '0.625rem' }}>
                        <p style={{ margin: 0, color: TEXT, fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '0.25rem' }}>{p.title}</p>
                        <p style={{ margin: 0, color: GOLD, fontSize: '0.85rem', fontWeight: 700 }}>${price.toFixed(2)}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      </div>


    </div>
  )
}