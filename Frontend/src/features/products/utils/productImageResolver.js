/*
 * Created By: MinhLTHE200133
 * Created At: 2026-06-05
 * Last Modified: 2026-06-07
 */
// Created by minhlthe200133
import { parseCatalogImages } from '../../catalog/utils/catalogUtils'

const localImageModules = import.meta.glob('../images/*.{jpg,jpeg,png,webp,gif}', {
  eager: true,
})

const localImageLookup = new Map()
Object.entries(localImageModules).forEach(([path, module]) => {
  const fileName = path.split('/').pop()
  localImageLookup.set(fileName, module.default)
  localImageLookup.set(fileName.toLowerCase(), module.default)
})

function normalizeSource(source) {
  return String(source ?? '').trim().split('?')[0].split('#')[0]
}

function toUploadedImageUrl(source) {
  const fileName = source.split('/').pop()
  return fileName ? `/product-images/${encodeURIComponent(fileName)}` : ''
}

export function resolveProductImageSource(source) {
  if (!source) {
    return ''
  }

  const normalizedSource = normalizeSource(source)

  if (
    /^https?:\/\//i.test(normalizedSource) ||
    normalizedSource.startsWith('/') ||
    normalizedSource.startsWith('data:')
  ) {
    return normalizedSource
  }

  return (
    localImageLookup.get(normalizedSource) ||
    localImageLookup.get(normalizedSource.toLowerCase()) ||
    toUploadedImageUrl(normalizedSource)
  )
}

export function resolveProductImages(value) {
  return parseCatalogImages(value)
    .map((source) => resolveProductImageSource(source))
    .filter(Boolean)
}
