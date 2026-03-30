import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { CartProvider, useCart } from './CartContext'
import type { ReactNode } from 'react'

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
)

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('initializes with empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    expect(result.current.state.items).toEqual([])
    expect(result.current.state.total).toBe(0)
    expect(result.current.state.itemCount).toBe(0)
  })

  it('adds item to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    const testProduct = {
      id: 1,
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      brand: { id: 1, name: 'Test Brand' },
      category: { id: 1, name: 'Test Category' }
    }

    act(() => {
      result.current.addItem(testProduct)
    })

    expect(result.current.state.items).toHaveLength(1)
    expect(result.current.state.items[0].name).toBe('Test Product')
    expect(result.current.state.items[0].quantity).toBe(1)
    expect(result.current.state.total).toBe(99.99)
    expect(result.current.state.itemCount).toBe(1)
  })

  it('increases quantity when adding existing item', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    const testProduct = {
      id: 1,
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      brand: { id: 1, name: 'Test Brand' },
      category: { id: 1, name: 'Test Category' }
    }

    act(() => {
      result.current.addItem(testProduct)
      result.current.addItem(testProduct)
    })

    expect(result.current.state.items).toHaveLength(1)
    expect(result.current.state.items[0].quantity).toBe(2)
    expect(result.current.state.total).toBe(199.98)
    expect(result.current.state.itemCount).toBe(2)
  })

  it('removes item from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    const testProduct = {
      id: 1,
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      brand: { id: 1, name: 'Test Brand' },
      category: { id: 1, name: 'Test Category' }
    }

    act(() => {
      result.current.addItem(testProduct)
      result.current.removeItem(1)
    })

    expect(result.current.state.items).toHaveLength(0)
    expect(result.current.state.total).toBe(0)
    expect(result.current.state.itemCount).toBe(0)
  })

  it('updates item quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    const testProduct = {
      id: 1,
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      brand: { id: 1, name: 'Test Brand' },
      category: { id: 1, name: 'Test Category' }
    }

    act(() => {
      result.current.addItem(testProduct)
      result.current.updateQuantity(1, 5)
    })

    expect(result.current.state.items[0].quantity).toBe(5)
    expect(result.current.state.total).toBe(499.95)
    expect(result.current.state.itemCount).toBe(5)
  })

  it('removes item when quantity is set to 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    const testProduct = {
      id: 1,
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      brand: { id: 1, name: 'Test Brand' },
      category: { id: 1, name: 'Test Category' }
    }

    act(() => {
      result.current.addItem(testProduct)
      result.current.updateQuantity(1, 0)
    })

    expect(result.current.state.items).toHaveLength(0)
    expect(result.current.state.total).toBe(0)
    expect(result.current.state.itemCount).toBe(0)
  })

  it('clears cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    const testProduct = {
      id: 1,
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      brand: { id: 1, name: 'Test Brand' },
      category: { id: 1, name: 'Test Category' }
    }

    act(() => {
      result.current.addItem(testProduct)
      result.current.clearCart()
    })

    expect(result.current.state.items).toHaveLength(0)
    expect(result.current.state.total).toBe(0)
    expect(result.current.state.itemCount).toBe(0)
  })
})