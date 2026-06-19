// Created by minhlthe200133
import {Button} from '../../../components/ui/Button'

export default function CategoryTable({ categories = [], onEdit, onDelete }) {
  return (
    <div className="max-h-[65vh] overflow-auto rounded-lg border border-green-500">
      <table className="w-full border-collapse text-left text-sm min-w-150">
        <thead className="sticky top-0 z-10 bg-green-500 text-white uppercase text-base">
          <tr className='text-nowrap'>
            <th className="px-4 py-3 font-medium">Tên</th>
            <th className="px-4 py-3 font-medium">Mô tả</th>
            <th className="px-4 py-3 font-medium">Sản phẩm</th>
            <th className="px-4 py-3 text-right font-medium">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-green-500">
          {categories.map((category) => (
            <tr key={category.id}>
              <td className="px-4 py-3 font-semibold text-xs md:text-base">{category.name}</td>
              <td className="px-4 py-3 text-xs">{category.description || '-'}</td>
              <td className="px-4 py-3">
                <div className="rounded-full w-max text-nowrap bg-emerald-200 text-emerald-800 border-emerald-300 border-2 px-3 py-1 text-xs font-medium">
                  {Number(category.productCount ?? 0)} sản phẩm
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" className="bg-blue-500 hover:bg-blue-400 text-white" size="sm" onClick={() => onEdit?.(category)}>
                    Sửa
                  </Button>
                  <Button variant="danger" className="bg-red-500 hover:bg-red-400 text-white" size="sm" onClick={() => onDelete?.(category)}>
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
