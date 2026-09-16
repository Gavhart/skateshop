export interface CartItem {
  variantId: string
  title: string
  vendor?: string
  variantTitle?: string
  price: string
  image?: string
  quantity: number
  productType?: string
}

export const CART_STORAGE_KEY = 'hb_cart'
export const ORDER_NOTE_KEY = 'hb_order_note'

export function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveCart(cart: CartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  } catch {
    /* ignore quota / private mode */
  }
}

export function mergeCartItem(cart: CartItem[], item: CartItem): CartItem[] {
  const exists = cart.find(i => i.variantId === item.variantId)
  if (exists) {
    return cart.map(i =>
      i.variantId === item.variantId
        ? { ...i, quantity: i.quantity + item.quantity }
        : i
    )
  }
  return [...cart, item]
}

export function mergeCartItems(cart: CartItem[], items: CartItem[]): CartItem[] {
  return items.reduce((acc, item) => mergeCartItem(acc, item), cart)
}

export function cartCount(cart: CartItem[]) {
  return cart.reduce((s, i) => s + i.quantity, 0)
}

export function cartTotal(cart: CartItem[]) {
  return cart.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0)
}
