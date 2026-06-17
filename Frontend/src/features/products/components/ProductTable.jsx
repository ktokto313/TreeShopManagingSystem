// Created by minhlthe200133
import {Button} from '../../../components/ui/Button'
import { formatCurrency, parseCatalogImages } from '../../catalog/utils/catalogUtils'
import ProductImageFrame from './ProductImageFrame'
import ProductStatusBadge from './ProductStatusBadge'
import { getProductAvailability } from '../utils/productAvailability'
import { resolveProductImageSource } from '../utils/productImageResolver'
import { summarizeVariantGroups } from '../utils/variantUtils'

function summarizeText(value, maxLength = 80) {
  if (!value) {
    return '-'
  }

  const stringValue = String(value)
  return stringValue.length > maxLength ? `${stringValue.slice(0, maxLength)}...` : stringValue
}

function renderImagePreview(product) {
  const firstImage = parseCatalogImages(product.images)[0]
  const imageSource = resolveProductImageSource(firstImage)

  return (
    <ProductImageFrame
      src={imageSource}
      alt={product.name}
      className="h-12 w-12 rounded-md bg-[var(--social-bg)]"
      fallbackLabel={imageSource ? 'Ảnh lỗi' : 'Chưa có ảnh'}
    />
  )
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
            <th className="px-4 py-3 font-medium">Tình trạng</th>
            <th className="px-4 py-3 text-right font-medium">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {products.map((product) => {
            const variantGroups = summarizeVariantGroups(product.variants)
            const availability = getProductAvailability(product)

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
                <td className="px-4 py-3">{formatCurrency(product.price)}</td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <div className="font-medium text-[var(--text-h)]">{product.stock ?? 0}</div>
                    <div className="text-xs text-[var(--text)]">{availability.helper}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <ProductStatusBadge product={product} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => onEdit?.(product)}>
                      Sửa
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => onDeactivate?.(product)}>
                      Ngừng bán
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
