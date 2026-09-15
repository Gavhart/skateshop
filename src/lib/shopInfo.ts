/** Shared, verified shop facts. Do not invent phone numbers, rates, or emails. */
export const shopInfo = {
  name: 'Hart Boys Skate Shop',
  shortName: 'Hart Boys',
  tagline: 'Soldotna, Alaska',
  email: 'hartboysskateshop@gmail.com',
  instagramHandle: '@hartboysskateshop',
  instagramUrl: 'https://instagram.com/hartboysskateshop',
  facebookUrl: 'https://facebook.com/hartboysskateshop',
  siteUrl: 'https://hartboysskateshop.com',
  mall: 'Peninsula Center Mall',
  suite: 'Suite 48C',
  street: '44332 Sterling Highway',
  city: 'Soldotna',
  state: 'AK',
  zip: '99669',
  freeShippingThreshold: 150,
  hours: {
    winter: { label: 'Winter', days: 'Mon–Sat', time: '11:00 AM – 6:00 PM', sunday: 'Closed' },
    summer: { label: 'Summer', days: 'Mon–Sat', time: '10:00 AM – 7:00 PM', sunday: 'Closed' },
  },
} as const

export const shopAddressLine = `${shopInfo.street}, ${shopInfo.suite}, ${shopInfo.city}, ${shopInfo.state} ${shopInfo.zip}`

export const shopMapsUrl = `https://maps.google.com/?q=${encodeURIComponent(
  `${shopInfo.street} ${shopInfo.city} ${shopInfo.state} ${shopInfo.zip}`
)}`

export const defaultMeta = {
  title: `${shopInfo.name} | ${shopInfo.city}, ${shopInfo.state}`,
  description:
    'Hart Boys Skate Shop in Soldotna, Alaska — decks, shoes, apparel, and skate classes at Peninsula Center Mall, Suite 48C.',
  imagePath: '/logo.jpeg',
}

export function formatUsd(amount: number | string) {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  if (!Number.isFinite(n)) return '$0.00'
  return `$${n.toFixed(2)}`
}
