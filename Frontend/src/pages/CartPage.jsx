import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container } from '../components/global/Container'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Select } from '../components/ui/Select'
import ProductImageFrame from '../features/products/components/ProductImageFrame'
import { addCartItem, fetchCart, updateCartItem, removeCartItem, clearCart } from '../features/cart/cartApi'
import { loadPublicJson } from '../features/catalog/utils/catalogApi'
import { formatCurrency, parseCatalogImages } from '../features/catalog/utils/catalogUtils'
import { resolveProductImageSource } from '../features/products/utils/productImageResolver'

const SHIPPING_FEE = 30000

export default function CartPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyProductId, setBusyProductId] = useState(null)
  const [products, setProducts] = useState([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [isAddingProduct, setIsAddingProduct] = useState(false)

  async function loadPageData() {
    setLoading(true)
    setError('')
    try {
      const [cartData, productData] = await Promise.all([
        fetchCart(),
        loadPublicJson('/api/products?status=true'),
      ])
      const availableProducts = Array.isArray(productData)
        ? productData.filter((product) => product.status !== false && Number(product.stock) > 0)
        : []
      setCart(cartData)
      setProducts(availableProducts)
      setSelectedProductId((current) => (
        current && availableProducts.some((product) => String(product.id) === current)
          ? current
          : String(availableProducts[0]?.id ?? '')
      ))
    } catch (err) {
      if (err.status === 401) {
        navigate('/login', { replace: true, state: { from: { pathname: '/cart' } } })
        return
      }
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadPageData()
    }, 0)
    return () => window.clearTimeout(timerId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const items = cart?.items || []
  const subtotal = Number(cart?.subtotal || 0)
  const total = items.length ? subtotal + SHIPPING_FEE : 0
  const productOptions = useMemo(
    () => [
      { value: '', label: products.length ? 'Chọn sản phẩm' : 'Không có sản phẩm nào' },
      ...products.map((product) => ({
        value: String(product.id),
        label: `${product.name} - ${formatCurrency(product.price)} (${product.stock} có sẵn)`,
      })),
    ],
    [products],
  )

  async function addSelectedProduct() {
    if (!selectedProductId) return
    setIsAddingProduct(true)
    setError('')
    try {
      setCart(await addCartItem(Number(selectedProductId), 1))
      window.dispatchEvent(new Event('cart-updated'))
    } catch (err) {
      setError(err.message)
    } finally {
      setIsAddingProduct(false)
    }
  }

  async function changeQuantity(item, nextQuantity) {
    if (nextQuantity < 1 || nextQuantity > item.stock) return
    setBusyProductId(item.productId)
    setError('')
    try {
      setCart(await updateCartItem(item.productId, nextQuantity))
      window.dispatchEvent(new Event('cart-updated'))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyProductId(null)
    }
  }

  async function removeItem(productId) {
    setBusyProductId(productId)
    setError('')
    try {
      setCart(await removeCartItem(productId))
      window.dispatchEvent(new Event('cart-updated'))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyProductId(null)
    }
  }

  async function clearAll() {
    setError('')
    try {
      setCart(await clearCart())
      window.dispatchEvent(new Event('cart-updated'))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="bg-[var(--social-bg)]/50">
      <Container className="max-w-[80rem] py-10">
        <div className="mb-6 space-y-1">
          <p className="text-sm text-[var(--text)]">Home &gt; Giỏ hàng</p>
          <h1 className="text-3xl font-semibold text-[var(--text-h)]">Giỏ Hàng Của Bạn</h1>
        </div>

        {error ? (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <Card className="p-6 text-sm text-[var(--text)]">Đang tải giỏ hàng...</Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-[var(--text-h)]">Sản phẩm trong giỏ hàng</h2>
              <Card className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <Select
                  label="Thêm sản phẩm"
                  value={selectedProductId}
                  options={productOptions}
                  disabled={!products.length || isAddingProduct}
                  onChange={(event) => setSelectedProductId(event.target.value)}
                />
                <Button
                  disabled={!selectedProductId || isAddingProduct}
                  onClick={addSelectedProduct}
                >
                  {isAddingProduct ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                </Button>
              </Card>
              {items.length === 0 ? (
                <Card className="p-8 text-center text-sm text-[var(--text)]">
                  Không có sản phẩm nào trong giỏ hàng.
                  <div className="mt-4">
                    <Link to="/catalog">
                      <Button>Tiếp tục mua sắm</Button>
                    </Link>
                  </div>
                </Card>
              ) : (
                items.map((item) => {
                  const image = resolveProductImageSource(parseCatalogImages(item.images)[0])
                  const isBusy = busyProductId === item.productId
                  return (
                    <Card key={item.productId} className="grid gap-4 sm:grid-cols-[120px_minmax(0,1fr)_auto]">
                      <ProductImageFrame src={image} alt={item.name} className="h-28 rounded-md" />
                      <div className="space-y-2">
                        <h3 className="font-semibold text-[var(--text-h)]">{item.name}</h3>
                        <p className="text-sm text-[var(--text)]">Kho: {item.stock}</p>
                        <p className="font-medium text-[var(--accent)]">{formatCurrency(item.price)}</p>
                        <div className="inline-flex items-center overflow-hidden rounded-md border border-[var(--border)]">
                          <button
                            type="button"
                            className="h-9 w-9 bg-[var(--social-bg)] text-lg disabled:opacity-40"
                            disabled={isBusy || item.quantity <= 1}
                            onClick={() => changeQuantity(item, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="h-9 min-w-12 px-4 text-center leading-9">{item.quantity}</span>
                          <button
                            type="button"
                            className="h-9 w-9 bg-[var(--social-bg)] text-lg disabled:opacity-40"
                            disabled={isBusy || item.quantity >= item.stock}
                            onClick={() => changeQuantity(item, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-start justify-between gap-3 sm:items-end">
                        <div className="text-lg font-semibold text-[var(--text-h)]">
                          {formatCurrency(item.lineTotal)}
                        </div>
                        <Button variant="danger" size="sm" disabled={isBusy} onClick={() => removeItem(item.productId)}>
                          Xóa khỏi giỏ hàng
                        </Button>
                      </div>
                    </Card>
                  )
                })
              )}
              {items.length ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link to="/catalog">
                    <Button variant="secondary">Tiếp tục mua sắm</Button>
                  </Link>
                  <Button variant="secondary" onClick={clearAll}>Xóa giỏ hàng</Button>
                </div>
              ) : null}
            </section>

            <Card className="h-fit space-y-4 lg:sticky lg:top-20">
              <h2 className="text-xl font-semibold text-[var(--text-h)]">Tổng Quan Giỏ Hàng</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Thành tiền</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển ước tính</span>
                  <span className="font-medium">{items.length ? formatCurrency(SHIPPING_FEE) : formatCurrency(0)}</span>
                </div>
                <div className="border-t border-[var(--border)] pt-3 text-base font-semibold text-[var(--text-h)]">
                  <div className="flex justify-between">
                    <span>Tổng cộng</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
              <Button className="w-full" disabled={!items.length} onClick={() => navigate('/checkout')}>
                Tiến hành thanh toán
              </Button>
            </Card>
          </div>
        )}
      </Container>
    </main>
  )
}
