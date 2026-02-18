# Retail Products Frontend

A React-based frontend application for browsing and filtering retail products. Built with TypeScript, Vite, and modern React patterns.

## Features

- **Product Catalog**: Browse products with detailed information including name, description, price, brand, and category
- **Advanced Filtering**: Filter products by price range, brand, and category
- **Sorting Options**: Sort products by name, price, brand, or category in ascending/descending order
- **Pagination**: Navigate through product pages efficiently
- **Responsive Design**: Modern, responsive UI that works across devices

## Tech Stack

- **React 19** - Frontend framework
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and development server
- **Vitest** - Unit testing framework
- **ESLint** - Code linting and quality

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd retail_products_front
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.local.example .env.local
   ```

4. Configure your API base URL in `.env.local`:
   ```
   VITE_API_BASE_URL=your-api-base-url
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Create a production build:
```bash
npm run build
```

### Testing

Run tests:
```bash
npm run test
```

Run tests with UI:
```bash
npm run test:ui
```

### Linting

Check code quality:
```bash
npm run lint
```

## Project Structure

```
src/
├── App.tsx              # Main application component
├── ProductCatalog.tsx   # Product catalog with filtering and pagination
├── App.css              # Application styles
├── ProductCatalog.css   # Product catalog styles
├── main.tsx            # Application entry point
├── assets/             # Static assets
└── test/               # Test files
```

## API Integration

The application expects a REST API with the following endpoints:

- `GET /api/products` - Retrieve paginated products with filtering and sorting
  - Query parameters: `page`, `size`, `minPrice`, `maxPrice`, `brand`, `category`, `sortBy`, `sortDirection`
  - Response format: `{ content: Product[], totalPages: number, totalElements: number, ... }`

### Product Data Structure

```typescript
interface Product {
  id: number
  name: string
  description: string
  price: number
  brand: {
    id: number
    name: string
  }
  category: {
    id: number
    name: string
  }
}
```
