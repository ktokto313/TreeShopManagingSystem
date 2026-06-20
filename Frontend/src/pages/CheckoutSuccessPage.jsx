import { Link, useLocation, useParams } from 'react-router-dom'
import Container from '../components/global/Container'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { formatCurrency } from '../features/catalog/utils/catalogUtils'

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
  const checkout = loadStoredCheckout(orderId, location.state?.checkout)

  return (
    <main className="bg-[var(--social-bg)]/50">
      <Container className="max-w-[70rem] py-10">
        <Card className="space-y-6 p-6">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">Checkout complete</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--text-h)]">Dat hang thanh cong</h1>
            <p className="mt-2 text-sm text-[var(--text)]">
              Your order is created with status PROCESSING and will be handled after payment is confirmed.
            </p>
          </div>

          {checkout ? (
            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="rounded-lg border border-[var(--border)] bg-white p-4">
                <img className="mx-auto w-full max-w-72 rounded-md" src={checkout.qrImageUrl} alt="VietQR payment code" />
              </div>
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Info label="Order code" value={checkout.orderCode} />
                  <Info label="Status" value={checkout.status} />
                  <Info label="Amount" value={formatCurrency(checkout.total)} />
                  <Info label="Transfer content" value={checkout.transferContent} />
                  <Info label="Account number" value={checkout.bankAccountNumber} />
                  <Info label="Account name" value={checkout.bankAccountName} />
                </div>
                <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  Please transfer the exact amount with the exact transfer content. Staff will confirm the payment manually.
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Checkout was completed, but the QR details are no longer available in this browser session. Please check your orders.
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/orders">
              <Button>View my orders</Button>
            </Link>
            <Link to="/catalog">
              <Button variant="secondary">Continue shopping</Button>
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
