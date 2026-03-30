export interface CartItem {
  id: number
  productId: number
  productName: string
  productPrice: number
  quantity: number
  subtotal: number
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  brand: {
    id: number
    name: string
  }
  category: {
    id: number
    name: string
  }
}

export interface Promotion {
  id: number
  code: string
  description: string
  discountPercentage?: number
  discountAmount?: number
  minimumAmount?: number
  validUntil: string
  active: boolean
}

export interface ProductDiscount {
  id: number
  productId: number
  discountPercentage?: number
  discountAmount?: number
  description: string
  validUntil: string
  active: boolean
}

export interface Cart {
  id: string
  sessionId?: string
  userId?: string
  items: CartItem[]
  subtotal: number
  discountAmount: number
  total: number
  appliedPromotionCode?: string
  createdAt: string
  updatedAt: string
}

export interface CartState {
  cart: Cart | null
  loading: boolean
  error: string | null
  promotions: Promotion[]
}

export interface CheckoutForm {
  email: string
  firstName: string
  lastName: string
  address: string
  city: string
  postalCode: string
  country: string
  paymentMethod: 'credit' | 'debit' | 'paypal'
  cardNumber?: string
  expiryDate?: string
  cvv?: string
}