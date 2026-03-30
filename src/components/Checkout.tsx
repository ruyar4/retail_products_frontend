import { useState } from 'react'
import { useCart } from '../contexts/CartContext'
import type { CheckoutForm } from '../types/cart'

interface CheckoutProps {
  isOpen: boolean
  onClose: () => void
}

const Checkout = ({ isOpen, onClose }: CheckoutProps) => {
  const { state, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [formData, setFormData] = useState<CheckoutForm>({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    paymentMethod: 'credit',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  })

  const [errors, setErrors] = useState<Partial<CheckoutForm>>({})

  if (!isOpen) return null

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutForm> = {}

    if (!formData.email) newErrors.email = 'Email es requerido'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido'

    if (!formData.firstName) newErrors.firstName = 'Nombre es requerido'
    if (!formData.lastName) newErrors.lastName = 'Apellido es requerido'
    if (!formData.address) newErrors.address = 'Dirección es requerida'
    if (!formData.city) newErrors.city = 'Ciudad es requerida'
    if (!formData.postalCode) newErrors.postalCode = 'Código postal es requerido'
    if (!formData.country) newErrors.country = 'País es requerido'

    if (formData.paymentMethod !== 'paypal') {
      if (!formData.cardNumber) newErrors.cardNumber = 'Número de tarjeta es requerido'
      else if (formData.cardNumber.replace(/\s/g, '').length < 13) newErrors.cardNumber = 'Número de tarjeta inválido'

      if (!formData.expiryDate) newErrors.expiryDate = 'Fecha de expiración es requerida'
      else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) newErrors.expiryDate = 'Formato inválido (MM/YY)'

      if (!formData.cvv) newErrors.cvv = 'CVV es requerido'
      else if (formData.cvv.length < 3) newErrors.cvv = 'CVV inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsProcessing(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      clearCart()
      setOrderComplete(true)
    } catch (error) {
      console.error('Error processing order:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setOrderComplete(false)
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      paymentMethod: 'credit',
      cardNumber: '',
      expiryDate: '',
      cvv: ''
    })
    setErrors({})
    onClose()
  }

  if (orderComplete) {
    return (
      <div className="checkout-overlay" onClick={handleClose}>
        <div className="checkout-container" onClick={(e) => e.stopPropagation()}>
          <div className="order-success">
            <h2>¡Pedido Realizado!</h2>
            <p>Tu pedido ha sido procesado exitosamente.</p>
            <p>Recibirás un email de confirmación pronto.</p>
            <button className="success-btn" onClick={handleClose}>
              Continuar Comprando
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-overlay" onClick={onClose}>
      <div className="checkout-container" onClick={(e) => e.stopPropagation()}>
        <div className="checkout-header">
          <h2>Checkout</h2>
          <button className="checkout-close" onClick={onClose}>×</button>
        </div>

        <div className="checkout-content">
          <div className="checkout-summary">
            <h3>Resumen del Pedido</h3>
            <div className="summary-items">
              {state.items.map(item => (
                <div key={item.id} className="summary-item">
                  <span className="item-name">{item.name} × {item.quantity}</span>
                  <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="summary-total">
              <strong>Total: ${state.total.toFixed(2)}</strong>
            </div>
          </div>

          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Información Personal</h3>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={errors.firstName ? 'error' : ''}
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label>Apellido</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={errors.lastName ? 'error' : ''}
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Dirección de Envío</h3>
              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={errors.address ? 'error' : ''}
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ciudad</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={errors.city ? 'error' : ''}
                  />
                  {errors.city && <span className="error-message">{errors.city}</span>}
                </div>
                <div className="form-group">
                  <label>Código Postal</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className={errors.postalCode ? 'error' : ''}
                  />
                  {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>País</label>
                <select
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className={errors.country ? 'error' : ''}
                >
                  <option value="">Seleccionar país</option>
                  <option value="ES">España</option>
                  <option value="MX">México</option>
                  <option value="AR">Argentina</option>
                  <option value="CO">Colombia</option>
                  <option value="CL">Chile</option>
                  <option value="PE">Perú</option>
                  <option value="VE">Venezuela</option>
                </select>
                {errors.country && <span className="error-message">{errors.country}</span>}
              </div>
            </div>

            <div className="form-section">
              <h3>Información de Pago</h3>
              <div className="form-group">
                <label>Método de Pago</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value as 'credit' | 'debit' | 'paypal')}
                >
                  <option value="credit">Tarjeta de Crédito</option>
                  <option value="debit">Tarjeta de Débito</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              {formData.paymentMethod !== 'paypal' && (
                <>
                  <div className="form-group">
                    <label>Número de Tarjeta</label>
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className={errors.cardNumber ? 'error' : ''}
                    />
                    {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Fecha de Expiración</label>
                      <input
                        type="text"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                        className={errors.expiryDate ? 'error' : ''}
                      />
                      {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="text"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                        maxLength={4}
                        className={errors.cvv ? 'error' : ''}
                      />
                      {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="checkout-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancelar
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={isProcessing}
              >
                {isProcessing ? 'Procesando...' : 'Realizar Pedido'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Checkout