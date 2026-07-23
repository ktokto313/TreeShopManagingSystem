import { useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Container } from '../components/global/Container'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { PageBar } from '../components/ui/PageBar'
import { AuthContext } from '../context/AuthContext'
import CatalogProductCard from '../features/catalog/components/CatalogProductCard'
import { addCartItem } from '../features/cart/cartApi'
import { loadPublicJson } from '../features/catalog/utils/catalogApi'
import { matchesCatalogFilters, sortCatalogProducts } from '../features/catalog/utils/catalogUtils'
import { addWishlistProduct, getWishlistProducts } from '../features/wishlist/wishlistApi'
import { sortCategories } from '../utils/categorySort'
import { cn } from '../utils/cn'
import bg from "../assets/images/catalog-bg.jpg"

const OTHER_CATEGORY_ID = 'other'
const SMALL_CATEGORY_LIMIT = 10

const emptyFilters = { //criteria for filter
  keyword: '',
  categoryId: '',
  minPrice: '',
  maxPrice: '',
  careDifficulty: '',
  fengShuiElement: '',
  sort: 'latest',
}

const sortOptions = [
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'rating', label: 'Được quan tâm' },
  { value: 'latest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá tăng dần' },
  { value: 'price-desc', label: 'Giá giảm dần' },
]



function toChipText(category) {
  if (!category) {
    return 'Tất cả'
  }

  return `${category.name} (${category.count})`
}

function getPageNumbers(currentPage, totalPages, maxVisible = 5) {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  let startPage = currentPage - Math.floor(maxVisible / 2)
  let endPage = currentPage + Math.floor(maxVisible / 2)

  if (startPage < 1) {
    startPage = 1
    endPage = maxVisible
  } else if (endPage > totalPages) {
    endPage = totalPages
    startPage = totalPages - maxVisible + 1
  }

  return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index)
}

