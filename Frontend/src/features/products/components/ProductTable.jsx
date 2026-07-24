/*
 * Created By: MinhLTHE200133
 * Created At: 2026-06-03
 * Last Modified: 2026-07-15
 */
import { Button } from "../../../components/ui/Button";
import { formatCurrency, parseCatalogImages } from "../../catalog/utils/catalogUtils";
import ProductImageFrame from "./ProductImageFrame";
import ProductStatusBadge from "./ProductStatusBadge";
import { getProductAvailability } from "../utils/productAvailability";
import { resolveProductImageSource } from "../utils/productImageResolver";

function summarizeText(value, maxLength = 80) {
	if (!value) {
		return "-";
	}

	const stringValue = String(value);
	return stringValue.length > maxLength ? `${stringValue.slice(0, maxLength)}...` : stringValue;
}

function renderImagePreview(product) {
	const firstImage = parseCatalogImages(product.images)[0];
	const imageSource = resolveProductImageSource(firstImage);

	return (
		<ProductImageFrame
			src={imageSource}
			alt={product.name}
			className="h-12 w-12 rounded-md bg-blue-300"
			fallbackLabel={imageSource ? "Ảnh lỗi" : "Chưa có ảnh"}
		/>
	);
}

export default function ProductTable({ products = [], onEdit, onDeactivate }) {
	return (
		<div className="max-h-[70vh] overflow-auto rounded-lg border border-green-500">
			<table className="min-w-[1120px] w-full border-collapse text-left text-sm">
				<thead className="sticky top-0 z-10 bg-green-500 text-xs uppercase text-white">
					<tr>
						<th className="px-4 py-3 font-semibold">Ảnh</th>
						<th className="px-4 py-3 font-semibold">SKU</th>
						<th className="px-4 py-3 font-semibold">Sản phẩm</th>
						<th className="px-4 py-3 font-semibold">Danh mục</th>
						<th className="px-4 py-3 font-semibold">Chi tiết</th>
						<th className="px-4 py-3 font-semibold">Giá</th>
						<th className="px-4 py-3 font-semibold">Tồn kho</th>
						<th className="px-4 py-3 font-semibold">Tình trạng</th>
						<th className="px-4 py-3 text-center font-semibold">Thao tác</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-green-500">
					{products.map((product) => {
						const availability = getProductAvailability(product);

						return (
							<tr key={product.id}>
								<td className="px-4 py-3">{renderImagePreview(product)}</td>
								<td className="px-4 py-3 font-medium">{product.sku}</td>
								<td className="px-4 py-3">{product.name}</td>
								<td className="px-4 py-3">{product.categoryName || product.categoryId}</td>
								<td className="px-4 py-3">
									<div className="max-w-[24rem] space-y-1">
										<p>{summarizeText(product.description, 64)}</p>
									</div>
								</td>
								<td className="px-4 py-3">{formatCurrency(product.price)}</td>
								<td className="px-4 py-3">
									<div className="space-y-1">
										<div className="text-nowrap text-lg font-semibold text-green-700">{product.stock ?? 0}</div>
										<div className="text-nowrap text-xs">{availability.helper}</div>
									</div>
								</td>
								<td className="px-4 py-3 text-nowrap">
									<ProductStatusBadge product={product} />
								</td>
								<td className="px-4 py-3 text-nowrap">
									<div className="flex justify-end gap-2">
										<Button className="bg-blue-500 hover:bg-blue-400" onClick={() => onEdit?.(product)}>
											Sửa
										</Button>
										<Button 
											className={product.status ? "bg-red-500 hover:bg-red-400" : "bg-green-600 hover:bg-green-500"}
											onClick={() => onDeactivate?.(product)}
										>
											{product.status ? "Ngừng bán" : "Kích hoạt"}
										</Button>
									</div>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
