// Created by minhlthe200133
import {Button} from '../../../components/ui/Button'
import {Form} from '../../../components/ui/Form'
import {Input} from '../../../components/ui/Input'
import {Select} from '../../../components/ui/Select'
import {Textarea} from '../../../components/ui/Textarea'

export default function ProductForm({
  values,
  errors = {},
  categoryOptions = [],
  isSubmitting = false,
  onChange,
  onSubmit,
  children,
}) {
  function handleInputChange(event) {
    const { name, value, type, checked } = event.target
    onChange?.(name, type === 'checkbox' ? checked : value)
  }

  function handleImageChange(event) {
    const files = Array.from(event.target.files || [])
    onChange?.('imageFiles', files)
    onChange?.(
      'images',
      files.map((file) => file.name),
    )
  }

  return (
    <Form onSubmit={onSubmit}>
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
        label="Mô tả"
        name="description"
        maxLength={1000}
        value={values.description}
        error={errors.description}
        placeholder="Mô tả chi tiết sản phẩm"
        onChange={handleInputChange}
      />
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
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageChange}
          />
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
          <input
            name="status"
            type="checkbox"
            checked={Boolean(values.status)}
            onChange={handleInputChange}
          />
          Đang hoạt động
        </label>
        <p className="text-sm text-[var(--text)]">
          Sản phẩm chỉ mua được khi đang hoạt động và tồn kho lớn hơn 0.
        </p>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
        </Button>
        {children}
      </div>
    </Form>
  )
}