export default function CatalogPage() {
  const navigate = useNavigate()
  const { categoryId: routeCategoryId } = useParams()
  const { logout, isAuthenticated, canManage } = useContext(AuthContext);
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [filters, setFilters] = useState(() => ({ //load filter data
    ...emptyFilters,
    categoryId: routeCategoryId ?? '',
  }))

  const [showFilters, setShowFilters] = useState(true)
  const [notice, setNotice] = useState('')
  const [addingProductId, setAddingProductId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [wishlistIds, setWishlistIds] = useState(new Set())
  const itemsPerPage = 12

  useEffect(() => {
    if (routeCategoryId !== undefined) {
      setFilters(prev => ({ ...prev, categoryId: routeCategoryId }))
      setCurrentPage(1)
    }
  }, [routeCategoryId])

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
        loadPublicJson('/api/products?status=true'),
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

  async function loadWishlistData() { //get wishlist data from user
    if (!isAuthenticated) {
      setWishlistIds(new Set())
      return
    }

    try {
      const wishlistProducts = await getWishlistProducts()
      setWishlistIds(
        new Set((Array.isArray(wishlistProducts) ? wishlistProducts : []).map((product) => product.id)),
      )
    } catch (error) {
      if (handleAuthError(error)) {
        return
      }
      setWishlistIds(new Set())
    }
  }

  function updateFilter(name, value) {
    setCurrentPage(1)
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function selectCategory(categoryId) { //update filter data
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadWishlistData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  useEffect(() => { //synchronize filter data with routeCategoryId
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

  const baseCategoryCounts = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      count: productsWithCategoryName.filter(
        (product) => String(product.categoryId) === String(category.id),
      ).length,
    }))
  }, [categories, productsWithCategoryName])

  const smallCategoryIds = useMemo(() => {
    return new Set(
      baseCategoryCounts
        .filter((category) => category.count > 0 && category.count <= SMALL_CATEGORY_LIMIT)
        .map((category) => String(category.id)),
    )
  }, [baseCategoryCounts])

  const visibleProducts = useMemo(() => {
    const filteredProducts = productsWithCategoryName.filter((product) =>
      matchesCatalogFilters(product, filters, product.categoryName, {
        otherCategoryId: OTHER_CATEGORY_ID,
        smallCategoryIds,
        searchAliases: smallCategoryIds.has(String(product.categoryId)) ? ['Khác', 'Other'] : [],
      }),
    )

    return sortCatalogProducts(filteredProducts, filters.sort)
  }, [filters, productsWithCategoryName, smallCategoryIds])

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / itemsPerPage))
  const effectiveCurrentPage = Math.min(currentPage, totalPages)

  const paginatedProducts = useMemo(() => {
    const startIndex = (effectiveCurrentPage - 1) * itemsPerPage
    return visibleProducts.slice(startIndex, startIndex + itemsPerPage)
  }, [effectiveCurrentPage, visibleProducts])

  const categoryCounts = useMemo(() => {
    const visibleCategoryCounts = baseCategoryCounts.filter(
      (category) => !smallCategoryIds.has(String(category.id)),
    )
    const otherCount = baseCategoryCounts
      .filter((category) => smallCategoryIds.has(String(category.id)))
      .reduce((total, category) => total + category.count, 0)

    return [
      { id: '', name: 'Tất cả', count: productsWithCategoryName.length },
      ...visibleCategoryCounts,
      ...(otherCount > 0 ? [{ id: OTHER_CATEGORY_ID, name: 'Khác', count: otherCount, isVirtual: true }] : []),
    ]
  }, [baseCategoryCounts, productsWithCategoryName.length, smallCategoryIds])

  const pageNumbers = getPageNumbers(effectiveCurrentPage, totalPages)
  const selectedCategory = filters.categoryId === OTHER_CATEGORY_ID
    ? { id: OTHER_CATEGORY_ID, name: 'Khác' }
    : categories.find(
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

  function selectProductCategory(categoryId) {
    const nextCategoryId = smallCategoryIds.has(String(categoryId)) ? OTHER_CATEGORY_ID : categoryId
    selectCategory(nextCategoryId)
  }

  function openEditProduct(product) {
    navigate('/manage', { state: { editProduct: product } })
  }

  async function handleAddToCart(product) {
    if (!product?.id || Number(product.stock) <= 0) return

    if (!isAuthenticated) {
      navigate('/login', { replace: true, state: { from: { pathname: '/catalog' } } })
      return
    }
    setAddingProductId(product.id)
    setNotice('')

    try {
      await addCartItem(Number(product.id), 1)
      window.dispatchEvent(new Event('cart-updated'))
      setNotice(`${product.name} đã được thêm vào giỏ hàng.`)
    } catch (error) {
      if (error?.status === 401) {
        logout()
        navigate('/login', { replace: true, state: { from: { pathname: '/catalog' } } })
        return
      }

      setNotice(error.message || 'Không thể thêm sản phẩm vào giỏ hàng.')
    } finally {
      setAddingProductId(null)
    }
  }

  async function handleWishlistAction(product) {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/catalog/${product.id}` } } })
      return
    }

    if (wishlistIds.has(product.id)) {
      navigate('/wishlist')
      return
    }

    setNotice('')
    try {
      await addWishlistProduct(product.id)
      setWishlistIds((current) => new Set([...current, product.id]))
      setNotice(`${product.name} đã được thêm vào danh sách yêu thích.`)
    } catch (error) {
      if (handleAuthError(error)) {
        return
      }
      setNotice(error.message)
    }
  }

  const displayStart = visibleProducts.length === 0 ? 0 : (effectiveCurrentPage - 1) * itemsPerPage + 1
  const displayEnd = Math.min(effectiveCurrentPage * itemsPerPage, visibleProducts.length)

  return (
    <main className="bg-linear-to-r from-green-300/60 to-green-200/60">
      <section className="bg-linear-to-br from-green-200 via-white to-green-200 relative">
        <img src={bg} className={cn("object-cover w-full absolute h-full")}></img>
        <Container className="max-w-384 py-14 lg:py-20 relative">
          <div className="space-y-6 bg-linear-to-r from-white/85 via-white/30 to-white/10 w-max rounded-xl p-4">
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-green-800 sm:text-5xl">
                {selectedCategory
                  ? `Danh mục ${selectedCategory.name}`
                  : 'Khám phá cây xanh phù hợp cho nhà ở, bàn làm việc và góc thư giãn'}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-green-800">
                {selectedCategory
                  ? `Đang xem ${visibleProducts.length} sản phẩm thuộc danh mục ${selectedCategory.name}.`
                  : 'Tìm cây theo nhu cầu, xem ảnh và mở chi tiết khi muốn biết thêm mô tả hoặc thông tin mua hàng.'}
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
                  placeholder="Tên sản phẩm, danh mục, caydeban..."
                  onChange={(event) => updateFilter('keyword', event.target.value)}
                />

                <Select
                  label="Danh mục"
                  value={filters.categoryId}
                  onChange={(event) => selectCategory(event.target.value)}
                  options={categoryCounts.map((category) => ({
                    value: String(category.id),
                    label: category.name,
                  }))}
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

                <div className="rounded-2xl border border-dashed border-green-200 bg-green-50/60 p-4 space-y-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-green-800">Lọc theo nhu cầu chăm</h3>
                </div>
                  <Input
                    label="Độ khó chăm"
                    value={filters.careDifficulty}
                    placeholder="Ví dụ: Dễ"
                    onChange={(event) => updateFilter('careDifficulty', event.target.value)}
                  />
                  <Input
                    label="Phong thủy"
                    value={filters.fengShuiElement}
                    placeholder="Ví dụ: Mộc"
                    onChange={(event) => updateFilter('fengShuiElement', event.target.value)}
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
                      className={cn("hover:bg-green-400", { "bg-surface border-green-400 border text-green-600 hover:bg-green-200/50": (String(filters.categoryId) !== String(category.id)) })}
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
                    Hiển thị {displayStart}-{displayEnd} trên {visibleProducts.length} sản phẩm
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
                    onCategoryOpen={selectProductCategory}
                    onWishlist={handleWishlistAction}
                    isWishlisted={wishlistIds.has(product.id)}
                    onAdd={handleAddToCart}
                    isAdding={addingProductId === product.id}
                  />
                ))}
              </div>

              {visibleProducts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-green-300 px-4 py-10 text-center text-lg text-white">
                  Chưa tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.
                </div>
              ) : null}

              {visibleProducts.length > itemsPerPage && (
                <PageBar
                  currentPage={effectiveCurrentPage}
                  totalPages={totalPages}
                  onPageChange={(newPage) => setCurrentPage(newPage)}
                />
              )}
            </div>
          </section>
        </div>
      </Container>
    </main>
  )
}
