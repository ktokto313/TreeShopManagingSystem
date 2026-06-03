export const PRODUCT_STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
]

export const PRODUCT_IMAGE_RULES = {
  maxSizeBytes: 2 * 1024 * 1024,
  minWidth: 500,
  minHeight: 500,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
}
