export function parseVariantGroups(value) {
  if (!value) {
    return []
  }

  let parsedValue = value

  if (typeof value === 'string') {
    try {
      parsedValue = JSON.parse(value)
    } catch {
      return []
    }
  }

  if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
    return []
  }

  return Object.entries(parsedValue).map(([name, items]) => ({
    name,
    values: Array.isArray(items) ? items.join(', ') : String(items ?? ''),
  }))
}

export function serializeVariantGroups(groups) {
  const output = {}

  groups.forEach(({ name, values }) => {
    const trimmedName = String(name ?? '').trim()
    if (!trimmedName) {
      return
    }

    const parsedValues = String(values ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    if (!parsedValues.length) {
      return
    }

    output[trimmedName] = Array.from(new Set([...(output[trimmedName] || []), ...parsedValues]))
  })

  return Object.keys(output).length ? JSON.stringify(output) : ''
}

export function summarizeVariantGroups(value) {
  return parseVariantGroups(value).map((group) => ({
    name: group.name,
    count: group.values
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean).length,
  }))
}
