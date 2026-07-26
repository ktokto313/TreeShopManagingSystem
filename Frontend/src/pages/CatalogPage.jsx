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



/**
 * Converts a category object to display text for UI chips.
 * Shows category name with product count in parentheses.
 * 
 * @param {object|null} category - The category object with name and possibly count
 * @returns {string} Formatted chip text (e.g., "Cây cảnh (42)" or "Tất cả" if null)
 */
function toChipText(category) {
  if (!category) {
    return 'Tất cả'
  }

  return `${category.name} (${category.count})`
}

/**
 * Calculates which page numbers to display in pagination.
 * Shows at most maxVisible page numbers, centered around currentPage when possible.
 * 
 * Examples:
 * - 100 total pages, current=50 → [48, 49, 50, 51, 52]
 * - 3 total pages, current=2 → [1, 2, 3]
 * - 10 total pages, current=1 → [1, 2, 3, 4, 5]


/**
 * CatalogPage - Main product discovery and browsing interface.
 * 
 * Features:
 * - Dynamic filtering: keyword search, category, price range, care difficulty, feng shui elements
 * - Multi-option sorting: popularity, rating, latest, price ascending/descending
 * - Pagination: configurable items per page with smart pagination UI
 * - Wishlist integration: add to wishlist for authenticated users
 * - Cart integration: add products to shopping cart
 * - Category management: groups small categories into "Other" pseudo-category
 * - Responsive layout: toggleable filter sidebar, mobile-friendly pagination
 * 
 * State Management:
 * - categories: available product categories from API
 * - products: all active products from API (filtered by status=true)
 * - filters: current filter values (keyword, categoryId, price, difficulty, feng shui, sort)
 * - wishlistIds: Set of product IDs in user's wishlist (for quick lookup)
 * - currentPage: pagination state
 * - showFilters: visibility toggle for filter sidebar
 * 
 * Data Flow:
 * 1. Load catalogs data and wishlist on mount
 * 2. Filter/sort products based on current filter state (using useMemo)
 * 3. Paginate and render visible products
 * 4. Sync URL params with filter state (categoryId in route → filter state)
 * 5. Update wishlist and cart on user actions
 * 
 * @component
 * @returns {React.ReactElement} The catalog page UI
 */
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

  /**
   * Handles authentication errors (401 Unauthorized).
   * Logs out the user if authenticated, or shows notice if not.
   * Returns true if error was handled (is 401), false if error is different.
   * 
   * @param {object} error - Error object with optional status property
   * @returns {boolean} True if this was a 401 error (handled), false otherwise
   */
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

  /**
   * Loads all catalog data (categories and products) from API.
   * Categories are sorted using project's standard sort order.
   * Only loads active products (status=true).
   * Sets error notice if loading fails.
   */
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

  /**
   * Loads the authenticated user's wishlist.
   * Populates wishlistIds Set for O(1) lookup when rendering product cards.
   * If not authenticated, clears wishlist IDs.
   */
  async function loadWishlistData() {
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

  /**
   * Updates a single filter value and resets pagination to page 1.
   * This triggers useMemo to recalculate visibleProducts.
   * 
   * @param {string} name - Filter field name (e.g., 'keyword', 'categoryId', 'minPrice')
   * @param {any} value - New filter value
   */
  function updateFilter(name, value) {
    setCurrentPage(1)
    setFilters((current) => ({ ...current, [name]: value }))
  }

  /**
   * Updates category filter and navigates URL to reflect selection.
   * Groups small categories (≤SMALL_CATEGORY_LIMIT products) under "Other" pseudo-category.
   * 
   * @param {string|number|null} categoryId - Category ID to select, or empty for "All"
   */
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

  const selectedCategory = filters.categoryId === OTHER_CATEGORY_ID
    ? { id: OTHER_CATEGORY_ID, name: 'Khác' }
    : categories.find(
      (category) => String(category.id) === String(filters.categoryId),
    )

  /**
   * Resets all filters to default state and navigates to /catalog.
   * This triggers a full product list reload (no filters applied).
   */
  function clearFilters() {
    setFilters(emptyFilters)
    setCurrentPage(1)
    navigate('/catalog')
  }

  /**
   * Opens the product detail page.
   * Passes product data via state to avoid extra API call.
   * 
   * @param {object} product - The product to view
   */
  function openDetail(product) {
    navigate(`/catalog/${product.id}`, { state: { product } })
  }

  /**
   * Opens edit page for a product (manager only).
   * If product's category is a "small category" (≤10 products),
   * redirects to "Other" instead to maintain category grouping UX.
   * 
   * @param {string|number} categoryId - The product's category ID
   */
  function selectProductCategory(categoryId) {
    const nextCategoryId = smallCategoryIds.has(String(categoryId)) ? OTHER_CATEGORY_ID : categoryId
    selectCategory(nextCategoryId)
  }

  /**
   * Opens product editor for managers.
   * Passes product data via state to pre-populate form.
   * 
   * @param {object} product - The product to edit
   */
  function openEditProduct(product) {
    navigate('/manage', { state: { editProduct: product } })
  }

  /**
   * Handles adding a product to shopping cart.
   * Requires authentication - redirects to login if not authenticated.
   * Shows success/error notice to user.
   * Prevents adding out-of-stock products.
   * 
   * @param {object} product - Product to add (must have id and stock)
   */
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

  /**
   * Handles wishlist add/view action.
   * If product already wishlisted, navigates to wishlist page.
   * If not wishlisted, adds to wishlist and shows success notice.
   * Requires authentication - redirects to login if not authenticated.
   * 
   * @param {object} product - Product to wishlist
   */
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
