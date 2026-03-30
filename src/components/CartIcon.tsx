import { useCart } from '../contexts/CartContext'

interface CartIconProps {
  onClick: () => void
}

const CartIcon = ({ onClick }: CartIconProps) => {
  const { state } = useCart()

  const itemCount = state.cart?.items.reduce((total, item) => total + item.quantity, 0) || 0

  return (
    <button className="cart-icon" onClick={onClick}>
      <span className="cart-symbol">🛒</span>
      {itemCount > 0 && (
        <span className="cart-badge">{itemCount}</span>
      )}
    </button>
  )
}

export default CartIcon