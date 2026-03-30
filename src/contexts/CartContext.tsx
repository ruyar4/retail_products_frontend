import { createContext, useContext, useReducer, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { CartState, Product, Cart, Promotion } from '../types/cart'
import { cartService } from '../services/cartService'

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART'; payload: Cart }
  | { type: 'SET_PROMOTIONS'; payload: Promotion[] }
  | { type: 'CLEAR_CART' }

interface CartContextType {
  state: CartState
  addItem: (product: Product, quantity?: number) => Promise<void>
  removeItem: (productId: number) => Promise<void>
  updateQuantity: (productId: number, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  applyPromotion: (promotionCode: string) => Promise<void>
  removePromotion: () => Promise<void>
  loadCart: () => Promise<void>
  loadPromotions: () => Promise<void>
  mergeCart: (userId: string) => Promise<void>
  setUserId: (userId: string | null) => void
  userId: string | null
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }

    case 'SET_CART':
      return { ...state, cart: action.payload, loading: false, error: null }

    case 'SET_PROMOTIONS':
      return { ...state, promotions: action.payload }

    case 'CLEAR_CART':
      return { ...state, cart: null, loading: false, error: null }

    default:
      return state
  }
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    cart: null,
    loading: false,
    error: null,
    promotions: []
  })

  const [userId, setUserIdState] = useReducer((prev: string | null, action: string | null) => action, null)

  useEffect(() => {
    loadCart()
    loadPromotions()
  }, [])

  const loadCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const cart = await cartService.getCart(userId || undefined)
      dispatch({ type: 'SET_CART', payload: cart })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load cart' })
    }
  }

  const loadPromotions = async () => {
    try {
      const promotions = await cartService.getAvailablePromotions()
      dispatch({ type: 'SET_PROMOTIONS', payload: promotions })
    } catch (error) {
      console.error('Failed to load promotions:', error)
    }
  }

  const addItem = async (product: Product, quantity: number = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const cart = await cartService.addToCart(
        { productId: product.id, quantity },
        userId || undefined
      )
      dispatch({ type: 'SET_CART', payload: cart })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add item' })
    }
  }

  const removeItem = async (productId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const cart = await cartService.removeFromCart(
        { productId },
        userId || undefined
      )
      dispatch({ type: 'SET_CART', payload: cart })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to remove item' })
    }
  }

  const updateQuantity = async (productId: number, quantity: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const cart = await cartService.updateCartItem(
        { productId, quantity },
        userId || undefined
      )
      dispatch({ type: 'SET_CART', payload: cart })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update quantity' })
    }
  }

  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      await cartService.clearCart(userId || undefined)
      dispatch({ type: 'CLEAR_CART' })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to clear cart' })
    }
  }

  const applyPromotion = async (promotionCode: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const cart = await cartService.applyPromotionCode(
        { promotionCode },
        userId || undefined
      )
      dispatch({ type: 'SET_CART', payload: cart })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to apply promotion' })
    }
  }

  const removePromotion = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const cart = await cartService.removePromotionCode(userId || undefined)
      dispatch({ type: 'SET_CART', payload: cart })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to remove promotion' })
    }
  }

  const mergeCart = async (newUserId: string) => {
    try {
      await cartService.mergeSessionCartToUser(newUserId)
      setUserIdState(newUserId)
      await loadCart()
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to merge cart' })
    }
  }

  const setUserId = (newUserId: string | null) => {
    setUserIdState(newUserId)
    if (newUserId) {
      mergeCart(newUserId)
    }
  }

  return (
    <CartContext.Provider value={{
      state,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      applyPromotion,
      removePromotion,
      loadCart,
      loadPromotions,
      mergeCart,
      setUserId,
      userId
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}