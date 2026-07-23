// Created by minhlthe200133

import { getProductAvailability } from '../../products/utils/productAvailability'

/**
 * Parses product images from various input formats (array, string, JSON, nested object).
 * Converts all image references to strings and filters out empty/falsy values.
 * 
 * Handles formats:
 * - Array of images: [img1, img2, ...] → returns array of strings
 * - JSON string: '["img1", "img2"]' or '{"images": ["img1", "img2"]}' → parsed and returned
 * - Plain string: 'img.jpg' → returns single-element array
 * 
 * @param {any} value - The image data to parse (can be null, array, string, JSON)
 * @returns {string[]} Array of image strings, empty if parsing fails or value is empty
 */
export function parseCatalogImages(value) {
  if (!value) {
    return []
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean)
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item)).filter(Boolean)
      }

      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.images)) {
        return parsed.images.map((item) => String(item)).filter(Boolean)
      }
    } catch {
      return value ? [String(value)] : []
    }
  }

  return []
}

/**
 * Formats a numeric value as Vietnamese Dong currency (VND).
 * Returns formatted string with thousand separators or '-' if value is not a valid number.
 * 
 * Example: 1500000 → "1.500.000 ₫"
 * 
 * @param {number|string} value - The numeric value to format
 * @returns {string} Formatted currency string or '-' if NaN
 */
