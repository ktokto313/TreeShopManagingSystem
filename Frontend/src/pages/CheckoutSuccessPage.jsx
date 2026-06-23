import { Link, useLocation, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Container } from '../components/global/Container'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { formatCurrency } from '../features/catalog/utils/catalogUtils'
import { requestJson } from '../features/cart/cartApi'

function loadStoredCheckout(orderId, stateCheckout) {
  if (stateCheckout) return stateCheckout
  try {
    const stored = window.sessionStorage.getItem(`checkout:${orderId}`)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export default function CheckoutSuccessPage() {
  const { orderId } = useParams()
  const location = useLocation()
  const [verifiedOrder, setVerifiedOrder] = useState(null)
  const [verifyError, setVerifyError] = useState(false)
  const checkout = loadStoredCheckout(orderId, location.state?.checkout)

  useEffect(() => {
    if (!orderId) return
    let cancelled = false
    async function verify() {
      try {
        const order = await requestJson(`/api/orders/${orderId}`)
        if (!cancelled) setVerifiedOrder(order)
      } catch {
        if (!cancelled) setVerifyError(true)
      }
    }
    verify()
    return () => { cancelled = true }
  }, [orderId])

  const displayData = verifiedOrder ? {
    orderCode: verifiedOrder.orderCode || verifiedOrder.id,
    status: verifiedOrder.status,
    total: verifiedOrder.total,
    transferContent: checkout?.transferContent,
    bankAccountNumber: checkout?.bankAccountNumber,
    bankAccountName: checkout?.bankAccountName,
  } : null

  return (
    <main className="bg-[var(--social-bg)]/50">
      <Container className="max-w-[70rem] py-10">
        <Card className="space-y-6 p-6">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">Hoàn tất thanh toán</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--text-h)]">Đặt hàng thành công</h1>
            <p className="mt-2 text-sm text-[var(--text)]">
              Đơn hàng của bạn đã được tạo và sẽ được xử lý sau khi thanh toán được xác nhận.
            </p>
          </div>

          {verifyError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Không thể xác minh đơn hàng từ máy chủ. Vui lòng kiểm tra đơn hàng của bạn.
            </div>
          ) : displayData ? (
            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="rounded-lg border border-[var(--border)] bg-white p-4">
                {checkout?.qrImageUrl && (
                  <img className="mx-auto w-full max-w-72 rounded-md" src={checkout.qrImageUrl} alt="VietQR payment code" />
                )}
              </div>
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Info label="Mã đơn hàng" value={displayData.orderCode} />
                  <Info label="Trạng thái" value={displayData.status} />
                  <Info label="Số tiền" value={formatCurrency(displayData.total)} />
                  <Info label="Nội dung chuyển khoản" value={displayData.transferContent} />
                  <Info label="Số tài khoản" value={displayData.bankAccountNumber} />
                  <Info label="Tên tài khoản" value={displayData.bankAccountName} />
                </div>
                <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  Vui lòng chuyển khoản đúng số tiền với nội dung chuyển khoản chính xác. Nhân viên sẽ xác nhận thanh toán thủ công.
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <span className="text-sm text-[var(--text)]">Đang xác minh đơn hàng...</span>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/orders">
              <Button>Xem đơn hàng</Button>
            </Link>
            <Link to="/catalog">
              <Button variant="secondary">Tiếp tục mua sắm</Button>
            </Link>
          </div>
        </Card>
      </Container>
    </main>
  )
}

function Info({ label, value }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--bg)] p-3">
      <div className="text-xs uppercase tracking-[0.16em] text-[var(--text)]">{label}</div>
      <div className="mt-1 break-words font-semibold text-[var(--text-h)]">{value || '-'}</div>
    </div>
  )
}
