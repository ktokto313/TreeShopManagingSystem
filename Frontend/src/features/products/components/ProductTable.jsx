import Button from '../../../components/ui/Button'
import ProductStatusBadge from './ProductStatusBadge'
import { summarizeVariantGroups } from '../utils/variantUtils'

function summarizeText(value, maxLength = 80) {
  if (!value) {
    return '-'
  }

  const stringValue = String(value)
  return stringValue.length > maxLength ? `${stringValue.slice(0, maxLength)}...` : stringValue
}

function renderImagePreview(product) {
  const hasImage = Array.isArray(product.images)
    ? product.images.length > 0
    : Boolean(product.images)

  if (hasImage) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[var(--social-bg)] text-[10px] text-[var(--text)]">
        Ảnh
      </div>
    )
  }

  return <div className="h-12 w-12 rounded-md bg-[var(--social-bg)]" />
}

export default function ProductTable({ products = [], onEdit, onDeactivate }) {
  return (
    <div className="max-h-[70vh] overflow-auto rounded-lg border border-[var(--border)]">
      <table className="min-w-[1120px] w-full border-collapse text-left text-sm">
        <thead className="sticky top-0 z-10 bg-[var(--social-bg)] text-xs uppercase text-[var(--text)]">
          <tr>
            <th className="px-4 py-3 font-medium">Ảnh</th>
            <th className="px-4 py-3 font-medium">SKU</th>
            <th className="px-4 py-3 font-medium">Sản phẩm</th>
            <th className="px-4 py-3 font-medium">Danh mục</th>
            <th className="px-4 py-3 font-medium">Chi tiết</th>
            <th className="px-4 py-3 font-medium">Giá</th>
            <th className="px-4 py-3 font-medium">Tồn kho</th>
            <th className="px-4 py-3 font-medium">Trạng thái</th>
            <th className="px-4 py-3 text-right font-medium">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {products.map((product) => {
            const variantGroups = summarizeVariantGroups(product.variants)

            return (
              <tr key={product.id}>
                <td className="px-4 py-3">{renderImagePreview(product)}</td>
                <td className="px-4 py-3 font-medium text-[var(--text-h)]">{product.sku}</td>
                <td className="px-4 py-3 text-[var(--text-h)]">{product.name}</td>
                <td className="px-4 py-3">{product.categoryName || product.categoryId}</td>
                <td className="px-4 py-3">
                  <div className="max-w-[24rem] space-y-1">
                    <p className="text-[var(--text-h)]">{summarizeText(product.description, 64)}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-[var(--text)]">
                      <span className="rounded-full bg-[var(--social-bg)] px-2 py-1">
                        {variantGroups.length} nhóm biến thể
                      </span>
                      {variantGroups.map((group) => (
                        <span key={group.name} className="rounded-full bg-[var(--social-bg)] px-2 py-1">
                          {group.name}: {group.count}
                        </span>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{product.price}</td>
                <td className="px-4 py-3">{product.stock}</td>
                <td className="px-4 py-3">
                  <ProductStatusBadge isActive={product.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => onEdit?.(product)}>
                      Sửa
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => onDeactivate?.(product)}>
                      Ẩn
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
