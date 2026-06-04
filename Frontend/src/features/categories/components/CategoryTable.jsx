import Button from '../../../components/ui/Button'

export default function CategoryTable({ categories = [], onEdit, onDelete }) {
  return (
    <div className="max-h-[65vh] overflow-auto rounded-lg border border-[var(--border)]">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="sticky top-0 z-10 bg-[var(--social-bg)] text-xs uppercase text-[var(--text)]">
          <tr>
            <th className="px-4 py-3 font-medium">Tên</th>
            <th className="px-4 py-3 font-medium">Mô tả</th>
            <th className="px-4 py-3 font-medium">Danh mục cha</th>
            <th className="px-4 py-3 text-right font-medium">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {categories.map((category) => (
            <tr key={category.id}>
              <td className="px-4 py-3 font-medium text-[var(--text-h)]">{category.name}</td>
              <td className="px-4 py-3">{category.description}</td>
              <td className="px-4 py-3">{category.parentId || '-'}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" size="sm" onClick={() => onEdit?.(category)}>
                    Sửa
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => onDelete?.(category)}>
                    Xóa
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
