import type { Product, ProductVariant } from './shopify'

export function isInStock(p: Product | null | undefined): boolean {
  if (!p) return false
  if (typeof p.totalInventory === 'number' && p.totalInventory <= 0) return false
  const variants = p.variants?.edges || []
  if (variants.length === 0) return p.availableForSale === true
  return variants.some(v => v.node.availableForSale)
}

export function firstAvailableVariant(p: Product | null | undefined): ProductVariant | null {
  if (!p) return null
  const variants = p.variants?.edges || []
  return variants.find(v => v.node.availableForSale)?.node || variants[0]?.node || null
}

/** Staff picks: in-stock `staff-pick` tags, else newest in-stock items. */
export function pickStaffPicks<T extends Product>(products: T[], limit = 6): T[] {
  const tagged = products.filter(p =>
    isInStock(p) && (p.tags || []).some(t => t.toLowerCase() === 'staff-pick')
  )
  if (tagged.length >= 2) return tagged.slice(0, limit)
  return products.filter(isInStock).slice(0, limit)
}

export function pickFreshInStock<T extends Product>(products: T[], limit = 3): T[] {
  return products.filter(isInStock).slice(0, limit)
}

/** Plain-text description for SEO. Empty string when Shopify has no copy. */
export function productDescription(p: Product): string {
  return (p.description || '').trim()
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim()
}

/** Drop script/handlers from merchant HTML. Shopify copy is still merchant-owned. */
export function sanitizeShopifyHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
}

export function shopifyDescriptionHtml(p: Product): string | null {
  const html = (p.descriptionHtml || '').trim()
  if (!html) return null
  const text = stripTags(html)
  if (!text) return null
  return sanitizeShopifyHtml(html)
}

export function hasShopifyDescription(p: Product): boolean {
  const html = (p.descriptionHtml || '').trim()
  if (html && stripTags(html)) return true
  return productDescription(p).length > 0
}

export function productMetaDescription(p: Product): string {
  const fromShopify = productDescription(p)
  if (fromShopify) return fromShopify.slice(0, 180)
  const vendor = p.vendor ? ` from ${p.vendor}` : ''
  return `${p.title}${vendor} — available at Hart Boys Skate Shop in Soldotna, Alaska.`
}
