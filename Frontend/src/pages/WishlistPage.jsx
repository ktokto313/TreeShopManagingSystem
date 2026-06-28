import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container } from '../components/global/Container'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import ProductImageFrame from '../features/products/components/ProductImageFrame'
import { getProductAvailability } from '../features/products/utils/productAvailability'
import { resolveProductImageSource } from '../features/products/utils/productImageResolver'
import { formatCurrency, parseCatalogImages } from '../features/catalog/utils/catalogUtils'
import { getWishlistProducts, removeWishlistProduct } from '../features/wishlist/wishlistApi'

function getProductImage(product) {
  const images = parseCatalogImages(product.images)
  return resolveProductImageSource(images[0])
}

export default function WishlistPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState('')

  async function loadWishlist() {
    setIsLoading(true)
    setNotice('')

    try {
      const data = await getWishlistProducts()
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      if (error?.status === 401) {
        navigate('/login', { replace: true, state: { from: { pathname: '/wishlist' } } })
        return
      }
      setNotice(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function removeProduct(product) {
    setNotice('')

    try {
      await removeWishlistProduct(product.id)
      setProducts((current) => current.filter((item) => item.id !== product.id))
      setNotice(`${product.name} đã được xóa khỏi danh sách yêu thích.`)
    } catch (error) {
      setNotice(error.message)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadWishlist()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="bg-linear-to-r from-green-300/60 to-green-200/60">
      <Container className="max-w-384 py-10">
        <div className="mb-8 space-y-2">
          <p className="text-sm text-green-800">
            <Link className="hover:underline" to="/">Trang chủ</Link>
            <span className="mx-2 text-green-700/70">/</span>
            <span>Yêu thích</span>
          </p>
          <h1 className="text-4xl font-semibold text-green-900">Danh sách yêu thích</h1>
          <p className="max-w-2xl text-green-800">
            Sản phẩm bạn đã lưu sẽ xuất hiện một lần trong danh sách này.
          </p>
        </div>

        {notice ? (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {notice}
          </div>
        ) : null}

        <Card className="overflow-hidden bg-white/85 p-0">
          {isLoading ? (
            <div className="p-6 text-sm text-green-800">Đang tải danh sách yêu thích...</div>
          ) : null}

          {!isLoading && products.length === 0 ? (
            <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
              <h2 className="text-2xl font-semibold text-green-900">Danh sách yêu thích của bạn đang trống</h2>
              <p className="max-w-md text-sm text-green-800">
                Mở catalog và chọn sản phẩm yêu thích để lưu lại cho lần mua sau.
              </p>
              <Button onClick={() => navigate('/catalog')}>Xem catalog</Button>
            </div>
          ) : null}

          {!isLoading && products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-200 border-collapse text-left">
                <thead>
                  <tr className="border-b border-green-200 text-sm uppercase tracking-wide text-green-900">
                    <th className="w-12 px-5 py-4"></th>
                    <th className="px-5 py-4">Tên sản phẩm</th>
                    <th className="px-5 py-4">Đơn giá</th>
                    <th className="px-5 py-4">Tình trạng kho</th>
                    <th className="px-5 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const availability = getProductAvailability(product)

                    return (
                      <tr key={product.id} className="border-b border-green-100 last:border-0">
                        <td className="px-5 py-4 align-middle">
                          <button
                            type="button"
                            className="h-8 w-8 rounded-full border border-stone-300 text-stone-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                            onClick={() => void removeProduct(product)}
                            aria-label={`Đã xóa ${product.name} khỏi danh sách yêu thích`}
                          >
                            x
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            className="flex items-center gap-4 text-left"
                            onClick={() => navigate(`/catalog/${product.id}`, { state: { product } })}
                          >
                            <ProductImageFrame
                              src={getProductImage(product)}
                              alt={product.name}
                              className="h-20 w-20 shrink-0 rounded-xl"
                              fallbackLabel="Ảnh lỗi"
                            />
                            <span className="font-medium text-green-900 hover:underline">{product.name}</span>
                          </button>
                        </td>
                        <td className="px-5 py-4 text-xl font-semibold text-bg-success">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-5 py-4 text-sm text-green-900">{availability.label}</td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            disabled={!availability.canPurchase}
                            onClick={() =>
                              setNotice(
                                availability.canPurchase
                                  ? `${product.name} có thể thêm vào giỏ hàng khi luồng mua hàng được bật.`
                                  : availability.helper,
                              )
                            }
                          >
                            Thêm vào giỏ
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </Card>
      </Container>
    </main>
  )
}
