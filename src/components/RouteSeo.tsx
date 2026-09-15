import { useLocation } from 'react-router-dom'
import Seo, { localBusinessJsonLd } from './Seo'
import { defaultMeta, shopInfo } from '../lib/shopInfo'

const DESCRIPTIONS: Record<string, { title: string; description: string }> = {
  '/': {
    title: defaultMeta.title,
    description: defaultMeta.description,
  },
  '/shop': {
    title: `Shop | ${shopInfo.name}`,
    description: `Shop decks, trucks, wheels, shoes, and apparel at ${shopInfo.name} in ${shopInfo.city}, ${shopInfo.state}. Free shipping at $${shopInfo.freeShippingThreshold}+.`,
  },
  '/about': {
    title: `About | ${shopInfo.name}`,
    description: `Family-run skate shop at ${shopInfo.mall}, ${shopInfo.suite} in ${shopInfo.city}, Alaska. Seasonal hours, classes, and real skate gear.`,
  },
  '/classes': {
    title: `Skate Classes | ${shopInfo.name}`,
    description: `Skate classes in ${shopInfo.city}, Alaska — beginner to advanced, private and group lessons at Hart Boys Skate Shop.`,
  },
  '/build': {
    title: `Build a Board | ${shopInfo.name}`,
    description: `Build a custom skateboard at ${shopInfo.name} in ${shopInfo.city}, ${shopInfo.state}.`,
  },
  '/updates': {
    title: `Updates | ${shopInfo.name}`,
    description: `Drops, classes, and shop news from ${shopInfo.name} in ${shopInfo.city}, Alaska.`,
  },
  '/waiver': {
    title: `Waiver | ${shopInfo.name}`,
    description: `Skate class waiver for ${shopInfo.name}.`,
  },
  '/wall': {
    title: `Wall of Stoke | ${shopInfo.name}`,
    description: `Wall of Stoke — shoutouts from the Hart Boys crew.`,
  },
  '/order-success': {
    title: `Order placed | ${shopInfo.name}`,
    description: `Thanks for supporting ${shopInfo.name}.`,
  },
}

const CHILD_HANDLED = new Set(['/privacy', '/terms', '/shipping'])

export default function RouteSeo() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/shop/') || CHILD_HANDLED.has(pathname)) return null

  const meta = DESCRIPTIONS[pathname] || {
    title: defaultMeta.title,
    description: defaultMeta.description,
  }

  return (
    <Seo
      title={meta.title}
      description={meta.description}
      path={pathname}
      jsonLd={pathname === '/' ? localBusinessJsonLd() : null}
    />
  )
}
