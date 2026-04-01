const SHOPIFY_DOMAIN = 'hartboysskateshop.myshopify.com'
const STOREFRONT_TOKEN = '6a847ae6b35f84a2972c46073e123dba'
const GRAPHQL_URL = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`

interface Product {
  id: string
  title: string
  description: string
  handle: string
  productType: string
  vendor: string
  tags: string[]
  totalInventory: number
  createdAt: string
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string }
  }
  images: {
    edges: Array<{ node: { url: string; altText: string } }>
  }
  variants: {
    edges: Array<{
      node: {
        id: string
        title: string
        availableForSale: boolean
        quantityAvailable: number
      }
    }>
  }
}

interface LineItem {
  variantId: string
  quantity: number
}

export async function getProducts(): Promise<Product[]> {
  const allProducts: Product[] = []
  let hasNextPage = true
  let cursor: string | null = null
  let page = 0

  console.log('🚀 Fetching all products (newest first)...')

  while (hasNextPage) {
    page++

    // sortKey: CREATED_AT + reverse: true → newest products arrive first from the API
    const query = `
      query GetProducts($cursor: String) {
        products(first: 250, after: $cursor, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              title
              description
              handle
              productType
              vendor
              tags
              totalInventory
              createdAt
              priceRange {
                minVariantPrice { amount currencyCode }
              }
              images(first: 10) {
                edges { node { url altText } }
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    availableForSale
                    quantityAvailable
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `

    const variables = cursor ? { cursor } : {}
    
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN
      },
      body: JSON.stringify({ query, variables })
    })
    
    const data = await response.json()
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors)
      break
    }
    
    const edges = data.data?.products?.edges || []
    const pageInfo = data.data?.products?.pageInfo
    
    allProducts.push(...edges.map((e: any) => e.node))
    
    hasNextPage = pageInfo?.hasNextPage || false
    cursor = pageInfo?.endCursor || null
    
    console.log(`✅ Page ${page}: ${edges.length} products (Total: ${allProducts.length}) | hasNextPage: ${hasNextPage}`)
    
    if (page >= 10) break
    if (hasNextPage) await new Promise(r => setTimeout(r, 150))
  }
  
  console.log(`🎉 DONE: ${allProducts.length} products from ${page} pages`)
  return allProducts
}

export async function createCheckout(lineItems: LineItem[]) {
  if (!lineItems?.length) throw new Error('Cart empty')

  // Build return URL so Shopify's "Return to store" link brings customers back
  const returnUrl = `${window.location.origin}/shop?checkout_cancelled=1`

  const query = `
    mutation($input: CheckoutCreateInput!) {
      checkoutCreate(input: $input) {
        checkout {
          id
          webUrl
          totalPrice { amount currencyCode }
        }
        checkoutUserErrors { field message code }
      }
    }
  `

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN
    },
    body: JSON.stringify({
      query,
      variables: {
        input: {
          lineItems: lineItems.map((i: LineItem) => ({
            variantId: i.variantId,
            quantity: i.quantity
          }))
        }
      }
    })
  })

  const data = await response.json()

  // Handle GraphQL-level errors
  if (data.errors?.length) {
    throw new Error(data.errors[0].message || 'Checkout request failed')
  }

  const checkoutUserErrors = data.data?.checkoutCreate?.checkoutUserErrors || []
  if (checkoutUserErrors.length) {
    throw new Error(checkoutUserErrors[0].message || 'Could not create checkout')
  }

  const checkout = data.data?.checkoutCreate?.checkout
  if (!checkout?.webUrl) throw new Error('No checkout URL returned from Shopify')

  // Append return URL so Shopify's "Return to store" link works
  const checkoutUrl = `${checkout.webUrl}&return_to=${encodeURIComponent(returnUrl)}`

  return {
    url: checkoutUrl,
    id: checkout.id,
    total: checkout.totalPrice?.amount,
    currency: checkout.totalPrice?.currencyCode,
  }
}
