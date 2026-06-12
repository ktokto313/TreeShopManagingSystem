// Created by minhlthe200133
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import ProductImageFrame from '../../products/components/ProductImageFrame'
import { getProductAvailability } from '../../products/utils/productAvailability'
import { resolveProductImageSource } from '../../products/utils/productImageResolver'
import { formatCurrency, parseCatalogImages } from '../utils/catalogUtils'

export default function CatalogProductCard({
  product,
  categoryName,
  onOpen,
  onEdit,
  onCategoryOpen,
  onAdd,
}) {
  const images = parseCatalogImages(product.images)
  const imagePreview = resolveProductImageSource(images[0])
  const availability = getProductAvailability(product)

  return (
    <Card className="flex h-full flex-col gap-4 border-[var(--border)] bg-white/95 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-[var(--text-h)]">{product.name}</h3>
          </div>
          <ProductBadge availability={availability} />
        </div>

        <ProductImageFrame
          src={imagePreview}
          alt={product.name}
          className="h-52"
          fallbackLabel="Chưa có ảnh"
        />
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-[var(--text)]">
        <button
          type="button"
          className="text-left"
          onClick={() => onCategoryOpen?.(product.categoryId)}
        >
          <Badge status="active" className="bg-emerald-100 text-emerald-700">
            {categoryName || `Danh mục ${product.categoryId ?? ''}`}
          </Badge>
        </button>
      </div>

      <div className="grid gap-2 rounded-2xl bg-[var(--social-bg)] px-4 py-3 text-sm text-[var(--text-h)]">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[var(--text)]">Giá</span>
          <span className="font-semibold text-[var(--accent)]">{formatCurrency(product.price)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[var(--text)]">Tồn kho</span>
          <span className="font-medium">{product.stock ?? 0}</span>
        </div>
        <div className="text-xs text-[var(--text)]">{availability.helper}</div>
      </div>

      <div className="mt-auto flex flex-wrap justify-end gap-2">
        {onEdit ? (
          <Button variant="secondary" size="sm" onClick={() => onEdit?.(product)}>
            Sửa
          </Button>
        ) : null}
        <Button variant="secondary" size="sm" onClick={() => onOpen?.(product)}>
          Xem chi tiết
        </Button>
        <Button
          size="sm"
          disabled={!availability.canPurchase}
          onClick={() => onAdd?.(product)}
          title={availability.canPurchase ? 'Thêm vào giỏ hàng' : availability.helper}
        >
          Thêm vào giỏ
        </Button>
      </div>
    </Card>
  )
}

function ProductBadge({ availability }) {
  return (
    <Badge status={availability.badgeStatus} className={availability.badgeClassName}>
      {availability.label}
    </Badge>
  )
}
