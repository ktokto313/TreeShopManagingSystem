import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from '../components/global/Container'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { useAuth } from '../context/AuthContext'
import CatalogProductCard from '../features/catalog/components/CatalogProductCard'
import {
  formatCurrency,
  matchesCatalogFilters,
  parseCatalogImages,
  sortCatalogProducts,
} from '../features/catalog/utils/catalogUtils'
import { getCategories } from '../features/categories/categoryApi'
import { getProducts } from '../features/products/productApi'
import { summarizeVariantGroups } from '../features/products/utils/variantUtils'

const emptyFilters = {
  keyword: '',
  categoryId: '',
  status: '',
  minPrice: '',
  maxPrice: '',
  sort: 'latest',
}

const sortOptions = [
  { value: 'popular', label: 'Sort by popularity' },
  { value: 'rating', label: 'Sort by average rating' },
  { value: 'latest', label: 'Sort by latest' },
  { value: 'price-asc', label: 'Sort by price: low to high' },
  { value: 'price-desc', label: 'Sort by price: high to low' },
]

const statusOptions = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'true', label: 'Chỉ đang bán' },
  { value: 'false', label: 'Chỉ đã ẩn' },
]

function summarizeDescription(value, maxLength = 120) {
  if (!value) {
    return 'Chưa có mô tả.'
  }

  const stringValue = String(value)
  return stringValue.length > maxLength ? `${stringValue.slice(0, maxLength)}...` : stringValue
}

function getActiveFilterCount(filters) {
  return ['keyword', 'categoryId', 'status', 'minPrice', 'maxPrice']
    .map((key) => filters[key])
    .filter((value) => value !== '' && value !== null && value !== undefined).length
}

function toChipText(category) {
  if (!category) {
    return 'Tất cả'
  }

  return `${category.name} (${category.count})`
}

