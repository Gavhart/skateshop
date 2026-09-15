import type { Product } from './shopify'

export function isInStock(p: Product | null | undefined): boolean {
  if (!p) return false
  if (typeof p.totalInventory === 'number' && p.totalInventory <= 0) return false
  const variants = p.variants?.edges || []
  if (variants.length === 0) return p.availableForSale === true
  return variants.some(v => v.node.availableForSale)
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

export function productDescription(p: Product): string {
  const fromShopify = (p.description || '').trim()
  if (fromShopify) return fromShopify
  const vendor = p.vendor ? ` from ${p.vendor}` : ''
  return `${p.title}${vendor} — available at Hart Boys Skate Shop in Soldotna, Alaska.`
}
