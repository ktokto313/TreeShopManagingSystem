import Button from '../../../components/ui/Button'
import ProductStatusBadge from './ProductStatusBadge'

function summarizeText(value, maxLength = 80) {
  if (!value) {
    return '-'
  }

  const stringValue = String(value)
  return stringValue.length > maxLength ? `${stringValue.slice(0, maxLength)}...` : stringValue
}

function countFromJsonString(value) {
  if (!value) {
    return 0
  }

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.length : 0
  } catch {
    return 0
  }
}

function renderImagePreview(product) {
  const hasImage = Array.isArray(product.images)
    ? product.images.length > 0
    : countFromJsonString(product.images) > 0

  if (hasImage) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[var(--social-bg)] text-[10px] text-[var(--text)]">
        IMG
      </div>
    )
  }

  return <div className="h-12 w-12 rounded-md bg-[var(--social-bg)]" />
}

export default function ProductTable({ products = [], onEdit, onDeactivate }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
      <table className="min-w-[1120px] w-full border-collapse text-left text-sm">
        <thead className="bg-[var(--social-bg)] text-xs uppercase text-[var(--text)]">
          <tr>
            <th className="px-4 py-3 font-medium">Image</th>
            <th className="px-4 py-3 font-medium">SKU</th>
            <th className="px-4 py-3 font-medium">Product</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Detail</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Stock</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {products.map((product) => (
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
                      {countFromJsonString(product.variants)} variant(s)
                    </span>
                    <span className="rounded-full bg-[var(--social-bg)] px-2 py-1">
                      {countFromJsonString(product.images)} image(s)
                    </span>
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
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => onDeactivate?.(product)}>
                    Deactivate
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
