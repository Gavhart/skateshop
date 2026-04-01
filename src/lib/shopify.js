const SHOPIFY_DOMAIN = 'hartboysskateshop.myshopify.com'
const STOREFRONT_TOKEN = '6a847ae6b35f84a2972c46073e123dba'
const GRAPHQL_URL = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`

async function fetchAllProducts() {
  let allProducts = []
  let hasNextPage = true
  let cursor = null

  while (hasNextPage) {
    const query = `
      {
        products(first: 100${cursor ? `, after: "${cursor}"` : ''}) {
          edges {
            node {
              id
              title
              handle
              description
              productType
              tags
              vendor
              priceRange {
                minVariantPrice { amount currencyCode }
              }
              images(first: 1) {
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
            cursor
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    `

    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN
      },
      body: JSON.stringify({ query })
    })

    const data = await response.json()

    if (data.errors) {
      console.error('Shopify errors:', data.errors)
      break
    }

    const edges = data.data?.products?.edges || []
    allProducts.push(...edges.map(e => e.node))

    hasNextPage = data.data?.products?.pageInfo?.hasNextPage
    cursor = edges.at(-1)?.cursor

    console.log(`Fetched ${allProducts.length} products...`)
  }

  return allProducts
}

export async function getProducts() {
  return fetchAllProducts()
}

export async function createCheckout(lineItems) {
  const query = `
    mutation checkoutCreate($input: CheckoutCreateInput!) {
      checkoutCreate(input: $input) {
        checkout { id webUrl }
        checkoutUserErrors { message }
      }
    }
  `

  const variables = {
    input: {
      lineItems: lineItems.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity
      }))
    }
  }

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN
    },
    body: JSON.stringify({ query, variables })
  })

  const data = await response.json()
  return data.data?.checkoutCreate?.checkout?.webUrl
}