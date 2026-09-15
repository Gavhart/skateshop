const FALLBACK_DOMAIN = 'hartboysskateshop.myshopify.com'
const FALLBACK_TOKEN = '6a847ae6b35f84a2972c46073e123dba'

const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN || FALLBACK_DOMAIN
const STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || FALLBACK_TOKEN
const GRAPHQL_URL = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`

export interface ProductImage {
  url: string
  altText: string | null
}

export interface ProductVariant {
  id: string
  title: string
  availableForSale: boolean
  quantityAvailable: number | null
  price?: { amount: string; currencyCode: string }
}

export interface Product {
  id: string
  title: string
  description: string
  handle: string
  productType: string
  vendor: string
  tags: string[]
  totalInventory: number
  createdAt: string
  availableForSale?: boolean
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string }
  }
  images: {
    edges: Array<{ node: ProductImage }>
  }
  variants: {
    edges: Array<{ node: ProductVariant }>
  }
}

export interface LineItem {
  variantId: string
  quantity: number
}

type CartCreateInput = {
  lines: Array<{ merchandiseId: string; quantity: number }>
  note?: string
  attributes: Array<{ key: string; value: string }>
  buyerIdentity?: {
    countryCode: string
    deliveryAddressPreferences: Array<{
      deliveryAddress: { country: string; province: string }
    }>
  }
}

const PRODUCT_FIELDS = `
  id
  title
  description
  handle
  productType
  vendor
  tags
  totalInventory
  createdAt
  availableForSale
  priceRange {
    minVariantPrice { amount currencyCode }
  }
  images(first: 20) {
    edges { node { url altText } }
  }
  variants(first: 50) {
    edges {
      node {
        id
        title
        availableForSale
        quantityAvailable
        price { amount currencyCode }
      }
    }
  }
`

async function storefront<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  })

  const data = await response.json()
  if (data.errors?.length) {
    throw new Error(data.errors[0].message || 'Shopify request failed')
  }
  return data.data
}

export async function getProducts(): Promise<Product[]> {
  const allProducts: Product[] = []
  let hasNextPage = true
  let cursor: string | null = null
  let page = 0

  console.log('🚀 Fetching all products (newest first)...')

  while (hasNextPage) {
    page++

    const query = `
      query GetProducts($cursor: String) {
        products(first: 250, after: $cursor, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              ${PRODUCT_FIELDS}
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `

    const data = await storefront<{
      products: {
        edges: Array<{ node: Product }>
        pageInfo: { hasNextPage: boolean; endCursor: string | null }
      }
    }>(query, cursor ? { cursor } : {})

    const edges = data?.products?.edges || []
    const pageInfo = data?.products?.pageInfo

    allProducts.push(...edges.map(e => e.node))

    hasNextPage = pageInfo?.hasNextPage || false
    cursor = pageInfo?.endCursor || null

    console.log(`✅ Page ${page}: ${edges.length} products (Total: ${allProducts.length}) | hasNextPage: ${hasNextPage}`)

    if (page >= 10) break
    if (hasNextPage) await new Promise(r => setTimeout(r, 150))
  }

  console.log(`🎉 DONE: ${allProducts.length} products from ${page} pages`)
  return allProducts
}

export async function getProductByHandle(handle: string): Promise<Product | null> {
  const trimmed = handle.trim()
  if (!trimmed) return null

  const query = `
    query GetProduct($handle: String!) {
      product(handle: $handle) {
        ${PRODUCT_FIELDS}
      }
    }
  `

  try {
    const data = await storefront<{ product: Product | null }>(query, { handle: trimmed })
    return data?.product ?? null
  } catch (err) {
    console.error('getProductByHandle failed:', err)
    throw err
  }
}

const CART_CREATE_QUERY = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        cost {
          totalAmount { amount currencyCode }
        }
      }
      userErrors { field message }
    }
  }
`

type CartCreateResult = {
  cartCreate: {
    cart: {
      id: string
      checkoutUrl: string
      cost: { totalAmount: { amount: string; currencyCode: string } }
    } | null
    userErrors: Array<{ field: string[] | null; message: string }>
  }
}

function cartCreateFailed(data: CartCreateResult | null | undefined): boolean {
  return Boolean(
    data?.cartCreate?.userErrors?.length ||
    !data?.cartCreate?.cart?.checkoutUrl
  )
}

async function cartCreate(input: CartCreateInput): Promise<CartCreateResult> {
  return storefront<CartCreateResult>(CART_CREATE_QUERY, { input })
}

export async function createCheckout(lineItems: LineItem[], note?: string) {
  if (!lineItems?.length) throw new Error('Cart empty')

  const baseInput: CartCreateInput = {
    lines: lineItems.map((i: LineItem) => ({
      merchandiseId: i.variantId,
      quantity: i.quantity,
    })),
    note: note || undefined,
    attributes: [
      { key: 'return_url', value: window.location.origin },
      { key: '_return_url', value: window.location.origin },
    ],
  }

  // Prefer Alaska at checkout without inventing a street address.
  // If Storefront rejects a province-only preference, fall back to a plain cart.
  const alaskaInput: CartCreateInput = {
    ...baseInput,
    buyerIdentity: {
      countryCode: 'US',
      deliveryAddressPreferences: [
        { deliveryAddress: { country: 'US', province: 'AK' } },
      ],
    },
  }

  let data: CartCreateResult
  try {
    data = await cartCreate(alaskaInput)
    if (cartCreateFailed(data)) {
      data = await cartCreate(baseInput)
    }
  } catch {
    data = await cartCreate(baseInput)
  }

  const userErrors = data?.cartCreate?.userErrors || []
  if (userErrors.length) {
    throw new Error(userErrors[0].message || 'Could not create cart')
  }

  const cart = data?.cartCreate?.cart
  if (!cart?.checkoutUrl) throw new Error('No checkout URL returned from Shopify')

  const returnUrl = `${window.location.origin}/order-success`
  const checkoutUrl = `${cart.checkoutUrl}?return_url=${encodeURIComponent(returnUrl)}`

  return {
    url: checkoutUrl,
    id: cart.id,
    total: cart.cost?.totalAmount?.amount,
    currency: cart.cost?.totalAmount?.currencyCode,
  }
}
