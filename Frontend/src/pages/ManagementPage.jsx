import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from '../components/global/Container'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import { useAuth } from '../context/AuthContext'
import CategoryForm from '../features/categories/components/CategoryForm'
import CategoryTable from '../features/categories/components/CategoryTable'
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../features/categories/categoryApi'
import ProductForm from '../features/products/components/ProductForm'
import ProductTable from '../features/products/components/ProductTable'
import {
  createProduct,
  deactivateProduct,
  getProducts,
  updateProduct,
} from '../features/products/productApi'

const emptyCategoryForm = { id: '', name: '', description: '' }
const emptyProductForm = {
  id: '',
  categoryId: '',
  name: '',
  price: '',
  stock: 0,
  status: true,
  sku: '',
  description: '',
  variants: '',
  images: [],
}
const emptyFilters = { keyword: '', categoryId: '', status: '' }

export default function ManagementPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm)
  const [productForm, setProductForm] = useState(emptyProductForm)
  const [filters, setFilters] = useState(emptyFilters)
  const [activeTab, setActiveTab] = useState('categories')
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')

  function handleAuthError(error) {
    if (error?.status !== 401) {
      return false
    }

    logout()
    navigate('/login', { replace: true, state: { from: { pathname: '/manage' } } })
    return true
  }

  const categoryLookup = useMemo(() => {
    return new Map(categories.map((category) => [String(category.id), category.name]))
  }, [categories])

  const productsWithCategoryName = useMemo(() => {
    return products.map((product) => ({
      ...product,
      categoryName: categoryLookup.get(String(product.categoryId)) || '',
    }))
  }, [products, categoryLookup])

  useEffect(() => {
    void loadInitialData()
  }, [])

  async function loadInitialData() {
    setLoading(true)
    setNotice('')

    try {
      const [categoryData, productData] = await Promise.all([getCategories(), getProducts()])
      setCategories(Array.isArray(categoryData) ? categoryData : [])
      setProducts(Array.isArray(productData) ? productData : [])
    } catch (error) {
      if (handleAuthError(error)) {
        return
      }
      setNotice(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadCategories() {
    setLoading(true)
    try {
      const categoryData = await getCategories()
      setCategories(Array.isArray(categoryData) ? categoryData : [])
    } catch (error) {
      if (handleAuthError(error)) {
        return
      }
      setNotice(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadProducts(nextFilters = filters) {
    setLoading(true)
    try {
      const productData = await getProducts(nextFilters)
      setProducts(Array.isArray(productData) ? productData : [])
    } catch (error) {
      if (handleAuthError(error)) {
        return
      }
      setNotice(error.message)
    } finally {
      setLoading(false)
    }
  }

  function resetCategoryForm() {
    setCategoryForm(emptyCategoryForm)
  }

  function resetProductForm() {
    setProductForm(emptyProductForm)
  }

  function openCreateCategoryModal() {
    resetCategoryForm()
    setActiveTab('categories')
    setIsCategoryModalOpen(true)
  }

  function openEditCategoryModal(category) {
    setActiveTab('categories')
    setCategoryForm({
      id: category.id,
      name: category.name ?? '',
      description: category.description ?? '',
    })
    setIsCategoryModalOpen(true)
  }

  function closeCategoryModal() {
    setIsCategoryModalOpen(false)
  }

  function openCreateProductModal() {
    resetProductForm()
    setActiveTab('products')
    setIsProductModalOpen(true)
  }

  function openEditProductModal(product) {
    setActiveTab('products')
    setProductForm({
      id: product.id,
      categoryId: product.categoryId ?? '',
      name: product.name ?? '',
      price: product.price ?? '',
      stock: product.stock ?? 0,
      status: Boolean(product.status),
      sku: product.sku ?? '',
      description: product.description ?? '',
      variants: product.variants ?? '',
      images: parseImageList(product.images),
    })
    setIsProductModalOpen(true)
  }

  function closeProductModal() {
    setIsProductModalOpen(false)
  }

  function editCategory(category) {
    openEditCategoryModal(category)
  }

  function editProduct(product) {
    openEditProductModal(product)
  }

  async function saveCategory(event) {
    event.preventDefault()
    setNotice('')

    try {
      const payload = {
        name: categoryForm.name,
        description: categoryForm.description,
      }

      if (categoryForm.id) {
        await updateCategory(categoryForm.id, payload)
        setNotice('Category updated.')
      } else {
        await createCategory(payload)
        setNotice('Category created.')
      }

      resetCategoryForm()
      closeCategoryModal()
      await loadCategories()
      await loadProducts()
    } catch (error) {
      if (handleAuthError(error)) {
        return
      }
      setNotice(`Category save failed: ${error.message}`)
    }
  }

  async function saveProduct(event) {
    event.preventDefault()
    setNotice('')

    try {
      const payload = {
        categoryId: productForm.categoryId === '' ? null : Number(productForm.categoryId),
        name: productForm.name,
        price: productForm.price === '' ? null : Number(productForm.price),
        stock: Number(productForm.stock),
        status: productForm.status,
        sku: productForm.sku,
        description: productForm.description,
        variants: productForm.variants,
        images: productForm.images.length ? JSON.stringify(productForm.images) : null,
      }

      if (productForm.id) {
        await updateProduct(productForm.id, payload)
        setNotice('Product updated.')
      } else {
        await createProduct(payload)
        setNotice('Product created.')
      }

      resetProductForm()
      closeProductModal()
      await loadProducts()
      await loadCategories()
    } catch (error) {
      if (handleAuthError(error)) {
        return
      }
      setNotice(`Product save failed: ${error.message}`)
    }
  }

  async function removeCategory(category) {
    setNotice('')

    try {
      await deleteCategory(category.id)
      if (String(categoryForm.id) === String(category.id)) {
        resetCategoryForm()
        closeCategoryModal()
      }
      setNotice('Category deleted.')
      await loadCategories()
      await loadProducts()
    } catch (error) {
      if (handleAuthError(error)) {
        return
      }
      setNotice(`Category delete failed: ${error.message}`)
    }
  }

  async function deactivateSelectedProduct(product) {
    setNotice('')

    try {
      await deactivateProduct(product.id)
      if (String(productForm.id) === String(product.id)) {
        resetProductForm()
        closeProductModal()
      }
      setNotice('Product deactivated.')
      await loadProducts()
    } catch (error) {
      if (handleAuthError(error)) {
        return
      }
      setNotice(`Product deactivate failed: ${error.message}`)
    }
  }

  async function applyFilters(event) {
    event.preventDefault()
    await loadProducts(filters)
  }

  function clearFilters() {
    const nextFilters = emptyFilters
    setFilters(nextFilters)
    void loadProducts(nextFilters)
  }

  function parseImageList(value) {
    if (!value) {
      return []
    }

    if (Array.isArray(value)) {
      return value
    }

    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return [String(value)]
    }
  }

  return (
    <main className="bg-[var(--social-bg)]/70">
      <Container className="py-10">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge status="active" className="bg-emerald-100 text-emerald-700">
              Manager workspace
            </Badge>
            <h1 className="text-3xl font-semibold text-[var(--text-h)]">
              Category and Product CRUD
            </h1>
            <p className="max-w-3xl text-sm text-[var(--text)]">
              Trang quản lý tách riêng khỏi trang chủ. Nếu thấy 401, backend auth/session vẫn
              cần được đồng bộ trước khi test CRUD đầy đủ.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge status={loading ? 'inactive' : 'active'}>
              {loading ? 'Loading' : 'Ready'}
            </Badge>
            <Button variant="secondary" onClick={() => void loadCategories()}>
              Refresh categories
            </Button>
            <Button variant="secondary" onClick={() => void loadProducts()}>
              Refresh products
            </Button>
          </div>
        </div>

        {notice ? (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {notice}
          </div>
        ) : null}

        <div className="mb-6 flex gap-2">
          <Button
            variant={activeTab === 'categories' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </Button>
          <Button
            variant={activeTab === 'products' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('products')}
          >
            Products
          </Button>
        </div>

        <section className={activeTab === 'categories' ? 'block' : 'hidden'}>
          <div className="space-y-6">
            <Card className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-[var(--text-h)]">Category table</h2>
                  <p className="text-sm text-[var(--text)]">
                    Use the modal to create or edit a category.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={openCreateCategoryModal}>New category</Button>
                  <span className="text-sm text-[var(--text)]">{categories.length} rows</span>
                </div>
              </div>
              <CategoryTable
                categories={categories}
                onEdit={editCategory}
                onDelete={removeCategory}
              />
            </Card>
          </div>
        </section>

        <section className={activeTab === 'products' ? 'block' : 'hidden'}>
          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <Card className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-[var(--text-h)]">Product filters</h2>
                  <p className="text-sm text-[var(--text)]">
                    Filter the list, then open the modal to edit product details.
                  </p>
                </div>
                <span className="text-sm text-[var(--text)]">{products.length} rows</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={openCreateProductModal}>New product</Button>
                <Button variant="secondary" onClick={() => void loadProducts()}>
                  Refresh products
                </Button>
              </div>

              <form
                onSubmit={applyFilters}
                className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--social-bg)] p-4"
              >
                <input
                  value={filters.keyword}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, keyword: event.target.value }))
                  }
                  placeholder="Search keyword"
                  className="h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm text-[var(--text-h)] outline-none"
                />
                <select
                  value={filters.categoryId}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, categoryId: event.target.value }))
                  }
                  className="h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm text-[var(--text-h)] outline-none"
                >
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.status}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, status: event.target.value }))
                  }
                  className="h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm text-[var(--text-h)] outline-none"
                >
                  <option value="">All statuses</option>
                  <option value="true">Active only</option>
                  <option value="false">Inactive only</option>
                </select>
                <div className="flex gap-2">
                  <Button type="submit">Apply</Button>
                  <Button type="button" variant="secondary" onClick={clearFilters}>
                    Clear
                  </Button>
                </div>
              </form>
            </Card>

            <Card className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-[var(--text-h)]">Product table</h2>
                  <p className="text-sm text-[var(--text)]">
                    Detail fields are shown in the modal and summarized in the table.
                  </p>
                </div>
                <span className="text-sm text-[var(--text)]">{products.length} rows</span>
              </div>

              <ProductTable
                products={productsWithCategoryName}
                onEdit={openEditProductModal}
                onDeactivate={deactivateSelectedProduct}
              />
            </Card>
          </div>
        </section>
      </Container>

      <Modal
        open={isCategoryModalOpen}
        onClose={() => {
          closeCategoryModal()
        }}
      >
        <div className="space-y-5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-[var(--text-h)]">
                {categoryForm.id ? 'Edit category' : 'Create category'}
              </h2>
              <p className="text-sm text-[var(--text)]">
                Update the category name and description in one focused view.
              </p>
            </div>
            {categoryForm.id ? (
              <Badge status="active" className="bg-emerald-100 text-emerald-700">
                ID {categoryForm.id}
              </Badge>
            ) : null}
          </div>

          <CategoryForm
            values={categoryForm}
            onChange={(name, value) =>
              setCategoryForm((current) => ({
                ...current,
                [name]: value,
              }))
            }
            onSubmit={saveCategory}
          />

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={resetCategoryForm}>
              Clear
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                resetCategoryForm()
                closeCategoryModal()
              }}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={isProductModalOpen}
        onClose={() => {
          closeProductModal()
        }}
      >
        <div className="space-y-5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-[var(--text-h)]">
                {productForm.id ? 'Edit product' : 'Create product'}
              </h2>
              <p className="text-sm text-[var(--text)]">
                Update the product and its details in one focused view.
              </p>
            </div>
            {productForm.id ? (
              <Badge status="active" className="bg-emerald-100 text-emerald-700">
                ID {productForm.id}
              </Badge>
            ) : null}
          </div>

          <ProductForm
            values={productForm}
            categoryOptions={[
              { value: '', label: 'Select a category' },
              ...categories.map((category) => ({
                value: String(category.id),
                label: category.name,
              })),
            ]}
            onChange={(name, value) =>
              setProductForm((current) => ({
                ...current,
                [name]: value,
              }))
            }
            onSubmit={saveProduct}
          />

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={resetProductForm}>
              Clear
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                resetProductForm()
                closeProductModal()
              }}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  )
}
