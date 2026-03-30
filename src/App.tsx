import { useState } from 'react'
import ProductCatalog from './ProductCatalog'
import Cart from './components/Cart'
import CartIcon from './components/CartIcon'
import Checkout from './components/Checkout'
import { CartProvider } from './contexts/CartContext'
import './ProductCatalog.css'

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const handleOpenCart = () => {
    setIsCartOpen(true)
  }

  const handleCloseCart = () => {
    setIsCartOpen(false)
  }

  const handleOpenCheckout = () => {
    setIsCheckoutOpen(true)
  }

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false)
  }

  return (
    <CartProvider>
      <div className="app">
        <header className="app-header">
          <h1>Catálogo de Productos</h1>
          <CartIcon onClick={handleOpenCart} />
        </header>
        <main className="app-main">
          <ProductCatalog />
        </main>
        <Cart
          isOpen={isCartOpen}
          onClose={handleCloseCart}
          onCheckout={handleOpenCheckout}
        />
        <Checkout
          isOpen={isCheckoutOpen}
          onClose={handleCloseCheckout}
        />
      </div>
    </CartProvider>
  )
}

export default App
