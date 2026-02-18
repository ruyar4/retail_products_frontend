import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import App from './App'

vi.mock('./ProductCatalog', () => ({
  default: () => <div data-testid="product-catalog">Product Catalog Component</div>
}))

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByTestId('product-catalog')).toBeInTheDocument()
  })

  it('has the correct app wrapper class', () => {
    const { container } = render(<App />)
    const appElement = container.querySelector('.app')
    expect(appElement).toBeInTheDocument()
  })

  it('renders ProductCatalog component', () => {
    render(<App />)
    expect(screen.getByTestId('product-catalog')).toBeInTheDocument()
  })
})