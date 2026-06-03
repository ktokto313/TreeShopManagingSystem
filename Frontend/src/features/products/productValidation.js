import { SKU_REGEX } from '../../data/regexPatterns'

export function validateProductForm(values) {
  const errors = {}

  if (!values.name?.trim()) {
    errors.name = 'Product name is required'
  }

  if (!values.sku?.trim()) {
    errors.sku = 'SKU is required'
  } else if (!SKU_REGEX.test(values.sku.trim())) {
    errors.sku = 'SKU can use uppercase letters, numbers, and hyphens'
  }

  if (!values.categoryId) {
    errors.categoryId = 'Category is required'
  }

  if (values.price === '' || Number(values.price) < 0) {
    errors.price = 'Price must be zero or greater'
  }

  if (values.stock === '' || Number(values.stock) < 0) {
    errors.stock = 'Stock must be zero or greater'
  }

  return errors
}
