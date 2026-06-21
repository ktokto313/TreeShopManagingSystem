// Created by minhlthe200133
import {Badge} from '../../../components/ui/Badge'
import { getProductAvailability } from '../utils/productAvailability'

export default function ProductStatusBadge({ product, isActive }) {
  if (product) {
    const availability = getProductAvailability(product)

    return (
      <Badge status={availability.badgeStatus} className={availability.badgeClassName}>
        {availability.label}
      </Badge>
    )
  }

  return (
    <Badge status={isActive ? 'active' : 'inactive'}>
      {isActive ? 'Đang hoạt động' : 'Đã ẩn'}
    </Badge>
  )
}
