import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container } from '../components/global/Container';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { submitCheckout, fetchCart } from '../features/cart/cartApi';
import { formatCurrency } from '../features/catalog/utils/catalogUtils';
import { FaUser, FaMapMarkerAlt, FaShoppingBag, FaCreditCard, FaCheck } from 'react-icons/fa';

const CHECKOUT_DRAFT_KEY = 'checkoutDraft';

function loadCheckoutDraft() {
  try {
    const draft = window.sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
    return draft ? JSON.parse(draft) : null;
  } catch {
    return null;
  }
}

function clearCheckoutDraft() {
  try {
    window.sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
  } catch {
    // ignore
  }
}

function InfoItem({ label, value }) {
  return (
    <div className="flex gap-2">
      <span className="text-xs uppercase tracking-wider text-stone-500 min-w-[90px]">{label}:</span>
      <span className="font-medium text-stone-800">{value || '-'}</span>
    </div>
  );
}

export default function ReviewCheckoutPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(() => loadCheckoutDraft());
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!draft) {
      navigate('/checkout', { replace: true });
      return;
    }

    async function loadCart() {
      try {
        const cartData = await fetchCart();
        setCart(cartData);
      } catch {
        setError('Không thể tải thông tin giỏ hàng.');
      } finally {
        setLoading(false);
      }
    }

    void loadCart();
  }, [draft, navigate]);

  const items = cart?.items || [];
  const subtotal = Number(cart?.subtotal || 0);
  const shippingFee = draft?.shippingFee || 0;
  const total = subtotal + shippingFee;

  async function handleConfirmOrder() {
    if (!items.length) {
      setError('Giỏ hàng của bạn đang trống.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await submitCheckout({
        ...draft,
      });

      clearCheckoutDraft();
      window.sessionStorage.setItem(`checkout:${response.orderId}`, JSON.stringify(response));
      window.sessionStorage.setItem('lastOrderId', response.orderId);

      navigate(`/checkout/success/${response.orderId}`, { state: { checkout: response } });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  function handleEdit() {
    navigate('/checkout');
  }

  if (!draft) {
    return null;
  }

  const { fullName, email, phone, province, district, ward, address, deliveryNote } = draft;
  const fullAddress = [address, ward, district, province].filter(Boolean).join(', ');

  return (
    <main className="bg-stone-50 min-h-screen">
      <Container className="max-w-5xl py-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-stone-800">Xác nhận đơn hàng</h1>
          <p className="mt-1 text-sm text-stone-500">Kiểm tra thông tin trước khi đặt hàng</p>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <Card className="p-8 text-center text-stone-500">Đang tải...</Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Left Column - Info */}
            <div className="space-y-4">
              {/* Customer Card */}
              <Card className="p-5">
                <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-800">
                  <FaUser className="text-emerald-600" />
                  Thông tin khách hàng
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoItem label="Họ tên" value={fullName} />
                  <InfoItem label="Email" value={email} />
                  <InfoItem label="Điện thoại" value={phone} />
                </div>
              </Card>

              {/* Address Card */}
              <Card className="p-5">
                <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-800">
                  <FaMapMarkerAlt className="text-emerald-600" />
                  Địa chỉ giao hàng
                </div>
                <div className="space-y-2">
                  <InfoItem label="Địa chỉ" value={fullAddress} />
                  {deliveryNote && <InfoItem label="Ghi chú" value={deliveryNote} />}
                </div>
              </Card>

              {/* Order Items Card */}
              <Card className="p-5">
                <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-800">
                  <FaShoppingBag className="text-emerald-600" />
                  Đơn hàng ({items.length} sản phẩm)
                </div>
                <div className="divide-y divide-stone-100">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                      <div className="h-14 w-14 flex-shrink-0 rounded-lg bg-stone-100 overflow-hidden">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-stone-800 truncate">{item.name}</div>
                        <div className="text-sm text-stone-500">{item.quantity} x {formatCurrency(item.price)}</div>
                      </div>
                      <div className="font-semibold text-stone-800">{formatCurrency(item.lineTotal)}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Column - Summary */}
            <div className="space-y-4">
              <Card className="p-5 sticky top-20">
                <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-800">
                  <FaCreditCard className="text-emerald-600" />
                  Thanh toán
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Thành tiền</span>
                    <span className="text-stone-800">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Phí vận chuyển</span>
                    <span className="text-stone-800">{formatCurrency(shippingFee)}</span>
                  </div>
                  <div className="border-t border-stone-200 pt-3 flex justify-between">
                    <span className="font-semibold text-stone-800">Tổng cộng</span>
                    <span className="text-lg font-bold text-emerald-600">{formatCurrency(total)}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleConfirmOrder}
                    disabled={submitting || !items.length}
                  >
                    <FaCheck className="mr-2" />
                    {submitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleEdit}
                    disabled={submitting}
                  >
                    Quay lại chỉnh sửa
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}
