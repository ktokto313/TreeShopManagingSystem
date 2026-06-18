import { useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {Container} from '../components/global/Container'
import {Button} from '../components/ui/Button'
import {Card} from '../components/ui/Card'
import {Input} from '../components/ui/Input'
import {Select} from '../components/ui/Select'
import { AuthContext } from '../context/AuthContext'
import CatalogProductCard from '../features/catalog/components/CatalogProductCard'
import { loadPublicJson } from '../features/catalog/utils/catalogApi'
import { matchesCatalogFilters, sortCatalogProducts } from '../features/catalog/utils/catalogUtils'
import { sortCategories } from '../utils/categorySort'
import { cn } from '../utils/cn'
import bg from "../features/catalog/images/catalog-bg.jpg"

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
  { value: 'true', label: 'Còn hàng' },
  { value: 'false', label: 'Hết hàng' },
]

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
  const { categoryId: routeCategoryId } = useParams()
  const { logout, isAuthenticated, canManage } = useContext(AuthContext);
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [filters, setFilters] = useState(() => ({
    ...emptyFilters,
    categoryId: routeCategoryId ?? '',
  }))
  const [showFilters, setShowFilters] = useState(true)
  const [notice, setNotice] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

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

  async function loadCatalogData() {
    setNotice('')

    try {
      const [categoryData, productData] = await Promise.all([
        loadPublicJson('/api/categories'),
        loadPublicJson('/api/products'),
      ])
      setCategories(Array.isArray(categoryData) ? sortCategories(categoryData) : [])
      setProducts(Array.isArray(productData) ? productData : [])
    } catch (error) {
      if (handleAuthError(error)) {
        return
      }
      setNotice(error.message)
    }
  }

  function updateFilter(name, value) {
    setCurrentPage(1)
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function selectCategory(categoryId) {
    const nextCategoryId = String(categoryId ?? '')
    setCurrentPage(1)
    setFilters((current) => ({ ...current, categoryId: nextCategoryId }))
    navigate(nextCategoryId ? `/catalog/category/${nextCategoryId}` : '/catalog')
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCatalogData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const nextCategoryId = routeCategoryId ?? ''
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters((current) => (
      String(current.categoryId) === String(nextCategoryId)
        ? current
        : { ...current, categoryId: nextCategoryId }
    ))
    setCurrentPage(1)
  }, [routeCategoryId])

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
  const effectiveCurrentPage = Math.min(currentPage, totalPages)

  const paginatedProducts = useMemo(() => {
    const startIndex = (effectiveCurrentPage - 1) * itemsPerPage
    return visibleProducts.slice(startIndex, startIndex + itemsPerPage)
  }, [effectiveCurrentPage, visibleProducts])

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

  const pageNumbers = getPageNumbers(effectiveCurrentPage, totalPages)
  const selectedCategory = categories.find(
    (category) => String(category.id) === String(filters.categoryId),
  )

  function clearFilters() {
    setFilters(emptyFilters)
    setCurrentPage(1)
    navigate('/catalog')
  }

  function openDetail(product) {
    navigate(`/catalog/${product.id}`, { state: { product } })
  }

  function openEditProduct(product) {
    navigate('/manage', { state: { editProduct: product } })
  }

  function previewAddToCart(product) {
    setNotice(`${product.name} có thể thêm vào giỏ hàng khi luồng mua hàng được bật.`)
  }

  const displayStart = visibleProducts.length === 0 ? 0 : (effectiveCurrentPage - 1) * itemsPerPage + 1
  const displayEnd = Math.min(effectiveCurrentPage * itemsPerPage, visibleProducts.length)

  return (
    <main className="bg-linear-to-r from-green-300/60 to-green-200/60">
      <section className="bg-linear-to-br from-green-200 via-white to-green-200 relative">
        <img src={bg} className={cn("object-cover w-full absolute h-full")}></img>
        <Container className="max-w-384 py-14 lg:py-20 relative">
          <div className="space-y-6 bg-linear-to-r from-white/85 via-white/30 to-white/10 w-full 2xl:p-10 lg:p-8 rounded-xl p-4">
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-green-800 sm:text-5xl">
                {selectedCategory
                  ? `Danh mục ${selectedCategory.name}`
                  : 'Khám phá cây xanh phù hợp cho nhà ở, bàn làm việc và góc thư giãn'}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-green-800">
                {selectedCategory
                  ? `Đang xem ${visibleProducts.length} sản phẩm thuộc danh mục ${selectedCategory.name}.`
                  : 'Tìm cây theo nhu cầu, xem ảnh và mở chi tiết khi muốn biết thêm mô tả, biến thể hoặc thông tin mua hàng.'}
              </p>
            </div>

          </div>
        </Container>
      </section>

      <Container className="max-w-384 py-10">
        {notice ? (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {notice}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          {showFilters ? (
            <aside className="space-y-6">
              <Card className="space-y-5 px-5 pt-8 pb-6 bg-white/80">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-green-800">Bộ lọc sản phẩm</h2>
                </div>

                <Input
                  label="Từ khóa"
                  value={filters.keyword}
                  placeholder="Tên, mô tả, danh mục..."
                  onChange={(event) => updateFilter('keyword', event.target.value)}
                />

                <Select
                  label="Danh mục"
                  value={filters.categoryId}
                  onChange={(event) => selectCategory(event.target.value)}
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
                  onChange={(event) => updateFilter('status', event.target.value)}
                  options={statusOptions}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Giá tối thiểu"
                    type="number"
                    min="0"
                    value={filters.minPrice}
                    placeholder="0"
                    onChange={(event) => updateFilter('minPrice', event.target.value)}
                  />
                  <Input
                    label="Giá tối đa"
                    type="number"
                    min="0"
                    value={filters.maxPrice}
                    placeholder="1000000"
                    onChange={(event) => updateFilter('maxPrice', event.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button className="flex-1 hover:bg-green-400" onClick={clearFilters}>
                    Xoá lọc
                  </Button>
                  <Button className="flex-1 hover:bg-green-400" onClick={() => setShowFilters(false)}>
                    Ẩn bộ lọc
                  </Button>
                </div>
              </Card>

              <Card className="space-y-4 px-5 pt-4 pb-5 bg-white/80">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-green-800">Danh mục</h2>
                    <p className="text-sm text-green-800">Chọn nhanh một danh mục để lọc theo nhóm.</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {categoryCounts.map((category) => (
                    <Button
                      className={cn("hover:bg-green-400", {"bg-surface border-green-400 border text-green-600 hover:bg-green-200/50": (String(filters.categoryId) !== String(category.id))})}
                      key={category.id || 'all'}
                      onClick={() =>
                        selectCategory(category.id ?? '')
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
              <Button onClick={() => setShowFilters(true)}>
                Hiện bộ lọc
              </Button>
              <Card className="space-y-2">
                <h2 className="text-lg font-semibold text-green-800">Danh mục</h2>
                <div className="flex flex-wrap gap-2">
                  {categoryCounts.map((category) => (
                    <Button
                      key={category.id || 'all'}
                      variant={
                        String(filters.categoryId) === String(category.id) ? 'primary' : 'secondary'
                      }
                      size="sm"
                      onClick={() =>
                        selectCategory(category.id ?? '')
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
            <div className="space-y-5 bg-white/80 p-7 rounded-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-green-800">Danh sách sản phẩm</h2>
                  <p className="text-sm text-green-800">
                    Hiển thị {displayStart}-{displayEnd} trên {visibleProducts.length} sản phẩm phù hợp
                  </p>
                </div>

                <div className="min-w-56">
                  <Select
                    label={<span className='text-base'>Sắp xếp</span>}
                    className="flex-row items-center gap-2"
                    value={filters.sort}
                    onChange={(event) => updateFilter('sort', event.target.value)}
                    options={sortOptions}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {paginatedProducts.map((product) => (
                  <CatalogProductCard
                    key={product.id}
                    product={product}
                    categoryName={product.categoryName}
                    onOpen={openDetail}
                    onEdit={canManage ? openEditProduct : undefined}
                    onCategoryOpen={selectCategory}
                    onAdd={previewAddToCart}
                  />
                ))}
              </div>

              {visibleProducts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-green-300 px-4 py-10 text-center text-lg text-white">
                  Chưa tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.
                </div>
              ) : null}

              {visibleProducts.length > itemsPerPage ? (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                  <div className="text-sm flex-1 text-green-800">
                    Trang {effectiveCurrentPage} / {totalPages}
                  </div>
                  <div className="flex flex-nowrap flex-1 items-center gap-2">
                    <Button
                      size="sm"
                      disabled={effectiveCurrentPage === 1}
                      onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
                    >
                      Trước
                    </Button>
                    {pageNumbers.map((pageNumber) => (
                      <Button
                        key={pageNumber}
                        variant={pageNumber === effectiveCurrentPage ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    ))}
                    <Button
                    
                      size="sm"
                      disabled={effectiveCurrentPage === totalPages}
                      onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
                    >
                      Sau
                    </Button>
                  </div>
                  <div className='flex-1'></div>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </Container>
    </main>
  )
}
