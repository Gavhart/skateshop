import type { Product } from './shopify'
import { isExcluded } from './filters'
import { firstAvailableVariant, isInStock } from './stock'

/** Category keywords aligned with Shop.tsx skate subcategories. */
export const SKATE_KEYWORDS = {
  completes: ['complete', 'pre-built', 'setup', 'complete skateboard', 'complete setup', 'completes'],
  decks: ['deck', 'decks', 'skateboard deck', 'skateboard decks', 'skate deck', 'skate decks'],
  trucks: ['truck', 'trucks', 'skateboard truck', 'skateboard trucks'],
  wheels: ['wheel', 'wheels', 'skateboard wheel', 'skateboard wheels'],
  bearings: ['bearing', 'bearings', 'abec'],
  grip: ['grip', 'griptape', 'grip tape', 'grip tapes'],
  hardware: ['hardware', 'bolt', 'bolts', 'nuts and bolts', 'mounting hardware', 'riser', 'risers', 'riser pad', 'skate hardware'],
} as const

export type StarterPartId = 'deck' | 'trucks' | 'wheels' | 'grip' | 'bearings' | 'hardware'

export function productSearchBlob(p: {
  title?: string
  productType?: string
  vendor?: string
  tags?: string[]
}): string {
  return [p.productType || '', p.title || '', p.vendor || '', ...(p.tags || [])]
    .join(' ')
    .toLowerCase()
}

export function matchesKeywords(
  p: { title?: string; productType?: string; vendor?: string; tags?: string[] },
  keywords: readonly string[],
): boolean {
  const blob = productSearchBlob(p)
  return keywords.some(kw => blob.includes(kw.toLowerCase()))
}

export function isCompleteProduct(p: Product): boolean {
  return matchesKeywords(p, SKATE_KEYWORDS.completes)
}

export function isDeckProduct(p: Product): boolean {
  return !isCompleteProduct(p) && matchesKeywords(p, SKATE_KEYWORDS.decks)
}

export function isTrucksProduct(p: Product): boolean {
  return matchesKeywords(p, SKATE_KEYWORDS.trucks)
}

export function isWheelsProduct(p: Product): boolean {
  return matchesKeywords(p, SKATE_KEYWORDS.wheels)
}

export function isGripProduct(p: Product): boolean {
  return matchesKeywords(p, SKATE_KEYWORDS.grip)
}

export function isBearingsProduct(p: Product): boolean {
  return matchesKeywords(p, SKATE_KEYWORDS.bearings)
}

export function isHardwareProduct(p: Product): boolean {
  if (isGripProduct(p) || isBearingsProduct(p)) return false
  return matchesKeywords(p, SKATE_KEYWORDS.hardware)
}

const PART_MATCHERS: Record<StarterPartId, (p: Product) => boolean> = {
  deck: isDeckProduct,
  trucks: isTrucksProduct,
  wheels: isWheelsProduct,
  grip: isGripProduct,
  bearings: isBearingsProduct,
  hardware: isHardwareProduct,
}

export function catalogReady(products: Product[]): Product[] {
  return products.filter(p => !isExcluded(p) && isInStock(p))
}

export function productsForPart(products: Product[], part: StarterPartId): Product[] {
  const match = PART_MATCHERS[part]
  return catalogReady(products).filter(match)
}

export function productsForCompletes(products: Product[]): Product[] {
  return catalogReady(products).filter(isCompleteProduct)
}

export function unitPrice(p: Product): number {
  const variant = firstAvailableVariant(p)
  const raw = variant?.price?.amount || p.priceRange?.minVariantPrice?.amount || '0'
  const n = parseFloat(raw)
  return Number.isFinite(n) ? n : 0
}
