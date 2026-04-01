const EXCLUDED_KEYWORDS = [
  'drink', 'beverage', 'soda', 'water', 'food', 'snack', 'candy',
  'energy drink', 'juice', 'coffee', 'tea', 'beer', 'alcohol',
]

export function isExcluded(p: any): boolean {
  const text = [p.title, p.productType, p.description, ...(p.tags || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return EXCLUDED_KEYWORDS.some(kw => text.includes(kw))
}
