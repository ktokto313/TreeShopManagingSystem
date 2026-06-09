import { useEffect, useState } from 'react'
import { cn } from '../../../utils/cn'

export default function ProductImageFrame({
  src,
  alt = 'Sản phẩm',
  className,
  imageClassName,
  fallbackLabel = 'Chưa có ảnh hiển thị',
}) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasError(false)
  }, [src])

  const shouldShowImage = Boolean(src) && !hasError

  return (
    <div
      className={cn(
        'flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100 via-white to-lime-100 text-sm text-[var(--text)]',
        className,
      )}
    >
      {shouldShowImage ? (
        <img
          src={src}
          alt={alt}
          className={cn('h-full w-full object-cover', imageClassName)}
          loading="lazy"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="grid h-full w-full place-items-center px-4 text-center">
          <div>
            <div className="text-4xl">🌿</div>
            <p className="mt-2">{fallbackLabel}</p>
          </div>
        </div>
      )}
    </div>
  )
}
