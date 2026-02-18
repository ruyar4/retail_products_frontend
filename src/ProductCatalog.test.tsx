import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest'
import ProductCatalog from './ProductCatalog'

const mockProducts = {
  content: [
    {
      id: 1,
      name: 'Test Product 1',
      description: 'Test Description 1',
      price: 99.99,
      brand: { id: 1, name: 'Brand A' },
      category: { id: 1, name: 'Category A' }
    },
    {
      id: 2,
      name: 'Test Product 2',
      description: 'Test Description 2',
      price: 149.99,
      brand: { id: 2, name: 'Brand B' },
      category: { id: 2, name: 'Category B' }
    }
  ],
  totalPages: 2,
  totalElements: 2,
  first: true,
  last: false,
  size: 12,
  number: 0
}

const mockAllProducts = {
  content: [
    ...mockProducts.content,
    {
      id: 3,
      name: 'Test Product 3',
      description: 'Test Description 3',
      price: 199.99,
      brand: { id: 3, name: 'Brand C' },
      category: { id: 3, name: 'Category C' }
    }
  ],
  totalPages: 1,
  totalElements: 3,
  first: true,
  last: true,
  size: 1000,
  number: 0
}

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('ProductCatalog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('renders loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}))
    render(<ProductCatalog />)
    expect(screen.getByText('Cargando productos...')).toBeInTheDocument()
  })

  it('renders products after successful fetch', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProducts),
    })

    render(<ProductCatalog />)

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    }, { timeout: 3000 })

    expect(screen.getByText('Test Product 2')).toBeInTheDocument()
    expect(screen.getByText('$99.99')).toBeInTheDocument()
    expect(screen.getByText('$149.99')).toBeInTheDocument()
    expect(screen.getAllByText('Brand A')).toHaveLength(2)
    expect(screen.getAllByText('Category A')).toHaveLength(2)
  })

  it('renders error state when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    render(<ProductCatalog />)

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument()
    })
  })

  it('renders error state when response is not ok', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
    })

    render(<ProductCatalog />)

    await waitFor(() => {
      expect(screen.getByText('Error: Error al cargar los productos')).toBeInTheDocument()
    })
  })

  it('displays correct page information', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProducts),
    })

    render(<ProductCatalog />)

    await waitFor(() => {
      expect(screen.getByText('Página 1 de 2')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('handles pagination correctly', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProducts),
    })

    render(<ProductCatalog />)

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    }, { timeout: 3000 })

    const nextButton = screen.getByText('Siguiente')
    expect(nextButton).not.toBeDisabled()

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ...mockProducts, number: 1, first: false, last: true }),
    })

    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=1')
      )
    })
  })

  it('disables previous button on first page', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProducts),
    })

    render(<ProductCatalog />)

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    }, { timeout: 3000 })

    const previousButton = screen.getByText('Anterior')
    expect(previousButton).toBeDisabled()
  })

  it('handles filter changes correctly', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProducts),
    })

    render(<ProductCatalog />)

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    }, { timeout: 3000 })

    const minPriceInput = screen.getByPlaceholderText('Precio Mínimo')
    fireEvent.change(minPriceInput, { target: { value: '50' } })

    await waitFor(() => {
      expect(minPriceInput).toHaveValue(50)
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('minPrice=50')
      )
    }, { timeout: 3000 })
  })

  it('clears filters when clear button is clicked', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProducts),
    })

    render(<ProductCatalog />)

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    }, { timeout: 3000 })

    const minPriceInput = screen.getByPlaceholderText('Precio Mínimo')
    fireEvent.change(minPriceInput, { target: { value: '50' } })

    await waitFor(() => {
      expect(minPriceInput).toHaveValue(50)
    })

    const clearButton = screen.getByText('Limpiar Filtros')
    fireEvent.click(clearButton)

    await waitFor(() => {
      const freshInput = screen.getByPlaceholderText('Precio Mínimo')
      expect(freshInput.getAttribute('value')).toBe('')
    }, { timeout: 2000 })
  })

  it('handles sort changes correctly', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProducts),
    })

    render(<ProductCatalog />)

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    }, { timeout: 3000 })

    const sortSelect = screen.getByDisplayValue('Nombre (A-Z)')
    await user.selectOptions(sortSelect, 'price:asc')

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('sortBy=price&sortDirection=asc')
      )
    })
  })

  it('populates brand and category filters correctly', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProducts),
    })

    render(<ProductCatalog />)

    await waitFor(() => {
      expect(screen.getAllByText('Brand A')).toHaveLength(2)
    }, { timeout: 3000 })

    const brandSelect = screen.getByDisplayValue('Todas las Marcas')
    expect(brandSelect).toBeInTheDocument()

    const categorySelect = screen.getByDisplayValue('Todas las Categorías')
    expect(categorySelect).toBeInTheDocument()
  })

  it('builds query string correctly', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProducts),
    })

    render(<ProductCatalog />)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenNthCalledWith(1,
        expect.stringContaining('page=0&size=12&sortBy=name&sortDirection=asc')
      )
    })
  })
})