// Created by minhlthe200133
import Badge from '../../../components/ui/Badge'

export default function ProductStatusBadge({ isActive }) {
  return (
    <Badge status={isActive ? 'active' : 'inactive'}>
      {isActive ? 'Đang hoạt động' : 'Đã ẩn'}
    </Badge>
  )
}
