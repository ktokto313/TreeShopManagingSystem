import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from '../components/global/Container'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { useAuth } from '../context/AuthContext'
import CatalogProductCard from '../features/catalog/components/CatalogProductCard'
import { loadPublicJson } from '../features/catalog/utils/catalogApi'
import { matchesCatalogFilters, sortCatalogProducts } from '../features/catalog/utils/catalogUtils'

const emptyFilters = {
  keyword: '',
  categoryId: '',
  status: '',
  minPrice: '',
  maxPrice: '',
  sort: 'latest',
}

const sortOptions = [
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'rating', label: 'Được quan tâm' },
  { value: 'latest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá tăng dần' },
  { value: 'price-desc', label: 'Giá giảm dần' },
]

const statusOptions = [
  { value: '', label: 'Tất cả tình trạng' },
  { value: 'true', label: 'Chỉ còn hàng' },
  { value: 'false', label: 'Chỉ hết hàng' },
]

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

function getPageNumbers(currentPage, totalPages) {
  const startPage = Math.max(1, currentPage - 2)
  const endPage = Math.min(totalPages, currentPage + 2)

  return Array.from({ length: Math.max(0, endPage - startPage + 1) }, (_, index) => startPage + index)
}

export default function CatalogPage() {
  const navigate = useNavigate()
  const { logout, isAuthenticated } = useAuth()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [showFilters, setShowFilters] = useState(true)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  function handleAuthError(error) {
    if (error?.status !== 401) {
      return false
    }

    if (isAuthenticated) {
      logout()
      navigate('/login', { replace: true, state: { from: { pathname: '/catalog' } } })
    } else {
      setNotice('Không thể tải catalog lúc này.')
    }

    return true
  }

  useEffect(() => {
    void loadCatalogData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [filters.keyword, filters.categoryId, filters.status, filters.minPrice, filters.maxPrice, filters.sort])

  async function loadCatalogData() {
    setLoading(true)
    setNotice('')

    try {
      const [categoryData, productData] = await Promise.all([
        loadPublicJson('/api/categories'),
        loadPublicJson('/api/products'),
      ])
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

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / itemsPerPage))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return visibleProducts.slice(startIndex, startIndex + itemsPerPage)
  }, [currentPage, visibleProducts])

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
  const pageNumbers = getPageNumbers(currentPage, totalPages)

  function clearFilters() {
    setFilters(emptyFilters)
  }

  function openDetail(product) {
    navigate(`/catalog/${product.id}`, { state: { product } })
  }

  const displayStart = visibleProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const displayEnd = Math.min(currentPage * itemsPerPage, visibleProducts.length)

  return (
    <main className="bg-[var(--social-bg)]/50">
      <section className="bg-gradient-to-br from-emerald-50 via-white to-lime-50">
        <Container className="py-14 lg:py-20">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[var(--text-h)] sm:text-5xl">
                Khám phá cây xanh phù hợp cho nhà ở, bàn làm việc và góc thư giãn
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--text)]">
                Tìm cây theo nhu cầu, xem ảnh và mở chi tiết khi muốn biết thêm mô tả, biến thể
                hoặc thông tin mua hàng.
              </p>
            </div>

          </div>
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
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-[var(--text-h)]">Bộ lọc sản phẩm</h2>
                </div>

                <Input
                  label="Từ khóa"
                  value={filters.keyword}
                  placeholder="Tên, mô tả, danh mục..."
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
                  label="Tình trạng kho"
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
                    <p className="text-sm text-[var(--text)]">Chọn nhanh một danh mục để lọc theo nhóm.</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {categoryCounts.map((category) => (
                    <Button
                      key={category.id || 'all'}
                      variant={
                        String(filters.categoryId) === String(category.id) ? 'primary' : 'secondary'
                      }
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
                      variant={
                        String(filters.categoryId) === String(category.id) ? 'primary' : 'secondary'
                      }
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
                  <h2 className="text-xl font-semibold text-[var(--text-h)]">Danh sách sản phẩm</h2>
                  <p className="text-sm text-[var(--text)]">
                    Hiển thị {displayStart}-{displayEnd} trên {visibleProducts.length} sản phẩm phù hợp
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
                {paginatedProducts.map((product) => (
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

              {visibleProducts.length > itemsPerPage ? (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
                  <div className="text-sm text-[var(--text)]">
                    Trang {currentPage} / {totalPages}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
                    >
                      Trước
                    </Button>
                    {pageNumbers.map((pageNumber) => (
                      <Button
                        key={pageNumber}
                        variant={pageNumber === currentPage ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    ))}
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              ) : null}
            </Card>
          </section>
        </div>
      </Container>
    </main>
  )
}
