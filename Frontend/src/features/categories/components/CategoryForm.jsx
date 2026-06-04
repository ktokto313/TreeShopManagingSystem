import Button from '../../../components/ui/Button'
import Form from '../../../components/ui/Form'
import Input from '../../../components/ui/Input'

export default function CategoryForm({
  values,
  errors = {},
  isSubmitting = false,
  onChange,
  onSubmit,
}) {
  function handleInputChange(event) {
    onChange?.(event.target.name, event.target.value)
  }

  return (
    <Form onSubmit={onSubmit}>
      <Input
        label="Tên danh mục"
        name="name"
        value={values.name}
        error={errors.name}
        onChange={handleInputChange}
      />
      <Input
        label="Mô tả"
        name="description"
        value={values.description}
        error={errors.description}
        onChange={handleInputChange}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Đang lưu...' : 'Lưu danh mục'}
      </Button>
    </Form>
  )
}
