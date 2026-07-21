/*
 * Created By: MinhLTHE200133
 * Created At: 2026-06-03
 * Last Modified: 2026-07-15
 */
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { Button } from "../../../components/ui/Button";
import { Form } from "../../../components/ui/Form";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Textarea } from "../../../components/ui/Textarea";

export default function ProductForm({
  values,
  errors = {},
  categoryOptions = [],
  isSubmitting = false,
  onChange,
  onSubmit,
}) {
	function handleInputChange(event) {
		const { name, value, type, checked } = event.target;
		onChange?.(name, type === "checkbox" ? checked : value);
	}

	function handleImageChange(event) {
		const files = Array.from(event.target.files || []);
		onChange?.("imageFiles", files);
		onChange?.(
			"images",
			files.map((file) => file.name),
		);
	}

	return (
		<Form onSubmit={onSubmit} className="gap-5">
			<Input
				label="Tên sản phẩm"
				name="name"
				required
				maxLength={200}
				value={values.name}
				error={errors.name}
				onChange={handleInputChange}
			/>
			<Input
				label="Mã SKU"
				name="sku"
				required
				maxLength={50}
				pattern="[A-Za-z0-9_-]+"
				value={values.sku}
				error={errors.sku}
				onChange={handleInputChange}
			/>
			<Select
				label="Danh mục"
				name="categoryId"
				required
				value={values.categoryId}
				error={errors.categoryId}
				options={categoryOptions}
				onChange={handleInputChange}
			/>
			<Textarea
				label="Mô tả ngắn"
				name="description"
				maxLength={1000}
				value={values.description}
				error={errors.description}
				placeholder="Mô tả ngắn cho sản phẩm"
				onChange={handleInputChange}
			/>
			<div className="space-y-3">
				<div className="space-y-1">
					<label className="block text-sm font-medium text-[var(--text-h)]">Nội dung markdown</label>
					<p className="text-sm text-[var(--text)]">
						Dùng cho đoạn văn dài, tiêu đề, danh sách và ảnh xen giữa các đoạn mô tả.
					</p>
				</div>

				<div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
					<div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
						<div className="border-b border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-h)]">
							Trình soạn thảo
						</div>
						<div data-color-mode="light">
							<MDEditor
								height={280}
								value={values.content ?? ""}
								onChange={(nextValue) => onChange?.("content", nextValue ?? "")}
								preview="edit"
							/>
						</div>
					</div>

					<div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
						<div className="border-b border-[var(--border)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-h)]">
							Xem trước
						</div>
						<div className="max-h-[280px] overflow-auto px-4 py-3 text-green-950">
							<MDEditor.Markdown
								source={values.content?.trim() || "Nội dung markdown sẽ hiển thị ở đây."}
								style={{
									backgroundColor: "transparent",
									color: "#14532d",
								}}
							/>
						</div>
					</div>
				</div>
				{errors.content ? <p className="text-sm text-red-600">{errors.content}</p> : null}
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Textarea
					label="Hướng dẫn chăm sóc"
					name="careGuide"
					maxLength={1000}
					value={values.careGuide}
					error={errors.careGuide}
					placeholder="Mô tả cách chăm, vị trí đặt và lưu ý cơ bản"
					onChange={handleInputChange}
				/>
				<Input
					label="Ánh sáng"
					name="sunlightLevel"
					maxLength={255}
					value={values.sunlightLevel}
					error={errors.sunlightLevel}
					placeholder="Ví dụ: Ánh sáng gián tiếp"
					onChange={handleInputChange}
				/>
				<Input
					label="Tần suất tưới"
					name="wateringFrequency"
					maxLength={255}
					value={values.wateringFrequency}
					error={errors.wateringFrequency}
					placeholder="Ví dụ: 1 lần/tuần"
					onChange={handleInputChange}
				/>
				<Input
					label="Độ khó chăm"
					name="difficulty"
					maxLength={255}
					value={values.difficulty}
					error={errors.difficulty}
					placeholder="Ví dụ: Dễ"
					onChange={handleInputChange}
				/>
				<Input
					label="Phong thủy"
					name="fengShuiElement"
					maxLength={255}
					value={values.fengShuiElement}
					error={errors.fengShuiElement}
					placeholder="Ví dụ: Mộc"
					onChange={handleInputChange}
				/>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<Input
					label="Giá"
					name="price"
					type="number"
					required
					min="1"
					step="1"
					value={values.price}
					error={errors.price}
					onChange={handleInputChange}
				/>
				<Input
					label="Tồn kho"
					name="stock"
					type="number"
					required
					min="0"
					step="1"
					value={values.stock}
					error={errors.stock}
					onChange={handleInputChange}
				/>
			</div>
			<div className="space-y-2">
				<span className="block text-sm font-medium text-[var(--text-h)]">Hình ảnh</span>
				<label className="inline-flex cursor-pointer items-center rounded-md border border-[var(--border)] bg-[var(--social-bg)] px-4 py-2 text-sm font-medium text-[var(--text-h)] transition hover:bg-[var(--border)]">
					Tải ảnh lên
					<input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
				</label>
				{Array.isArray(values.images) && values.images.length > 0 ? (
					<div className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)]">
						<div className="font-medium text-[var(--text-h)]">Tệp đã chọn</div>
						<ul className="mt-1 list-disc space-y-1 pl-5">
							{values.images.map((image) => (
								<li key={image}>{image}</li>
							))}
						</ul>
					</div>
				) : (
					<p className="text-sm text-[var(--text)]">Chưa chọn ảnh nào.</p>
				)}
				{errors.images ? <p className="text-sm text-red-600">{errors.images}</p> : null}
			</div>
			<div className="space-y-1">
				<label className="flex items-center gap-2 text-sm font-medium text-[var(--text-h)]">
					<input name="status" type="checkbox" checked={Boolean(values.status)} onChange={handleInputChange} />
					Đang hoạt động
				</label>
				<p className="text-sm text-[var(--text)]">
					Sản phẩm chỉ mua được khi đang hoạt động và tồn kho lớn hơn 0.
				</p>
			</div>
			<Button type="submit" disabled={isSubmitting}>
				{isSubmitting ? "Đang lưu..." : "Lưu sản phẩm"}
			</Button>
		</Form>
	);
}
