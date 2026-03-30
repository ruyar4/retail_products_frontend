const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081'

export interface AddToCartRequest {
  productId: number
  quantity: number
}

export interface RemoveFromCartRequest {
  productId: number
}

export interface UpdateCartItemRequest {
  productId: number
  quantity: number
}

export interface ApplyPromotionRequest {
  promotionCode: string
}

export interface CartItem {
  id: number
  productId: number
  productName: string
  productPrice: number
  quantity: number
  subtotal: number
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

class CartService {
  private getHeaders(userId?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (userId) {
      headers['X-User-ID'] = userId
    }
    return headers
  }

  async getCart(userId?: string): Promise<Cart> {
    const response = await fetch(`${API_BASE_URL}/api/cart`, {
      method: 'GET',
      headers: this.getHeaders(userId),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Failed to get cart: ${response.statusText}`)
    }

    return response.json()
  }

  async addToCart(request: AddToCartRequest, userId?: string): Promise<Cart> {
    const response = await fetch(`${API_BASE_URL}/api/cart/add`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      credentials: 'include',
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`Failed to add to cart: ${response.statusText}`)
    }

    return response.json()
  }

  async removeFromCart(request: RemoveFromCartRequest, userId?: string): Promise<Cart> {
    const response = await fetch(`${API_BASE_URL}/api/cart/remove`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      credentials: 'include',
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`Failed to remove from cart: ${response.statusText}`)
    }

    return response.json()
  }

  async updateCartItem(request: UpdateCartItemRequest, userId?: string): Promise<Cart> {
    const response = await fetch(`${API_BASE_URL}/api/cart/update`, {
      method: 'PUT',
      headers: this.getHeaders(userId),
      credentials: 'include',
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`Failed to update cart item: ${response.statusText}`)
    }

    return response.json()
  }

  async clearCart(userId?: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/cart/clear`, {
      method: 'DELETE',
      headers: this.getHeaders(userId),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Failed to clear cart: ${response.statusText}`)
    }
  }

  async mergeSessionCartToUser(userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/cart/merge`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Failed to merge cart: ${response.statusText}`)
    }
  }

  async applyPromotionCode(request: ApplyPromotionRequest, userId?: string): Promise<Cart> {
    const response = await fetch(`${API_BASE_URL}/api/cart/apply-promotion`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      credentials: 'include',
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('Invalid promotion code')
      }
      throw new Error(`Failed to apply promotion: ${response.statusText}`)
    }

    return response.json()
  }

  async removePromotionCode(userId?: string): Promise<Cart> {
    const response = await fetch(`${API_BASE_URL}/api/cart/remove-promotion`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Failed to remove promotion: ${response.statusText}`)
    }

    return response.json()
  }

  async applyAutomaticDiscounts(userId?: string): Promise<Cart> {
    const response = await fetch(`${API_BASE_URL}/api/cart/apply-auto-discounts`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Failed to apply automatic discounts: ${response.statusText}`)
    }

    return response.json()
  }

  async getAvailablePromotions(): Promise<Promotion[]> {
    const response = await fetch(`${API_BASE_URL}/api/cart/available-promotions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get promotions: ${response.statusText}`)
    }

    return response.json()
  }

  async getProductDiscounts(productId: number): Promise<ProductDiscount[]> {
    const response = await fetch(`${API_BASE_URL}/api/cart/product-discounts/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get product discounts: ${response.statusText}`)
    }

    return response.json()
  }
}

export const cartService = new CartService()