import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import { formatCurrency, parseCatalogImages } from '../utils/catalogUtils'
import { summarizeVariantGroups } from '../../products/utils/variantUtils'

function summarizeText(value, maxLength = 96) {
  if (!value) {
    return 'Chưa có mô tả.'
  }

  const stringValue = String(value)
  return stringValue.length > maxLength ? `${stringValue.slice(0, maxLength)}...` : stringValue
}

export default function CatalogProductCard({ product, categoryName, onOpen }) {
  const images = parseCatalogImages(product.images)
  const variantGroups = summarizeVariantGroups(product.variants)

  return (
    <Card className="flex h-full flex-col gap-4 border-[var(--border)] bg-white/95 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-100 via-white to-lime-100 text-xs text-[var(--text)]">
            {images[0] ? (
              <span className="px-2 text-center leading-4">{images[0]}</span>
            ) : (
              <span>Không ảnh</span>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--text)]">
              {product.sku}
            </p>
            <h3 className="text-lg font-semibold text-[var(--text-h)]">{product.name}</h3>
          </div>
        </div>
        <ProductBadge isActive={product.status} />
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-[var(--text)]">
        <Badge status="active" className="bg-emerald-100 text-emerald-700">
          {categoryName || `Danh mục ${product.categoryId ?? ''}`}
        </Badge>
        <Badge status="inactive" className="bg-slate-100 text-slate-700">
          {variantGroups.length} nhóm biến thể
        </Badge>
        <Badge status="inactive" className="bg-slate-100 text-slate-700">
          {images.length} ảnh
        </Badge>
      </div>

      <p className="text-sm leading-6 text-[var(--text)]">{summarizeText(product.description)}</p>

      <div className="space-y-2 rounded-xl bg-[var(--social-bg)] px-4 py-3 text-sm text-[var(--text-h)]">
        <div className="flex items-center justify-between gap-3">
          <span>Giá</span>
          <span className="font-semibold text-[var(--accent)]">{formatCurrency(product.price)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Tồn kho</span>
          <span>{product.stock ?? 0}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-[var(--text)]">
        {variantGroups.length ? (
          variantGroups.map((group) => (
            <span key={group.name} className="rounded-full bg-[var(--social-bg)] px-3 py-1.5">
              {group.name}: {group.count}
            </span>
          ))
        ) : (
          <span className="rounded-full bg-[var(--social-bg)] px-3 py-1.5">
            Chưa có biến thể
          </span>
        )}
      </div>

      <div className="mt-auto flex justify-end">
        <Button variant="secondary" size="sm" onClick={() => onOpen?.(product)}>
          Xem chi tiết
        </Button>
      </div>
    </Card>
  )
}

function ProductBadge({ isActive }) {
  return (
    <Badge status={isActive ? 'active' : 'inactive'}>
      {isActive ? 'Đang bán' : 'Tạm ẩn'}
    </Badge>
  )
}
