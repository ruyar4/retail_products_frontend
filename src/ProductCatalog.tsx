import { useState, useEffect } from 'react'

interface Brand {
  id: number
  name: string
}

interface Category {
  id: number
  name: string
}

interface Product {
  id: number
  name: string
  description: string
  price: number
  brand: Brand
  category: Category
}

interface ApiResponse {
  content: Product[]
  totalPages: number
  totalElements: number
  first: boolean
  last: boolean
  size: number
  number: number
}

interface Filters {
  minPrice: string
  maxPrice: string
  brand: string
  category: string
}

interface SortOption {
  field: string
  direction: 'asc' | 'desc'
  label: string
}

const ProductCatalog = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filters, setFilters] = useState<Filters>({
    minPrice: '',
    maxPrice: '',
    brand: '',
    category: ''
  })
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const sortOptions: SortOption[] = [
    { field: 'name', direction: 'asc', label: 'Nombre (A-Z)' },
    { field: 'name', direction: 'desc', label: 'Nombre (Z-A)' },
    { field: 'price', direction: 'asc', label: 'Precio (Menor a Mayor)' },
    { field: 'price', direction: 'desc', label: 'Precio (Mayor a Menor)' },
    { field: 'brand.name', direction: 'asc', label: 'Marca (A-Z)' },
    { field: 'brand.name', direction: 'desc', label: 'Marca (Z-A)' },
    { field: 'category.name', direction: 'asc', label: 'Categoría (A-Z)' },
    { field: 'category.name', direction: 'desc', label: 'Categoría (Z-A)' }
  ]

  const buildQueryString = (page: number) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: '12'
    })

    if (filters.minPrice) params.append('minPrice', filters.minPrice)
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
    if (filters.brand) params.append('brand', filters.brand)
    if (filters.category) params.append('category', filters.category)

    params.append('sortBy', sortBy)
    params.append('sortDirection', sortDirection)

    return params.toString()
  }

  const fetchProducts = async (page: number) => {
    try {
      setLoading(true)
      const queryString = buildQueryString(page)
      const response = await fetch(`http://localhost:8080/api/products?${queryString}`)

      if (!response.ok) {
        throw new Error('Error al cargar los productos')
      }

      const data: ApiResponse = await response.json()
      setProducts(data.content)
      setTotalPages(data.totalPages)
      setCurrentPage(data.number)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ha ocurrido un error')
    } finally {
      setLoading(false)
    }
  }

  const extractUniqueBrands = (products: Product[]): Brand[] => {
    const brandMap = new Map<number, Brand>()
    products.forEach(product => {
      brandMap.set(product.brand.id, product.brand)
    })
    return Array.from(brandMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  }

  const extractUniqueCategories = (products: Product[]): Category[] => {
    const categoryMap = new Map<number, Category>()
    products.forEach(product => {
      categoryMap.set(product.category.id, product.category)
    })
    return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  }

  const fetchAllProductsForFilters = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/products?page=0&size=1000')
      if (response.ok) {
        const data: ApiResponse = await response.json()
        const uniqueBrands = extractUniqueBrands(data.content)
        const uniqueCategories = extractUniqueCategories(data.content)
        setBrands(uniqueBrands)
        setCategories(uniqueCategories)
      }
    } catch (err) {
      console.error('Error al cargar productos para filtros:', err)
    }
  }

  useEffect(() => {
    fetchProducts(0)
    fetchAllProductsForFilters()
  }, [])

  useEffect(() => {
    fetchProducts(0)
  }, [filters, sortBy, sortDirection])

  const handleFilterChange = (filterType: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
    setCurrentPage(0)
  }

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      brand: '',
      category: ''
    })
    setCurrentPage(0)
  }

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split(':')
    setSortBy(field)
    setSortDirection(direction as 'asc' | 'desc')
    setCurrentPage(0)
  }

  const handlePageChange = (page: number, event?: React.MouseEvent) => {
    event?.preventDefault()
    fetchProducts(page)
  }

  if (loading) {
    return <div className="loading">Cargando productos...</div>
  }

  if (error) {
    return <div className="error">Error: {error}</div>
  }

  return (
    <div className="product-catalog">
      <h1>Catálogo de Productos</h1>

      <div className="filters-section">
        <h3>Filtros y Ordenamiento</h3>

        <div className="filters-grid">
          <div className="filter-group">
            <label>Ordenar por</label>
            <select
              value={`${sortBy}:${sortDirection}`}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              {sortOptions.map(option => (
                <option key={`${option.field}:${option.direction}`} value={`${option.field}:${option.direction}`}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Rango de Precio</label>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Precio Mínimo"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Precio Máximo"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Marca</label>
            <select
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
            >
              <option value="">Todas las Marcas</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.name}>{brand.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Categoría</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">Todas las Categorías</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-actions">
            <button onClick={clearFilters}>Limpiar Filtros</button>
          </div>
        </div>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p className="brand">{product.brand.name}</p>
            <p className="category">{product.category.name}</p>
            <p className="description">{product.description}</p>
            <p className="price">${product.price.toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button
          onClick={(e) => handlePageChange(currentPage - 1, e)}
          disabled={currentPage === 0}
        >
          Anterior
        </button>

        <span className="page-info">
          Página {currentPage + 1} de {totalPages}
        </span>

        <button
          onClick={(e) => handlePageChange(currentPage + 1, e)}
          disabled={currentPage === totalPages - 1}
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}

export default ProductCatalog