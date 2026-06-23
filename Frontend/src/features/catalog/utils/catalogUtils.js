// Created by minhlthe200133
import { summarizeVariantGroups } from '../../products/utils/variantUtils'
import { getProductAvailability } from '../../products/utils/productAvailability'

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

function normalizeSearchText(value) {
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

function compactSearchText(value) {
  return normalizeSearchText(value).replace(/\s+/g, '')
}

//check filter keyword search
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
    categoryName,
    ...searchAliases,
    summarizeVariantGroups(product.variants)
      .map((group) => `${group.name}:${group.values.join(', ')}`)
      .join(' '),
  ]
    .map(normalizeSearchText)
    .join(' ')
  const compactSearchableText = compactSearchText(searchableText)

  return searchableText.includes(searchValue) || compactSearchableText.includes(compactSearchValue)
}

//check filter data
export function matchesCatalogFilters(product, filters, categoryName, options = {}) {
  const keyword = filters.keyword
  const selectedCategoryId = String(filters.categoryId ?? '')
  const selectedStatus = String(filters.status ?? '')
  const minPrice = filters.minPrice === '' ? null : Number(filters.minPrice)
  const maxPrice = filters.maxPrice === '' ? null : Number(filters.maxPrice)
  const isPurchasable = getProductAvailability(product).canPurchase
  const otherCategoryId = options.otherCategoryId ?? 'other'
  const smallCategoryIds = options.smallCategoryIds ?? new Set()
  const productCategoryId = String(product.categoryId ?? '')

  if (selectedCategoryId === otherCategoryId && !smallCategoryIds.has(productCategoryId)) {
    return false
  }

  if (selectedCategoryId && selectedCategoryId !== otherCategoryId && productCategoryId !== selectedCategoryId) {
    return false
  }

  if (selectedStatus === 'true' && !isPurchasable) {
    return false
  }

  if (selectedStatus === 'false' && isPurchasable) {
    return false
  }

  const priceValue = Number(product.price ?? 0)
  if (minPrice !== null && !Number.isNaN(minPrice) && priceValue < minPrice) {
    return false
  }

  if (maxPrice !== null && !Number.isNaN(maxPrice) && priceValue > maxPrice) {
    return false
  }

  return matchesText(product, keyword, categoryName, options.searchAliases)
}

//sort products
export function sortCatalogProducts(products, sortKey) {
  const sortedProducts = [...products]

  switch (sortKey) {
    case 'popular':
      return sortedProducts.sort((left, right) => {
        const leftScore =
          Number(left.stock ?? 0) * 2 +
          parseCatalogImages(left.images).length * 3 +
          summarizeVariantGroups(left.variants).length
        const rightScore =
          Number(right.stock ?? 0) * 2 +
          parseCatalogImages(right.images).length * 3 +
          summarizeVariantGroups(right.variants).length

        if (rightScore !== leftScore) {
          return rightScore - leftScore
        }

        return Number(right.id ?? 0) - Number(left.id ?? 0)
      })
    case 'rating':
      return sortedProducts.sort((left, right) => {
        const leftScore =
          summarizeVariantGroups(left.variants).length * 2 + parseCatalogImages(left.images).length
        const rightScore =
          summarizeVariantGroups(right.variants).length * 2 + parseCatalogImages(right.images).length

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