export function formatCurrency(value) {
  const numberValue = Number(value)

  if (Number.isNaN(numberValue)) {
    return '-'
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(numberValue)
}

/**
 * Normalizes text for search matching: removes diacritical marks (Vietnamese accents),
 * converts to lowercase, removes special characters, and collapses whitespace.
 * 
 * This enables case-insensitive, accent-insensitive searching. For example:
 * "Cây Hoa Hồng" → "cay hoa hong" (matches search for "cay" or "hoa")
 * "Đồng Tiền" → "dong tien" (matches search for "dong" even though character is "đ")
 * 
 * @param {string} value - The text to normalize (null/undefined treated as empty string)
 * @returns {string} Normalized lowercase text with accents removed
 */
function normalizeSearchText(value) {
  // Remove Vietnamese diacritical marks to match search even with accent variations
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

/**
 * Compacts normalized search text by removing all spaces.
 * Used to match multi-word terms regardless of spacing.
 * Example: "cay hoa hong" → "cayhoahong"
 * 
 * @param {string} value - The text to normalize and compact
 * @returns {string} Compact normalized text (no spaces)
 */
function compactSearchText(value) {
  return normalizeSearchText(value).replace(/\s+/g, '')
}

/**
 * Checks if a product matches a keyword search across multiple fields.
 * Uses both normalized (space-aware) and compact (space-agnostic) matching to catch variations.
 * 
 * Search fields: name, SKU, description, content, care guide, difficulty, feng shui element, category, search aliases.
 * Handles accent-insensitive matching for Vietnamese product names/descriptions.
 * 
 * @param {object} product - The product object to search
 * @param {string} keyword - The search term (can be empty/null to match all)
 * @param {string} categoryName - The product's category name
 * @param {string[]} searchAliases - Additional keywords to include in search (default: [])
 * @returns {boolean} True if product matches keyword or keyword is empty
 */
function matchesText(product, keyword, categoryName, searchAliases = []) {
  const searchValue = normalizeSearchText(keyword)

  if (!searchValue) {
    return true
  }

  const compactSearchValue = compactSearchText(searchValue)
  const searchableText = [
    product.name,
    product.sku,
    product.description,
    product.content,
    product.careGuide,
    product.difficulty,
    product.fengShuiElement,
    categoryName,
    ...searchAliases,
  ]
    .map(normalizeSearchText)
    .join(' ')
  const compactSearchableText = compactSearchText(searchableText)

  // Try both normalized (space-aware) and compact (space-agnostic) matching
  return searchableText.includes(searchValue) || compactSearchableText.includes(compactSearchValue)
}

/**
 * Matches a product against all active catalog filters (keyword, category, price, difficulty, feng shui).
 * All filter conditions are AND'ed (product must pass ALL filters to be included).
 * 
 * Filters applied:
 * - Category: exact match (or "other" pseudo-category for uncategorized products)
 * - Stock status: active only if status=true, out-of-stock only if status=false
 * - Price range: minPrice ≤ product.price ≤ maxPrice (nulls are treated as no limit)
 * - Care difficulty: accent-insensitive substring match in difficulty, care guide, description, content
 * - Feng shui element: accent-insensitive substring match in element, category, name, description, content
 * - Keyword search: matches across multiple product fields using matchesText()
 * 
 * @param {object} product - The product to filter
 * @param {object} filters - Filter criteria object
 *   - filters.keyword: string search term
 *   - filters.categoryId: string category ID
 *   - filters.status: string "true" or "false"
 *   - filters.minPrice: number minimum price (or empty string for no limit)
 *   - filters.maxPrice: number maximum price (or empty string for no limit)
 *   - filters.careDifficulty: string difficulty level to filter by
 *   - filters.fengShuiElement: string feng shui element to filter by
 * @param {string} categoryName - The product's category name
 * @param {object} options - Additional filter options
 *   - options.otherCategoryId: ID for "other" uncategorized category (default: 'other')
 *   - options.smallCategoryIds: Set of category IDs to group into "other" (default: empty Set)
 *   - options.searchAliases: additional search keywords to include (default: [])
 * @returns {boolean} True if product matches all active filters, false if any filter excludes it
 */
export function matchesCatalogFilters(product, filters, categoryName, options = {}) {
  const keyword = filters.keyword
  const selectedCategoryId = String(filters.categoryId ?? '')
  const selectedStatus = String(filters.status ?? '')
  const minPrice = filters.minPrice === '' ? null : Number(filters.minPrice)
  const maxPrice = filters.maxPrice === '' ? null : Number(filters.maxPrice)
  const careDifficulty = filters.careDifficulty
  const fengShuiElement = filters.fengShuiElement
  const availability = getProductAvailability(product)
  const otherCategoryId = options.otherCategoryId ?? 'other'
  const smallCategoryIds = options.smallCategoryIds ?? new Set()
  const productCategoryId = String(product.categoryId ?? '')

  // Category filter: if "other" is selected, only include products not in smallCategoryIds
  if (selectedCategoryId === otherCategoryId && !smallCategoryIds.has(productCategoryId)) {
    return false
  }

  // Category filter: if specific category selected, must match exactly
  if (selectedCategoryId && selectedCategoryId !== otherCategoryId && productCategoryId !== selectedCategoryId) {
    return false
  }

  // Status filter: true = must be purchasable, false = must be out-of-stock
  if (selectedStatus === 'true' && !availability.canPurchase) {
    return false
  }

  if (selectedStatus === 'false' && availability.state !== 'out-of-stock') {
    return false
  }

  // Price range filter: product price must be within [minPrice, maxPrice]
  const priceValue = Number(product.price ?? 0)
  if (minPrice !== null && !Number.isNaN(minPrice) && priceValue < minPrice) {
    return false
  }

  if (maxPrice !== null && !Number.isNaN(maxPrice) && priceValue > maxPrice) {
    return false
  }

  // Care difficulty filter: accent-insensitive substring match
  if (careDifficulty) {
    const normalizedDifficulty = normalizeSearchText(careDifficulty)
    const candidateTexts = [
      product.difficulty,
      product.careGuide,
      product.description,
      product.content,
    ].map(normalizeSearchText).join(' ')
    
    if (!candidateTexts.includes(normalizedDifficulty)) {
      return false
    }
  }

  // Feng shui element filter: accent-insensitive substring match
  if (fengShuiElement) {
    const normalizedFengShui = normalizeSearchText(fengShuiElement)
    const candidateTexts = [
      product.fengShuiElement,
      categoryName,
      product.name,
      product.description,
      product.content,
    ].map(normalizeSearchText).join(' ')
    
    if (!candidateTexts.includes(normalizedFengShui)) {
      return false
    }
  }

  // Keyword search filter: must match keyword across multiple fields
  return matchesText(product, keyword, categoryName, options.searchAliases)
}

/**
 * Sorts products by the specified sort key.
 * Creates a copy of the input array before sorting (non-destructive).
 * 
 * Sort options:
 * - 'popular': by stock × 2 + image_count × 3 (descending), then by ID
 * - 'rating': by image count (descending), then by ID
 * - 'latest' or 'recommended': by ID (descending, newest first)
 * - 'price-asc': by price (ascending, cheapest first)
 * - 'price-desc': by price (descending, most expensive first)
 * - default/unknown: by ID (descending)
 * 
 * @param {object[]} products - Array of products to sort
 * @param {string} sortKey - The sort criterion to apply
 * @returns {object[]} New sorted array (original array not modified)
 */
export function sortCatalogProducts(products, sortKey) {
  const sortedProducts = [...products]

  switch (sortKey) {
    case 'popular':
      return sortedProducts.sort((left, right) => {
        const leftScore =
          Number(left.stock ?? 0) * 2 +
          parseCatalogImages(left.images).length * 3
        const rightScore =
          Number(right.stock ?? 0) * 2 +
          parseCatalogImages(right.images).length * 3

        if (rightScore !== leftScore) {
          return rightScore - leftScore
        }

        return Number(right.id ?? 0) - Number(left.id ?? 0)
      })
    case 'rating':
      return sortedProducts.sort((left, right) => {
        const leftScore = parseCatalogImages(left.images).length
        const rightScore = parseCatalogImages(right.images).length

        if (rightScore !== leftScore) {
          return rightScore - leftScore
        }

        return Number(right.id ?? 0) - Number(left.id ?? 0)
      })
    case 'latest':
    case 'recommended':
      return sortedProducts.sort((left, right) => Number(right.id ?? 0) - Number(left.id ?? 0))
    case 'price-asc':
      return sortedProducts.sort((left, right) => Number(left.price ?? 0) - Number(right.price ?? 0))
    case 'price-desc':
      return sortedProducts.sort((left, right) => Number(right.price ?? 0) - Number(left.price ?? 0))
    default:
      return sortedProducts.sort((left, right) => Number(right.id ?? 0) - Number(left.id ?? 0))
  }
}
