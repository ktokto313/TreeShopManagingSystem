import { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container } from '../components/global/Container'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { AuthContext } from '../context/AuthContext'
import { fetchCart, submitCheckout, fetchShippingFee } from '../features/cart/cartApi'
import { formatCurrency } from '../features/catalog/utils/catalogUtils'
import { SHIPPING_PROVINCES, getDistrictsByProvince } from '../features/cart/shippingLocations'
import { Select } from '../components/ui/Select'

const DEFAULT_SHIPPING_FEE = 30000
const PRODUCT_WEIGHT_GRAMS = 500

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  province: 'Hà Nội',
  district: '',
  ward: '',
  address: '',
  deliveryNote: '',
  weightGrams: 0,
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [cart, setCart] = useState(null)
  const [form, setForm] = useState(() => ({
    ...initialForm,
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  }))
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [shippingFee, setShippingFee] = useState(DEFAULT_SHIPPING_FEE)
  const [calculatingShipping, setCalculatingShipping] = useState(false)
  const districtOptions = useMemo(() => getDistrictsByProvince(form.province), [form.province])

  async function loadCart() {
    setError('')
    setLoading(true)
    try {
      setCart(await fetchCart())
    } catch (err) {
      if (err.status === 401) {
        navigate('/login', { replace: true, state: { from: { pathname: '/checkout' } } })
        return
      }
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadCart()
    }, 0)
    return () => window.clearTimeout(timerId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const items = cart?.items || []
  const subtotal = Number(cart?.subtotal || 0)
  const totalItemQuantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
  const totalOrderValue = subtotal
  const total = useMemo(
    () => (items.length ? subtotal + shippingFee : 0),
    [items.length, shippingFee, subtotal],
  )
  const weightGrams = useMemo(
    () => items.length * PRODUCT_WEIGHT_GRAMS,
    [items.length],
  )
  const shippingFeeAmount = items.length ? shippingFee : 0

  useEffect(() => {
    if (!form.province) {
      return
    }
    const hasValidDistrict = Boolean(form.district)
    if (!hasValidDistrict) {
      setForm((current) => ({ ...current, district: '' }))
      setShippingFee(DEFAULT_SHIPPING_FEE)
      return
    }
    let cancelled = false
    let timeoutId
    setCalculatingShipping(true)
    timeoutId = window.setTimeout(() => {
      void fetchShippingFee({
          province: form.province,
          district: form.district,
          totalOrderValue,
          itemCount: totalItemQuantity,
        })
        .then((data) => {
          if (cancelled) return
          if (data && typeof data.shippingFee === 'number') {
            setShippingFee(data.shippingFee)
          } else {
            setShippingFee(DEFAULT_SHIPPING_FEE)
          }
        })
        .catch(() => {
          if (cancelled) return
          setShippingFee(DEFAULT_SHIPPING_FEE)
        })
        .finally(() => {
          if (!cancelled) setCalculatingShipping(false)
        })
    }, 300)
    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [form.province, form.district, totalOrderValue, totalItemQuantity])

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  function validateForm() {
    const requiredFields = ['fullName', 'email', 'phone', 'province', 'district', 'ward', 'address']
    return requiredFields.every((field) => String(form[field] || '').trim())
  }

  function handlePhoneInput(event) {
    updateField('phone', event.target.value.replace(/\D/g, ''))
  }

  function handleAddressOnlyFields(event, fieldName) {
    const value = event.target.value
    const textOnly = value.replace(/[0-9]/g, '')
    updateField(fieldName, textOnly)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!items.length) {
      setError('Giỏ hàng của bạn đang trống.')
      return
    }
    if (!validateForm()) {
      setError('Vui lòng điền vào tất cả các thông tin giao hàng.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const response = await submitCheckout({
        ...form,
        weightGrams,
        totalOrderValue,
        itemCount: totalItemQuantity,
      })
      window.sessionStorage.setItem(`checkout:${response.orderId}`, JSON.stringify(response))
      navigate(`/checkout/success/${response.orderId}`, { state: { checkout: response } })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="bg-[var(--social-bg)]/50">
      <Container className="max-w-[80rem] py-10">
        <div className="mb-6 space-y-1">
          <h1 className="text-3xl font-semibold text-[var(--text-h)]">Thanh Toán</h1>
          <p className="text-sm text-[var(--text)]">Điền vào các thông tin giao hàng.</p>
        </div>

        {error ? (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <Card className="p-6 text-sm text-[var(--text)]">Đang tải thông tin thanh toán...</Card>
        ) : (
          <form className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]" onSubmit={handleSubmit}>
            <section className="space-y-6">
              <Card className="space-y-4">
                <h2 className="text-xl font-semibold text-[var(--text-h)]">Sản phẩm đã chọn</h2>
                {items.length ? (
                  <div className="divide-y divide-[var(--border)]">
                    {items.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between gap-4 py-3 text-sm">
                        <div>
                          <div className="font-medium text-[var(--text-h)]">{item.name}</div>
                          <div className="text-[var(--text)]">Số lượng: {item.quantity} x {formatCurrency(item.price)}</div>
                        </div>
                        <div className="font-semibold text-[var(--text-h)]">{formatCurrency(item.lineTotal)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text)]">Không có sản phẩm nào trong giỏ hàng.</p>
                )}
              </Card>

              <Card className="space-y-4">
                <h2 className="text-xl font-semibold text-[var(--text-h)]">Thông tin giao hàng</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Họ và tên*" value={form.fullName} onChange={(event) => updateField('fullName', event.target.value)} />
                  <Input label="Email*" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} />
                  <Input label="Số điện thoại*" type="tel" inputMode="numeric" pattern="[0-9]*" value={form.phone} onChange={handlePhoneInput} />
                  <Select
                    label="Tỉnh/Thành phố*"
                    options={SHIPPING_PROVINCES.map((province) => ({ value: province.value, label: province.label }))}
                    value={form.province}
                    onChange={(event) => updateField('province', event.target.value)}
                  />
                  <Select
                    label="Quận/Huyện*"
                    options={districtOptions.map((district) => ({ value: district.value, label: district.label }))}
                    value={form.district}
                    onChange={(event) => updateField('district', event.target.value)}
                    disabled={!form.province}
                  />
                  <Input label="Phường/Xã*" value={form.ward} onChange={(event) => handleAddressOnlyFields(event, 'ward')} />
                </div>
                <Input label="Địa chỉ*" value={form.address} onChange={(event) => updateField('address', event.target.value)} />
                <label className="block text-left">
                  <span className="mb-1 block text-sm font-medium text-[var(--text-h)]">Ghi chú giao hàng</span>
                  <textarea
                    className="min-h-24 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-h)] outline-none transition focus:border-[var(--accent)]"
                    value={form.deliveryNote}
                    onChange={(event) => updateField('deliveryNote', event.target.value)}
                  />
                </label>
              </Card>
            </section>

            <Card className="h-fit space-y-4 lg:sticky lg:top-20">
              <h2 className="text-xl font-semibold text-[var(--text-h)]">Đơn hàng</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Thành tiền</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between"><span>Giảm giá</span><span>{formatCurrency(0)}</span></div>
                <div className="flex justify-between"><span>Phí vận chuyển</span><span>{calculatingShipping ? 'Đang cập nhật...' : formatCurrency(shippingFeeAmount)}</span></div>
                <div className="border-t border-[var(--border)] pt-3 text-base font-semibold text-[var(--text-h)]">
                  <div className="flex justify-between"><span>Tổng cộng</span><span>{formatCurrency(total)}</span></div>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting || !items.length}>
                {submitting ? 'Đang xử lý...' : 'Đặt hàng ngay'}
              </Button>
              <Link to="/cart" className="block text-center text-sm text-[var(--accent)] hover:underline">
                Quay lại giỏ hàng
              </Link>
            </Card>
          </form>
        )}
      </Container>
    </main>
  )
}
