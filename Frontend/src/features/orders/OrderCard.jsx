import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { timeFormat } from '../../utils/timeFormat';
import ORDER_STATUS_MAP from './data/orderStatusMap';

export function OrderCard({ order, onViewDetails }) {
  const orderDetails = order.orderDetailList || [];
  
  // Calculate pricing
  const itemsTotal = orderDetails.reduce((sum, item) => {
    return sum + (Number(item.pricePaid || 0) * (item.quantity || 0));
  }, 0);
  const shippingFee = Number(order.shippingFee || 0);
  const discount = Number(order.discount || 0);
  const total = Math.max(0, itemsTotal + shippingFee - discount);

  const itemsCount = orderDetails.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const statusConfig = ORDER_STATUS_MAP[order.status] || { bg: 'bg-gray-500/10 text-gray-600 border border-gray-500/20', label: order.status };

  return (
    <Card 
      onClick={() => onViewDetails(order)}
      className="w-full transition-all duration-300 hover:border-interactive hover:shadow-lg group cursor-pointer flex flex-col justify-between min-h-[260px] bg-bg-surface/50 backdrop-blur-sm"
    >
      <div>
        <CardHeader className="pb-3 flex flex-row items-center justify-between gap-4 border-b border-border/40">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold tracking-wider text-black/50 uppercase">
              Mã Đơn Hàng
            </span>
            <CardTitle className="text-base font-bold text-black group-hover:text-interactive transition-colors">
              #ORD-{order.id}
            </CardTitle>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusConfig.bg}`}>
            {statusConfig.label}
          </span>
        </CardHeader>

        <CardContent className="pt-4 flex flex-col gap-3">
          {/* Order Details Preview */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-black/45 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-interactive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Tóm Tắt Sản Phẩm
            </span>
            <div className="space-y-1.5 pl-5">
              {orderDetails.slice(0, 2).map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm text-black/85">
                  <span className="truncate max-w-[180px]">
                    {item.productName || 'Sản phẩm không xác định'}
                  </span>
                  <span className="font-semibold text-black/60">
                    x{item.quantity}
                  </span>
                </div>
              ))}
              {orderDetails.length > 2 && (
                <p className="text-xs text-interactive font-medium italic">
                  + {orderDetails.length - 2} sản phẩm khác...
                </p>
              )}
              {orderDetails.length === 0 && (
                <p className="text-sm text-black/50 italic">Không có sản phẩm nào</p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="flex flex-col gap-1 mt-1">
            <span className="text-xs font-semibold text-black/45 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-interactive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Giao Đến
            </span>
            <p className="text-xs text-black/85 pl-5 truncate" title={order.shippingAddress || 'Không có địa chỉ'}>
              {order.shippingAddress || 'Không có địa chỉ'}
            </p>
          </div>
        </CardContent>
      </div>

      <CardFooter className="pt-3 bg-bg-surface/30 border-t border-border/40 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-black/40 tracking-wider">
            {timeFormat(order.createdAt)}
          </span>
          <span className="text-xs text-black/60 mt-0.5">
            {itemsCount} sản phẩm
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right mr-1">
            <span className="text-[10px] text-black/40 block leading-none">Tổng cộng</span>
            <span className="text-base font-extrabold text-interactive">
              {total.toLocaleString('vi-VN')}đ
            </span>
          </div>
          <div className="p-1.5 rounded-lg bg-interactive/10 text-interactive group-hover:bg-interactive group-hover:text-white transition-all duration-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