export default function CatalogPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [showFilters, setShowFilters] = useState(true)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  function handleAuthError(error) {
    if (error?.status !== 401) {
      return false
    }

    logout()
    navigate('/login', { replace: true, state: { from: { pathname: '/catalog' } } })
    return true
  }

  useEffect(() => {
    void loadCatalogData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadCatalogData() {
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

  const categoryLookup = useMemo(
    () => new Map(categories.map((category) => [String(category.id), category.name])),
    [categories],
  )

  const productsWithCategoryName = useMemo(() => {
    return products.map((product) => ({
      ...product,
      categoryName: categoryLookup.get(String(product.categoryId)) || '',
    }))
  }, [products, categoryLookup])

  const visibleProducts = useMemo(() => {
    const filteredProducts = productsWithCategoryName.filter((product) =>
      matchesCatalogFilters(product, filters, product.categoryName),
    )

    return sortCatalogProducts(filteredProducts, filters.sort)
  }, [filters, productsWithCategoryName])

  const categoryCounts = useMemo(() => {
    return [
      { id: '', name: 'Tất cả', count: productsWithCategoryName.length },
      ...categories.map((category) => ({
        ...category,
        count: productsWithCategoryName.filter(
          (product) => String(product.categoryId) === String(category.id),
        ).length,
      })),
    ]
  }, [categories, productsWithCategoryName])

  const activeFilterCount = getActiveFilterCount(filters)

  function clearFilters() {
    setFilters(emptyFilters)
  }

  function openDetail(product) {
    setSelectedProduct(product)
    setIsDetailOpen(true)
  }

  function closeDetail() {
    setIsDetailOpen(false)
    setSelectedProduct(null)
  }

  return (
    <main className="bg-[var(--social-bg)]/50">
      <section className="bg-gradient-to-br from-emerald-50 via-white to-lime-50">
        <Container className="grid gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
          <div className="space-y-6">
            <Badge status="active" className="bg-emerald-100 text-emerald-700">
              Trải nghiệm khách hàng
            </Badge>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[var(--text-h)] sm:text-5xl">
                Khám phá cây xanh và lọc sản phẩm theo nhu cầu
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--text)]">
                Trang catalog riêng cho khách hàng: tìm theo từ khóa, danh mục, trạng thái, khoảng
                giá và xem chi tiết sản phẩm trong một giao diện gọn gàng.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setShowFilters((current) => !current)}>
                {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
              </Button>
              <Button variant="secondary" onClick={() => void loadCatalogData()}>
                Làm mới dữ liệu
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="space-y-1 border-emerald-100 bg-white/95 p-4">
                <div className="text-2xl font-semibold text-[var(--text-h)]">{products.length}</div>
                <div className="text-sm text-[var(--text)]">sản phẩm</div>
              </Card>
              <Card className="space-y-1 border-emerald-100 bg-white/95 p-4">
                <div className="text-2xl font-semibold text-[var(--text-h)]">
                  {visibleProducts.length}
                </div>
                <div className="text-sm text-[var(--text)]">kết quả lọc</div>
              </Card>
              <Card className="space-y-1 border-emerald-100 bg-white/95 p-4">
                <div className="text-2xl font-semibold text-[var(--text-h)]">
                  {categories.length}
                </div>
                <div className="text-sm text-[var(--text)]">danh mục</div>
              </Card>
            </div>
          </div>

          <Card className="space-y-5 border-emerald-100 bg-white/95 p-6 shadow-lg">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">
                Tìm kiếm nhanh
              </p>
              <h2 className="text-2xl font-semibold text-[var(--text-h)]">
                Bộ lọc thân thiện cho khách hàng
              </h2>
              <p className="text-sm text-[var(--text)]">
                Dùng bộ lọc để thu hẹp sản phẩm theo tiêu chí cần xem trước khi mở chi tiết.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                'Tìm nhanh theo tên, SKU, mô tả và danh mục',
                'Lọc theo giá, trạng thái và nhóm danh mục',
                'Mở chi tiết để xem mô tả, biến thể và ảnh',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-[var(--border)] bg-[var(--social-bg)] px-4 py-3 text-sm text-[var(--text-h)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </Card>
        </Container>
      </section>

      <Container className="py-10">
        {notice ? (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {notice}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {showFilters ? (
            <aside className="space-y-6">
              <Card className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-[var(--text-h)]">
                      Bộ lọc sản phẩm
                    </h2>
                  </div>
                  <Badge status={loading ? 'inactive' : 'active'}>
                    {loading ? 'Đang tải' : 'Sẵn sàng'}
                  </Badge>
                </div>

                <Input
                  label="Từ khóa"
                  value={filters.keyword}
                  placeholder="Tên, SKU, mô tả..."
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, keyword: event.target.value }))
                  }
                />

                <Select
                  label="Danh mục"
                  value={filters.categoryId}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, categoryId: event.target.value }))
                  }
                  options={[
                    { value: '', label: 'Tất cả danh mục' },
                    ...categories.map((category) => ({
                      value: String(category.id),
                      label: category.name,
                    })),
                  ]}
                />

                <Select
                  label="Trạng thái"
                  value={filters.status}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, status: event.target.value }))
                  }
                  options={statusOptions}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Giá tối thiểu"
                    type="number"
                    min="0"
                    value={filters.minPrice}
                    placeholder="0"
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, minPrice: event.target.value }))
                    }
                  />
                  <Input
                    label="Giá tối đa"
                    type="number"
                    min="0"
                    value={filters.maxPrice}
                    placeholder="1000000"
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, maxPrice: event.target.value }))
                    }
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={clearFilters}>
                    Xóa lọc
                  </Button>
                  <Button variant="secondary" onClick={() => setShowFilters(false)}>
                    Ẩn bộ lọc
                  </Button>
                </div>
              </Card>

              <Card className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-[var(--text-h)]">Danh mục</h2>
                    <p className="text-sm text-[var(--text)]">
                      Chọn nhanh một danh mục để lọc theo nhóm.
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
                    {activeFilterCount} bộ lọc
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {categoryCounts.map((category) => (
                    <Button
                      key={category.id || 'all'}
                      variant={String(filters.categoryId) === String(category.id) ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() =>
                        setFilters((current) => ({
                          ...current,
                          categoryId: String(category.id ?? ''),
                        }))
                      }
                    >
                      {toChipText(category)}
                    </Button>
                  ))}
                </div>
              </Card>
            </aside>
          ) : (
            <aside className="space-y-4">
              <Button variant="secondary" onClick={() => setShowFilters(true)}>
                Hiện bộ lọc
              </Button>
              <Card className="space-y-2">
                <h2 className="text-lg font-semibold text-[var(--text-h)]">Danh mục</h2>
                <div className="flex flex-wrap gap-2">
                  {categoryCounts.map((category) => (
                    <Button
                      key={category.id || 'all'}
                      variant={String(filters.categoryId) === String(category.id) ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() =>
                        setFilters((current) => ({
                          ...current,
                          categoryId: String(category.id ?? ''),
                        }))
                      }
                    >
                      {toChipText(category)}
                    </Button>
                  ))}
                </div>
              </Card>
            </aside>
          )}

          <section className="space-y-6">
            <Card className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-[var(--text-h)]">
                    Danh sách sản phẩm
                  </h2>
                  <p className="text-sm text-[var(--text)]">
                    {visibleProducts.length} sản phẩm phù hợp với bộ lọc hiện tại
                  </p>
                </div>

                <div className="min-w-56">
                  <Select
                    label="Sắp xếp"
                    value={filters.sort}
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, sort: event.target.value }))
                    }
                    options={sortOptions}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visibleProducts.map((product) => (
                  <CatalogProductCard
                    key={product.id}
                    product={product}
                    categoryName={product.categoryName}
                    onOpen={openDetail}
                  />
                ))}
              </div>

              {visibleProducts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--social-bg)] px-4 py-10 text-center text-sm text-[var(--text)]">
                  Chưa tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.
                </div>
              ) : null}
            </Card>
          </section>
        </div>
      </Container>

      <Modal
        open={isDetailOpen}
        onClose={() => {
          closeDetail()
        }}
      >
        <div className="space-y-5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-[var(--text-h)]">
                {selectedProduct?.name || 'Chi tiết sản phẩm'}
              </h2>
              <p className="text-sm text-[var(--text)]">
                Xem nhanh mô tả, biến thể, ảnh và thông tin bán hàng.
              </p>
            </div>
            {selectedProduct ? (
              <Badge status={selectedProduct.status ? 'active' : 'inactive'}>
                {selectedProduct.status ? 'Đang bán' : 'Đã ẩn'}
              </Badge>
            ) : null}
          </div>

          {selectedProduct ? (
            <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
              <div className="space-y-3">
                <div className="flex h-56 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 via-white to-lime-100 text-6xl">
                  🌿
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--social-bg)] p-4 text-sm text-[var(--text)]">
                  <div className="font-medium text-[var(--text-h)]">Ảnh đã tải lên</div>
                  <div className="mt-2 space-y-1">
                    {parseCatalogImages(selectedProduct.images).length ? (
                      parseCatalogImages(selectedProduct.images).map((image) => (
                        <div key={image} className="rounded-md bg-white px-3 py-2">
                          {image}
                        </div>
                      ))
                    ) : (
                      <div>Chưa có ảnh nào.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoBox label="SKU" value={selectedProduct.sku} />
                  <InfoBox label="Danh mục" value={selectedProduct.categoryName || '-'} />
                  <InfoBox label="Giá" value={formatCurrency(selectedProduct.price)} />
                  <InfoBox label="Tồn kho" value={selectedProduct.stock ?? 0} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                    Mô tả
                  </h3>
                  <p className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 text-sm leading-7 text-[var(--text)]">
                    {summarizeDescription(selectedProduct.description, 360)}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                    Biến thể
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {summarizeVariantGroups(selectedProduct.variants).length ? (
                      summarizeVariantGroups(selectedProduct.variants).map((group) => (
                        <span
                          key={group.name}
                          className="rounded-full bg-[var(--social-bg)] px-3 py-1.5 text-sm text-[var(--text-h)]"
                        >
                          {group.name}: {group.count}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full bg-[var(--social-bg)] px-3 py-1.5 text-sm text-[var(--text-h)]">
                        Chưa có biến thể
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button variant="secondary" onClick={closeDetail}>
              Đóng
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  )
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-[var(--accent)]">{label}</div>
      <div className="mt-2 text-sm font-medium text-[var(--text-h)]">{value}</div>
    </div>
  )
}
