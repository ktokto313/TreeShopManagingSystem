// Created by minhlthe200133
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import {Badge} from '../../../components/ui/Badge'
import {Button} from '../../../components/ui/Button'
import {Card} from '../../../components/ui/Card'
import { cn } from '../../../utils/cn'
import ProductImageFrame from '../../products/components/ProductImageFrame'
import { getProductAvailability } from '../../products/utils/productAvailability'
import { resolveProductImageSource } from '../../products/utils/productImageResolver'
import { formatCurrency, parseCatalogImages } from '../utils/catalogUtils'

export default function CatalogProductCard({
  product,
  categoryName,
  onOpen,
  onCategoryOpen,
  onAdd,
  onWishlist,
  isWishlisted = false,
}) {
  const images = parseCatalogImages(product.images)
  const imagePreview = resolveProductImageSource(images[0])
  const availability = getProductAvailability(product)

  return (
    <Card className="flex h-full flex-col gap-4 border-green-400 bg-white/40 p-4 transition hover:shadow-lg">
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="space-y-1">
            <h3 className="text-lg ms-1 truncate font-semibold text-green-800">{product.name}</h3>
          </div>
        </div>

        <div className="relative">
          <ProductImageFrame
            src={imagePreview}
            alt={product.name}
            className="h-52"
            fallbackLabel="Chưa có ảnh"
          />
          <button
            type="button"
            className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border bg-white/95 text-lg shadow-md transition hover:-translate-y-0.5 ${
              isWishlisted
                ? 'border-red-200 text-red-600 hover:bg-red-50'
                : 'border-green-100 text-green-700 hover:bg-green-50'
            }`}
            disabled={availability.state === 'inactive'}
            onClick={() => onWishlist?.(product)}
            aria-label={isWishlisted ? 'Đến danh sách yêu thích' : 'Thêm vào yêu thích'}
            title={isWishlisted ? 'Đến danh sách yêu thích' : 'Thêm vào yêu thích'}
          >
            {isWishlisted ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-green-800">
        <button
          type="button"
          className="flex gap-1"
          onClick={() => onCategoryOpen?.(product.categoryId)}
        >
          <Badge status="active" className="bg-blue-100 text-blue-700 border-blue-300 border">
            {categoryName || `Danh mục ${product.categoryId ?? ''}`}
          </Badge>
          <ProductBadge className={cn({
            "bg-emerald-100 text-emerald-700 border-emerald-300 border": (availability.state === "in-stock"),
            "bg-amber-100 text-amber-600 border-amber-400 border": (availability.state === "low-stock"),
            "bg-red-100 text-red-500 border-red-300 border": (availability.state === "out-of-stock"),
            "bg-gray-200 text-gray-500 border-gray-400 border": (availability.state === "inactive")
            })} 
            availability={availability} />
        </button>
      </div>

      <div className="grid gap-2 rounded-2xl bg-bg-surface px-4 py-3 text-sm text-green-800">
        <div className="flex items-center justify-between gap-3">
          <span className="text-green-800">Giá</span>
          <span className="font-semibold text-bg-success">{formatCurrency(product.price)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-green-800">Tồn kho</span>
          <span className="font-medium">{product.stock ?? 0}</span>
        </div>
        <div className="text-xs text-green-800">{availability.helper}</div>
      </div>

      <div className="mt-auto flex justify-center gap-2">
        <Button className="text-nowrap flex-1 hover:bg-gray-200 bg-white text-green-600 border border-green-300" onClick={() => onOpen?.(product)}>
          Xem chi tiết
        </Button>
        <Button
          className="text-nowrap flex-1"
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

function ProductBadge({ className, availability }) {
  return (
    <Badge status={availability.badgeStatus} className={`${availability.badgeClassName} ${className || ""}`.trim()}>
      {availability.label}
    </Badge>
  )
}
