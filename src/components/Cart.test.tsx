import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import Cart from './Cart'
import { CartProvider } from '../contexts/CartContext'

const renderWithCartProvider = (ui: React.ReactElement) => {
  return render(<CartProvider>{ui}</CartProvider>)
}

describe('Cart', () => {
  const mockOnClose = vi.fn()
  const mockOnCheckout = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not render when isOpen is false', () => {
    renderWithCartProvider(
      <Cart isOpen={false} onClose={mockOnClose} onCheckout={mockOnCheckout} />
    )

    expect(screen.queryByText('Carrito de Compras')).not.toBeInTheDocument()
  })

  it('renders when isOpen is true', () => {
    renderWithCartProvider(
      <Cart isOpen={true} onClose={mockOnClose} onCheckout={mockOnCheckout} />
    )

    expect(screen.getByText('Carrito de Compras')).toBeInTheDocument()
  })

  it('shows empty cart message when no items', () => {
    renderWithCartProvider(
      <Cart isOpen={true} onClose={mockOnClose} onCheckout={mockOnCheckout} />
    )

    expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    renderWithCartProvider(
      <Cart isOpen={true} onClose={mockOnClose} onCheckout={mockOnCheckout} />
    )

    const closeButton = screen.getByText('×')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when overlay is clicked', () => {
    renderWithCartProvider(
      <Cart isOpen={true} onClose={mockOnClose} onCheckout={mockOnCheckout} />
    )

    const overlay = screen.getByText('Carrito de Compras').closest('.cart-overlay')
    fireEvent.click(overlay!)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })
})