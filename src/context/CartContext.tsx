import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { createCheckout } from '../lib/shopify'
import {
  type CartItem,
  cartCount as countItems,
  cartTotal as sumItems,
  loadCart,
  mergeCartItem,
  saveCart,
} from '../lib/cart'

interface CartContextValue {
  cart: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQty: (variantId: string, delta: number) => void
  clearCart: () => void
  cartCount: number
  cartTotal: number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  cartAnimating: boolean
  bumpCart: () => void
  orderNote: string
  setOrderNote: (note: string) => void
  isCheckingOut: boolean
  checkoutError: string | null
  handleCheckout: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [cart, setCart] = useState<CartItem[]>(() => loadCart())
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartAnimating, setCartAnimating] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [orderNote, setOrderNote] = useState('')

  useEffect(() => {
    saveCart(cart)
  }, [cart])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('open_cart') === '1') {
      setCart(loadCart())
      setIsCartOpen(true)
      params.delete('open_cart')
      const next = params.toString()
      const url = `${location.pathname}${next ? `?${next}` : ''}${location.hash}`
      window.history.replaceState({}, '', url)
    }
  }, [location.pathname, location.search, location.hash])

  const bumpCart = useCallback(() => {
    setCartAnimating(true)
    window.setTimeout(() => setCartAnimating(false), 1200)
  }, [])

  const addItem = useCallback((item: CartItem) => {
    setCart(prev => mergeCartItem(prev, item))
    bumpCart()
    setIsCartOpen(true)
  }, [bumpCart])

  const removeItem = useCallback((variantId: string) => {
    setCart(prev => prev.filter(i => i.variantId !== variantId))
  }, [])

  const updateQty = useCallback((variantId: string, delta: number) => {
    setCart(prev =>
      prev.map(i =>
        i.variantId === variantId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
      )
    )
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const handleCheckout = useCallback(async () => {
    if (!cart.length) return
    setIsCheckingOut(true)
    setCheckoutError(null)
    try {
      const checkout = await createCheckout(cart, orderNote)
      window.location.href = checkout.url
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Checkout failed. Please try again.'
      setCheckoutError(msg)
      setIsCheckingOut(false)
    }
  }, [cart, orderNote])

  const value = useMemo<CartContextValue>(() => ({
    cart,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    cartCount: countItems(cart),
    cartTotal: sumItems(cart),
    isCartOpen,
    setIsCartOpen,
    cartAnimating,
    bumpCart,
    orderNote,
    setOrderNote,
    isCheckingOut,
    checkoutError,
    handleCheckout,
  }), [
    cart, addItem, removeItem, updateQty, clearCart,
    isCartOpen, cartAnimating, bumpCart, orderNote,
    isCheckingOut, checkoutError, handleCheckout,
  ])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
