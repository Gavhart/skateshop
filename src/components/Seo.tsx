import { useEffect } from 'react'
import { defaultMeta, shopInfo } from '../lib/shopInfo'

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    document.head.appendChild(el)
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v))
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export interface SeoProps {
  title?: string
  description?: string
  image?: string
  path?: string
  type?: 'website' | 'product'
  jsonLd?: Record<string, unknown> | null
}

export default function Seo({
  title = defaultMeta.title,
  description = defaultMeta.description,
  image,
  path,
  type = 'website',
  jsonLd = null,
}: SeoProps) {
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : shopInfo.siteUrl
    const url = path ? `${origin}${path}` : (typeof window !== 'undefined' ? window.location.href : shopInfo.siteUrl)
    const img = image
      ? (image.startsWith('http') ? image : `${origin}${image}`)
      : `${origin}${defaultMeta.imagePath}`

    document.title = title

    upsertMeta('meta[name="description"]', { name: 'description', content: description })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: img })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type })
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: shopInfo.name })
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: img })
    upsertLink('canonical', url)

    const json = jsonLd ? JSON.stringify(jsonLd) : ''
    const scriptId = 'hb-jsonld'
    const existing = document.getElementById(scriptId)
    if (jsonLd) {
      const script = existing ?? document.createElement('script')
      script.id = scriptId
      script.type = 'application/ld+json'
      script.textContent = json
      if (!existing) document.head.appendChild(script)
    } else if (existing) {
      existing.remove()
    }
  }, [title, description, image, path, type, jsonLd])

  return null
}

export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: shopInfo.name,
    image: `${shopInfo.siteUrl}${defaultMeta.imagePath}`,
    url: shopInfo.siteUrl,
    email: shopInfo.email,
    sameAs: [shopInfo.instagramUrl, shopInfo.facebookUrl],
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${shopInfo.street}, ${shopInfo.suite}`,
      addressLocality: shopInfo.city,
      addressRegion: shopInfo.state,
      postalCode: shopInfo.zip,
      addressCountry: 'US',
    },
  }
}
