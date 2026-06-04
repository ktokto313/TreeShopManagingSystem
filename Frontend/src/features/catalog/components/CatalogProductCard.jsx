import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import { formatCurrency, parseCatalogImages } from '../utils/catalogUtils'

export default function CatalogProductCard({ product, categoryName, onOpen }) {
  const images = parseCatalogImages(product.images)
  const isInStock = Number(product.stock ?? 0) > 0

  return (
    <Card className="flex h-full flex-col gap-4 border-[var(--border)] bg-white/95 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-[var(--text-h)]">{product.name}</h3>
          </div>
          <ProductBadge isInStock={isInStock} />
        </div>

        <div className="flex h-52 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100 via-white to-lime-100 text-sm text-[var(--text)]">
          {images[0] ? (
            <span className="px-4 text-center leading-5">{images[0]}</span>
          ) : (
            <span>Chưa có ảnh</span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-[var(--text)]">
        <Badge status="active" className="bg-emerald-100 text-emerald-700">
          {categoryName || `Danh mục ${product.categoryId ?? ''}`}
        </Badge>
      </div>

      <div className="grid gap-2 rounded-2xl bg-[var(--social-bg)] px-4 py-3 text-sm text-[var(--text-h)]">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[var(--text)]">Giá</span>
          <span className="font-semibold text-[var(--accent)]">{formatCurrency(product.price)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[var(--text)]">Tồn kho</span>
          <span>{product.stock ?? 0}</span>
        </div>
      </div>

      <div className="mt-auto flex justify-end">
        <Button variant="secondary" size="sm" onClick={() => onOpen?.(product)}>
          Xem chi tiết
        </Button>
      </div>
    </Card>
  )
}

function ProductBadge({ isInStock }) {
  return <Badge status={isInStock ? 'active' : 'inactive'}>{isInStock ? 'Còn hàng' : 'Hết hàng'}</Badge>
}
