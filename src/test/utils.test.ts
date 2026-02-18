import { describe, it, expect } from 'vitest'

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

const buildQueryString = (
  page: number,
  filters: {
    minPrice: string
    maxPrice: string
    brand: string
    category: string
  },
  sortBy: string,
  sortDirection: 'asc' | 'desc'
) => {
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

describe('Utility Functions', () => {
  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'Product 1',
      description: 'Description 1',
      price: 100,
      brand: { id: 1, name: 'Brand A' },
      category: { id: 1, name: 'Category A' }
    },
    {
      id: 2,
      name: 'Product 2',
      description: 'Description 2',
      price: 200,
      brand: { id: 2, name: 'Brand B' },
      category: { id: 1, name: 'Category A' }
    },
    {
      id: 3,
      name: 'Product 3',
      description: 'Description 3',
      price: 300,
      brand: { id: 1, name: 'Brand A' },
      category: { id: 2, name: 'Category B' }
    }
  ]

  describe('extractUniqueBrands', () => {
    it('extracts unique brands from products', () => {
      const brands = extractUniqueBrands(mockProducts)
      expect(brands).toHaveLength(2)
      expect(brands.map(b => b.name)).toEqual(['Brand A', 'Brand B'])
    })

    it('sorts brands alphabetically', () => {
      const brands = extractUniqueBrands(mockProducts)
      expect(brands[0].name).toBe('Brand A')
      expect(brands[1].name).toBe('Brand B')
    })

    it('handles empty array', () => {
      const brands = extractUniqueBrands([])
      expect(brands).toHaveLength(0)
    })

    it('removes duplicate brands', () => {
      const brands = extractUniqueBrands(mockProducts)
      const brandIds = brands.map(b => b.id)
      const uniqueIds = [...new Set(brandIds)]
      expect(brandIds).toEqual(uniqueIds)
    })
  })

  describe('extractUniqueCategories', () => {
    it('extracts unique categories from products', () => {
      const categories = extractUniqueCategories(mockProducts)
      expect(categories).toHaveLength(2)
      expect(categories.map(c => c.name)).toEqual(['Category A', 'Category B'])
    })

    it('sorts categories alphabetically', () => {
      const categories = extractUniqueCategories(mockProducts)
      expect(categories[0].name).toBe('Category A')
      expect(categories[1].name).toBe('Category B')
    })

    it('handles empty array', () => {
      const categories = extractUniqueCategories([])
      expect(categories).toHaveLength(0)
    })

    it('removes duplicate categories', () => {
      const categories = extractUniqueCategories(mockProducts)
      const categoryIds = categories.map(c => c.id)
      const uniqueIds = [...new Set(categoryIds)]
      expect(categoryIds).toEqual(uniqueIds)
    })
  })

  describe('buildQueryString', () => {
    it('builds basic query string with page and size', () => {
      const queryString = buildQueryString(
        0,
        { minPrice: '', maxPrice: '', brand: '', category: '' },
        'name',
        'asc'
      )
      expect(queryString).toBe('page=0&size=12&sortBy=name&sortDirection=asc')
    })

    it('includes filters when provided', () => {
      const queryString = buildQueryString(
        1,
        { minPrice: '10', maxPrice: '100', brand: 'Brand A', category: 'Category A' },
        'price',
        'desc'
      )
      expect(queryString).toContain('page=1')
      expect(queryString).toContain('minPrice=10')
      expect(queryString).toContain('maxPrice=100')
      expect(queryString).toContain('brand=Brand+A')
      expect(queryString).toContain('category=Category+A')
      expect(queryString).toContain('sortBy=price')
      expect(queryString).toContain('sortDirection=desc')
    })

    it('excludes empty filters', () => {
      const queryString = buildQueryString(
        0,
        { minPrice: '10', maxPrice: '', brand: '', category: 'Category A' },
        'name',
        'asc'
      )
      expect(queryString).toContain('minPrice=10')
      expect(queryString).toContain('category=Category+A')
      expect(queryString).not.toContain('maxPrice=')
      expect(queryString).not.toContain('brand=')
    })

    it('handles special characters in filters', () => {
      const queryString = buildQueryString(
        0,
        { minPrice: '', maxPrice: '', brand: 'Brand & Co', category: '' },
        'name',
        'asc'
      )
      expect(queryString).toContain('brand=Brand+%26+Co')
    })
  })
})