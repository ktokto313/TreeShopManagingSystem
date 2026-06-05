const CATEGORY_ORDER = [
  'Cây trong nhà',
  'Cây ngoài trời',
  'Cây để bàn',
  'Sen đá & Xương rồng',
  'Cây phong thủy',
  'Phụ kiện',
]

const categoryOrderLookup = new Map(
  CATEGORY_ORDER.map((name, index) => [normalizeCategoryName(name), index]),
)

function normalizeCategoryName(name) {
  return String(name ?? '').trim().toLocaleLowerCase('vi-VN')
}

function compareCategoryFallback(left, right) {
  const leftId = Number(left?.id)
  const rightId = Number(right?.id)

  if (!Number.isNaN(leftId) && !Number.isNaN(rightId) && leftId !== rightId) {
    return leftId - rightId
  }

  return String(left?.name ?? '').localeCompare(String(right?.name ?? ''), 'vi-VN')
}

export function sortCategories(categories = []) {
  return [...categories].sort((left, right) => {
    const leftOrder = categoryOrderLookup.get(normalizeCategoryName(left?.name))
    const rightOrder = categoryOrderLookup.get(normalizeCategoryName(right?.name))

    if (leftOrder !== undefined && rightOrder !== undefined) {
      return leftOrder - rightOrder
    }

    if (leftOrder !== undefined) {
      return -1
    }

    if (rightOrder !== undefined) {
      return 1
    }

    return compareCategoryFallback(left, right)
  })
}
