import Button from '../../../components/ui/Button'
import Form from '../../../components/ui/Form'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import Textarea from '../../../components/ui/Textarea'

export default function ProductForm({
  values,
  errors = {},
  categoryOptions = [],
  isSubmitting = false,
  onChange,
  onSubmit,
}) {
  function handleInputChange(event) {
    const { name, value, type, checked } = event.target
    onChange?.(name, type === 'checkbox' ? checked : value)
  }

  function handleImageChange(event) {
    const files = Array.from(event.target.files || [])
    onChange?.(
      'images',
      files.map((file) => file.name),
    )
  }

  return (
    <Form onSubmit={onSubmit}>
      <Input
        label="Product name"
        name="name"
        value={values.name}
        error={errors.name}
        onChange={handleInputChange}
      />
      <Input
        label="SKU"
        name="sku"
        value={values.sku}
        error={errors.sku}
        onChange={handleInputChange}
      />
      <Select
        label="Category"
        name="categoryId"
        value={values.categoryId}
        error={errors.categoryId}
        options={categoryOptions}
        onChange={handleInputChange}
      />
      <Textarea
        label="Description"
        name="description"
        value={values.description}
        error={errors.description}
        placeholder="Product detail description"
        onChange={handleInputChange}
      />
      <Textarea
        label="Variants"
        name="variants"
        value={values.variants}
        error={errors.variants}
        placeholder="Enter variants as plain text or JSON string"
        onChange={handleInputChange}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Price"
          name="price"
          type="number"
          min="0"
          value={values.price}
          error={errors.price}
          onChange={handleInputChange}
        />
        <Input
          label="Stock"
          name="stock"
          type="number"
          min="0"
          value={values.stock}
          error={errors.stock}
          onChange={handleInputChange}
        />
      </div>
      <div className="space-y-2">
        <span className="block text-sm font-medium text-[var(--text-h)]">Images</span>
        <label className="inline-flex cursor-pointer items-center rounded-md border border-[var(--border)] bg-[var(--social-bg)] px-4 py-2 text-sm font-medium text-[var(--text-h)] transition hover:bg-[var(--border)]">
          Upload images
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
            <div className="font-medium text-[var(--text-h)]">Selected files</div>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {values.images.map((image) => (
                <li key={image}>{image}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-[var(--text)]">No image selected yet.</p>
        )}
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-h)]">
        <input
          name="status"
          type="checkbox"
          checked={Boolean(values.status)}
          onChange={handleInputChange}
        />
        Active
      </label>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save product'}
      </Button>
    </Form>
  )
}
