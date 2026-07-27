/*
 * Created By: MinhLTHE200133
 * Created At: 2026-06-05
 * Last Modified: 2026-06-05
 */
const CATEGORY_ORDER = [
  'CÃƒÂ¢y trong nhÃƒÂ ',
  'CÃƒÂ¢y ngoÃƒÂ i trÃ¡Â»Âi',
  'CÃƒÂ¢y Ã„â€˜Ã¡Â»Æ’ bÃƒÂ n',
  'Sen Ã„â€˜ÃƒÂ¡ & XÃ†Â°Ã†Â¡ng rÃ¡Â»â€œng',
  'CÃƒÂ¢y phong thÃ¡Â»Â§y',
  'PhÃ¡Â»Â¥ kiÃ¡Â»â€¡n',
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
