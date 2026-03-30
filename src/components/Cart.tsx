import { useState } from 'react'
import { useCart } from '../contexts/CartContext'

interface CartProps {
  isOpen: boolean
  onClose: () => void
  onCheckout: () => void
}

const Cart = ({ isOpen, onClose, onCheckout }: CartProps) => {
  const { state, removeItem, updateQuantity, applyPromotion, removePromotion, clearCart } = useCart()
  const [promotionCode, setPromotionCode] = useState('')
  const [isApplyingPromotion, setIsApplyingPromotion] = useState(false)

  if (!isOpen) return null

  const handleQuantityChange = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeItem(productId)
    } else {
      await updateQuantity(productId, newQuantity)
    }
  }

  const handleCheckout = () => {
    onCheckout()
    onClose()
  }

  const handleApplyPromotion = async () => {
    if (!promotionCode.trim()) return

    setIsApplyingPromotion(true)
    try {
      await applyPromotion(promotionCode)
      setPromotionCode('')
    } catch (error) {
      console.error('Failed to apply promotion:', error)
    } finally {
      setIsApplyingPromotion(false)
    }
  }

  const handleRemovePromotion = async () => {
    await removePromotion()
  }

  const handleClearCart = async () => {
    if (window.confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      await clearCart()
    }
  }

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-container" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Carrito de Compras</h2>
          <button className="cart-close" onClick={onClose}>×</button>
        </div>

        {state.error && (
          <div className="cart-error">
            <p>Error: {state.error}</p>
          </div>
        )}

        <div className="cart-content">
          {state.loading && (
            <div className="cart-loading">
              <p>Cargando...</p>
            </div>
          )}

          {!state.cart || state.cart.items.length === 0 ? (
            <div className="cart-empty">
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="cart-items">
              {state.cart.items.map((item) => (
                <div key={`${item.productId}-${item.id}`} className="cart-item">
                  <div className="cart-item-info">
                    <h4>{item.productName}</h4>
                    <p className="cart-item-price">${item.productPrice.toFixed(2)}</p>
                  </div>
                  <div className="cart-item-controls">
                    <div className="quantity-controls">
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        className="quantity-btn"
                        disabled={state.loading}
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        className="quantity-btn"
                        disabled={state.loading}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="remove-btn"
                      disabled={state.loading}
                    >
                      Eliminar
                    </button>
                  </div>
                  <div className="cart-item-subtotal">
                    ${item.subtotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {state.cart && state.cart.items.length > 0 && (
          <div className="cart-footer">
            <div className="promotion-section">
              <div className="promotion-input">
                <input
                  type="text"
                  placeholder="Código de promoción"
                  value={promotionCode}
                  onChange={(e) => setPromotionCode(e.target.value)}
                  disabled={isApplyingPromotion || state.loading}
                />
                <button
                  onClick={handleApplyPromotion}
                  disabled={!promotionCode.trim() || isApplyingPromotion || state.loading}
                  className="apply-promotion-btn"
                >
                  {isApplyingPromotion ? 'Aplicando...' : 'Aplicar'}
                </button>
              </div>

              {state.cart.appliedPromotionCode && (
                <div className="applied-promotion">
                  <span>Promoción aplicada: {state.cart.appliedPromotionCode}</span>
                  <button
                    onClick={handleRemovePromotion}
                    disabled={state.loading}
                    className="remove-promotion-btn"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="cart-summary">
              <div className="cart-totals">
                <div className="subtotal">
                  Subtotal: ${state.cart.subtotal.toFixed(2)}
                </div>
                {state.cart.discountAmount > 0 && (
                  <div className="discount">
                    Descuento: -${state.cart.discountAmount.toFixed(2)}
                  </div>
                )}
                <div className="cart-total">
                  <strong>Total: ${state.cart.total.toFixed(2)}</strong>
                </div>
              </div>

              <div className="cart-actions">
                <button
                  className="clear-cart-btn"
                  onClick={handleClearCart}
                  disabled={state.loading}
                >
                  Vaciar Carrito
                </button>
                <button className="continue-shopping" onClick={onClose}>
                  Continuar Comprando
                </button>
                <button
                  className="checkout-btn"
                  onClick={handleCheckout}
                  disabled={state.loading}
                >
                  Proceder al Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart