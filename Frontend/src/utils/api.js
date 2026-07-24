function tryParseJson(text) {
  if (typeof text !== 'string') {
    return text
  }

  const trimmed = text.trim()
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return text
  }

  try {
    return JSON.parse(trimmed)
  } catch {
    return text
  }
}

function loadJsonp(path) {
  const absoluteUrl = new URL(path, window.location.origin)
  const callbackName = `__treeshop_jsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    let settled = false

    function cleanup() {
      if (settled) {
        return
      }

      settled = true
      delete window[callbackName]
      script.remove()
    }

    window[callbackName] = (payload) => {
      cleanup()
      resolve(payload)
    }

    script.async = true
    script.onerror = () => {
      cleanup()
      reject(new Error('Request failed while loading JSONP response'))
    }
    absoluteUrl.searchParams.set('callback', callbackName)
    script.src = absoluteUrl.toString()
    document.head.appendChild(script)
  })
}

async function requestJsonWithFetch(path, options) {
  const { body, headers, method = 'GET' } = options
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData

  const response = await fetch(path, {
    method,
    credentials: 'include',
    headers: isFormData
      ? headers
      : {
          'Content-Type': 'application/json',
          ...(headers ?? {}),
        },
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  })

  const contentType = response.headers.get('content-type') || ''
  const text = await response.text().catch(() => '')
  const payload = contentType.includes('application/json') ? tryParseJson(text) : tryParseJson(text)

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && payload.message) ||
      (typeof payload === 'string' && payload) ||
      `Request failed with status ${response.status}`
    const error = new Error(message)
    error.status = response.status
    error.payload = payload
    throw error
  }

  if (
    typeof payload === 'string' &&
    options.method?.toUpperCase?.() === 'GET' &&
    path.startsWith('/api/')
  ) {
    return loadJsonp(path)
  }

  return payload
}

function requestJsonWithXhr(path, options) {
  const { body, headers, method = 'GET' } = options
  const absolutePath = new URL(path, window.location.origin).toString()
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, absolutePath, true)
    xhr.withCredentials = true

    Object.entries(
      isFormData
        ? headers ?? {}
        : {
            'Content-Type': 'application/json',
            ...(headers ?? {}),
          },
    ).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value)
    })

    xhr.onload = () => {
      const contentType = xhr.getResponseHeader('content-type') || ''
      const text = xhr.responseText || ''
      const payload = contentType.includes('application/json') ? tryParseJson(text) : tryParseJson(text)

      if (xhr.status < 200 || xhr.status >= 300) {
        const message =
          (payload && typeof payload === 'object' && payload.message) ||
          (typeof payload === 'string' && payload) ||
          `Request failed with status ${xhr.status}`
        const error = new Error(message)
        error.status = xhr.status
        error.payload = payload
        reject(error)
        return
      }

      if (typeof payload === 'string' && method.toUpperCase() === 'GET' && path.startsWith('/api/')) {
        loadJsonp(path).then(resolve).catch(reject)
        return
      }

      resolve(payload)
    }

    xhr.onerror = () => {
      reject(new Error('Network request failed'))
    }

    xhr.send(body === undefined ? null : isFormData ? body : JSON.stringify(body))
  })
}

export async function requestJson(path, options = {}) {
  if (typeof fetch === 'function') {
    return requestJsonWithFetch(path, options)
  }

  if (typeof XMLHttpRequest === 'function') {
    return requestJsonWithXhr(path, options)
  }

  const method = (options.method || 'GET').toUpperCase()
  if (method === 'GET' && path.startsWith('/api/')) {
    return loadJsonp(path)
  }

  throw new Error('No browser network transport is available')
}
