/*
 * Created By: MinhLTHE200133
 * Created At: 2026-06-03
 * Last Modified: 2026-07-15
 */

import { Button } from "../../../components/ui/Button";
import { Form } from "../../../components/ui/Form";
import { Input } from "../../../components/ui/Input";

export default function CategoryForm({
	values,
	errors = {},
	isSubmitting = false,
	onChange,
	onSubmit,
}) {
	function handleInputChange(event) {
		onChange?.(event.target.name, event.target.value);
	}

	return (
		<Form onSubmit={onSubmit} className="gap-4">
			<Input
				label="Tên danh mục"
				name="name"
				required
				maxLength={100}
				value={values.name}
				error={errors.name}
				onChange={handleInputChange}
			/>
			<Input
				label="Mô tả"
				name="description"
				maxLength={1000}
				value={values.description}
				error={errors.description}
				onChange={handleInputChange}
			/>
			<div className="pt-4 pb-2">
				<Button type="submit" disabled={isSubmitting} className="w-full py-3 text-base font-semibold">
					{isSubmitting ? "Đang lưu..." : "Lưu danh mục"}
				</Button>
			</div>
		</Form>
	);
}
