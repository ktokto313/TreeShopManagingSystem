// Created by minhlthe200133
export const LOW_STOCK_THRESHOLD = 10

export function isProductActive(status) {
  return status !== false && status !== 0 && String(status).toLowerCase() !== 'false'
}

export function getProductAvailability(product, lowStockThreshold = LOW_STOCK_THRESHOLD) { //hien trang thai cua san pham
  const stock = Number(product?.stock ?? 0)
  const active = isProductActive(product?.status)

  if (!active) {
    return {
      state: 'inactive',
      label: 'Tạm ngừng bán',
      helper: 'Sản phẩm đang tạm ngừng bán.',
      canPurchase: false,
      badgeStatus: 'inactive',
      badgeClassName: '',
    }
  }

  if (stock <= 0) {
    return {
      state: 'out-of-stock',
      label: 'Hết hàng',
      helper: 'Sản phẩm vẫn xem được nhưng chưa thể thêm vào giỏ.',
      canPurchase: false,
      badgeStatus: 'danger',
      badgeClassName: '',
    }
  }

  if (stock <= lowStockThreshold) {
    return {
      state: 'low-stock',
      label: 'Sắp hết hàng',
      helper: `Chỉ còn ${stock} sản phẩm.`,
      canPurchase: true,
      badgeStatus: 'active',
      badgeClassName: 'bg-amber-100 text-amber-700',
    }
  }

  return {
    state: 'in-stock',
    label: 'Còn hàng',
    helper: `Còn ${stock} sản phẩm.`,
    canPurchase: true,
    badgeStatus: 'active',
    badgeClassName: '',
  }
}
