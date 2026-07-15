/*
 * Created By: MinhLTHE200133
 * Created At: 2026-06-03
 * Last Modified: 2026-07-15
 */
// Created by minhlthe200133
import { Button } from "../../../components/ui/Button";

export default function CategoryTable({ categories = [], onEdit, onDelete }) {
	return (
		<div className="max-h-[65vh] overflow-auto rounded-lg border border-green-500">
			<table className="min-w-150 w-full border-collapse text-left text-sm">
				<thead className="sticky top-0 z-10 bg-green-500 text-base uppercase text-white">
					<tr className="text-nowrap">
						<th className="px-4 py-3 font-medium">Tên</th>
						<th className="px-4 py-3 font-medium">Mô tả</th>
						<th className="px-4 py-3 font-medium">Sản phẩm</th>
						<th className="px-4 py-3 text-right font-medium">Thao tác</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-green-500">
					{categories.map((category) => (
						<tr key={category.id}>
							<td className="px-4 py-3 text-xs font-semibold md:text-base">{category.name}</td>
							<td className="px-4 py-3 text-xs">{category.description || "-"}</td>
							<td className="px-4 py-3">
								<div className="w-max rounded-full border-2 border-emerald-300 bg-emerald-200 px-3 py-1 text-nowrap text-xs font-medium text-emerald-800">
									{Number(category.productCount ?? 0)} sản phẩm
								</div>
							</td>
							<td className="px-4 py-3">
								<div className="flex justify-end gap-2">
									<Button
										variant="secondary"
										className="bg-blue-500 text-white hover:bg-blue-400"
										size="sm"
										onClick={() => onEdit?.(category)}
									>
										Sửa
									</Button>
									<Button
										variant="danger"
										className="bg-red-500 text-white hover:bg-red-400"
										size="sm"
										onClick={() => onDelete?.(category)}
									>
										Xóa
									</Button>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
