export const MEGA_MENU = [
  {
    id: 'skate',
    label: 'SKATE',
    subcategories: [
      { id: 'completes', label: 'Completes', keywords: ['complete', 'pre-built', 'skateboard'] },
      { id: 'decks', label: 'Decks', keywords: ['deck', 'decks', 'board'] },
      { id: 'trucks', label: 'Trucks', keywords: ['truck', 'trucks'] },
      { id: 'wheels', label: 'Wheels', keywords: ['wheel', 'wheels'] },
      { id: 'bearings', label: 'Bearings', keywords: ['bearing', 'bearings'] },
      { id: 'grip', label: 'Griptape', keywords: ['grip', 'griptape', 'tape'] },
      { id: 'hardware', label: 'Hardware', keywords: ['hardware', 'bolt', 'screws', 'nuts'] },
    ]
  },
  {
    id: 'clothes',
    label: 'CLOTHES',
    subcategories: [
      { id: 'shirts', label: 'T-Shirts', keywords: ['shirt', 'shirts', 't-shirt', 'tshirt', 'tee'] },
      { id: 'hoodies', label: 'Hoodies', keywords: ['hoodie', 'hoodies', 'sweatshirt', 'crewneck'] },
      { id: 'pants', label: 'Pants', keywords: ['pant', 'pants', 'jean', 'jeans', 'shorts', 'chino'] },
      { id: 'hats', label: 'Hats', keywords: ['hat', 'hats', 'cap', 'beanie', 'snapback', 'strapback'] },
      { id: 'socks', label: 'Socks', keywords: ['sock', 'socks', 'crew sock'] },
      { id: 'jackets', label: 'Jackets', keywords: ['jacket', 'windbreaker', 'coat', 'outerwear'] },
      { id: 'onesies', label: 'Baby', keywords: ['onesie', 'baby', 'infant', 'youth'] },
    ]
  },
  {
    id: 'accessories',
    label: 'ACCESSORIES',
    subcategories: [
      { id: 'bags', label: 'Bags', keywords: ['bag', 'backpack', 'tote'] },
      { id: 'wallets', label: 'Wallets', keywords: ['wallet', 'wallets'] },
      { id: 'other', label: 'Other', keywords: ['sticker', 'keychain', 'wax', 'tool'] },
    ]
  }
]

export function matchesAny(product, keywords) {
  const fields = [
    product.title,
    product.productType,
    product.description,
    product.vendor,
    ...(product.tags || [])
  ].filter(Boolean).map(s => s.toLowerCase())
  
  return keywords.some(kw => {
    const key = kw.toLowerCase()
    return fields.some(f => f.includes(key))
  })
}
