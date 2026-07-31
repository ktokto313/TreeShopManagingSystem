import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { timeFormat } from "../../utils/timeFormat";
import ShipperSelect from "./ShipperSelect";
import ORDER_STATUS_MAP from "./data/orderStatusMap";
import useUpdateShipper from "./hooks/useUpdateShipper";
import useFetchOrderDetail from "./hooks/useFetchOrderDetail";
import { useEffect, useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import useChangeOrderStatus from "./hooks/useChangeOrderStatus";
import useUpdateOrderAddress from "./hooks/useUpdateOrderAddress";
import ReviewModal from "../review/components/ReviewModal";

function buildVietQrUrl(orderId, amount) {
  const bankId = import.meta.env.VITE_CHECKOUT_BANK_ID || 'MB';
  const accountNo = import.meta.env.VITE_CHECKOUT_BANK_ACCOUNT_NO || '9704229201538581841';
  const accountName = import.meta.env.VITE_CHECKOUT_BANK_ACCOUNT_NAME || 'LE MINH DUC';
  const template = import.meta.env.VITE_CHECKOUT_QR_TEMPLATE || 'compact2';
  const transferContent = import.meta.env.VITE_CHECKOUT_TRANSFER_PREFIX + orderId;
  const encoded = (v) => encodeURIComponent(v);
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png`
    + `?amount=${amount}`
    + `&addInfo=${encoded(transferContent)}`
    + `&accountName=${encoded(accountName)}`;
}

/**
 * @param {{ selectedOrderId: number|string|null, onClose: () => void, onOrderChange?: () => void|Promise<void> }} props
 */
export default function OrderModal({ selectedOrderId, onClose, onOrderChange }) {
  const {
    orderDetail,
    isLoading: isDetailLoading,
    error: detailError,
    fetchOrderDetail,
  } = useFetchOrderDetail();
  const {
    updateShipper,
    isLoading: isUpdatingShipper,
    error: updateError,
  } = useUpdateShipper();

  const { user } = useContext(AuthContext);
  const { changeOrderStatus, isLoading: isChangingStatus, error: changeOrderError } = useChangeOrderStatus();
  const { updateAddress, isLoading: isUpdatingAddress } = useUpdateOrderAddress();
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressValue, setEditingAddressValue] = useState('');
  const [selectedShipperId, setSelectedShipperId] = useState(null);

  useEffect(() => {
    setSelectedShipperId(null);
    fetchOrderDetail(selectedOrderId);
  }, [selectedOrderId, fetchOrderDetail]);

  if (!selectedOrderId) return null;

  const selectedOrder = orderDetail;
  const details = selectedOrder?.orderDetailList || [];
  const itemsTotal = details.reduce((sum, item) => sum + (Number(item.pricePaid || 0) * (item.quantity || 0)), 0);
  const shippingFee = Number(selectedOrder?.shippingFee || 0);
  const discount = Number(selectedOrder?.discount || 0);
  const finalTotal = Math.max(0, itemsTotal + shippingFee - discount);

  const statusConfig = ORDER_STATUS_MAP[selectedOrder?.status];

  return (
    <Modal
      isOpen={!!selectedOrderId}
      onClose={onClose}
      title={`Chi tiết Đơn Hàng - #ORD-${selectedOrder?.id || selectedOrderId}`}
    >
      {isDetailLoading && (
        <div className="py-8 text-center text-sm font-semibold text-black/60">
          Đang tải chi tiết đơn hàng...
        </div>
      )}

      {!isDetailLoading && detailError && (
        <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5 text-sm text-red-600">
          {detailError === 'UNAUTHORIZED' ? 'Yêu cầu xác thực để xem đơn hàng này.' : detailError}
        </div>
      )}

      {!isDetailLoading && !detailError && selectedOrder && (
        <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Status Banner */}
          <div className="rounded-lg bg-interactive/10 p-3 flex items-center justify-between border border-interactive/20">
            <div className="flex gap-2 items-center">
              <span className="text-sm uppercase font-bold text-black/55">Trạng thái</span>
              <p className={`text-xs  font-bold ${statusConfig?.bg || ''} px-2 py-0.5 rounded-full inline-block`}>
                {statusConfig?.label || selectedOrder.status}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-black/55">Ngày đặt</span>
              <p className="text-xs font-semibold text-black/75 mt-0.5">{timeFormat(selectedOrder.createdAt)}</p>
            </div>
          </div>


          {/* Items Section */}
          <div>
            <h4 className="text-xs font-bold text-black/60 uppercase tracking-wider mb-2">Chi tiết sản phẩm</h4>
            <div className="space-y-2">
              {details.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-bg-base border border-border/55">
                  <div className="flex flex-col max-w-[200px]">
                    <span className="text-sm font-semibold text-black/90 truncate">
                      {item.productName || 'Sản phẩm không xác định'}
                    </span>
                    <span className="text-[10px] text-black/45 mt-0.5">
                      SKU: {item.sku || 'N/A'}
                    </span>
                    {selectedOrder.status === 'RECEIVED' && user?.role === 'CUSTOMER' && (
                        <ReviewModal 
                          orderId={selectedOrder.id} 
                          productId={item.product?.id || item.productId} 
                          hasReviewed={item.hasReviewed} 
                          onReviewSubmitted={() => fetchOrderDetail(selectedOrderId)}
                        />
                    )}
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="text-sm font-bold text-black/85">
                      {(Number(item.pricePaid || 0) * (item.quantity || 0)).toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-[10px] text-black/50 mt-0.5">
                      {Number(item.pricePaid || 0).toLocaleString('vi-VN')}đ x {item.quantity}
                    </span>
                  </div>
                </div>
              ))}
              {details.length === 0 && (
                <p className="text-sm text-black/40 italic">Không có sản phẩm nào trong đơn hàng này.</p>
              )}
            </div>
          </div>

          {/* Receiver Information */}
          <h4 className="text-xs font-bold text-black/60 uppercase tracking-wider">Thông tin khách hàng</h4>
          <div className="p-3 rounded-lg bg-bg-base border border-border/55">
            <p className="text-xs text-black/80 leading-relaxed">
              {selectedOrder.customerName || 'Không có tên khách hàng.'}
            </p>
            <p className="text-xs text-black/80 leading-relaxed">
              {selectedOrder.customerPhone || 'Không có số điện thoại khách hàng.'}
            </p>
            <div className="text-xs text-black/80 leading-relaxed flex flex-wrap items-center justify-between gap-2 mt-1">
              {isEditingAddress ? (
                <div className="flex-1 flex gap-2 w-full">
                  <input 
                    type="text" 
                    className="flex-1 border border-border/50 rounded px-2 py-1.5 text-xs outline-none focus:border-interactive transition-colors" 
                    value={editingAddressValue}
                    onChange={(e) => setEditingAddressValue(e.target.value)}
                    disabled={isUpdatingAddress}
                  />
                  <Button 
                    variant="primary" 
                    className="px-3 py-1.5 text-xs whitespace-nowrap"
                    disabled={isUpdatingAddress}
                    onClick={async () => {
                      const success = await updateAddress(selectedOrder.id, editingAddressValue);
                      if (success) {
                        setIsEditingAddress(false);
                        fetchOrderDetail(selectedOrderId);
                        onOrderChange?.();
                      }
                    }}
                  >
                    Lưu
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="px-3 py-1.5 text-xs whitespace-nowrap"
                    disabled={isUpdatingAddress}
                    onClick={() => setIsEditingAddress(false)}
                  >
                    Hủy
                  </Button>
                </div>
              ) : (
                <>
                  <span className="flex-1">{selectedOrder.shippingAddress || 'Không có địa chỉ giao hàng.'}</span>
                  {selectedOrder.status === 'PROCESSING' && user?.role === 'CUSTOMER' && (
                    <Button 
                      variant="secondary" 
                      className="text-[10px] px-3 py-1 h-auto min-h-0"
                      onClick={() => {
                        setEditingAddressValue(selectedOrder.shippingAddress || '');
                        setIsEditingAddress(true);
                      }}
                    >
                      Sửa
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Shipper Information */}
          {!!selectedOrder.shipperId && (
          <>
            <h4 className="text-xs font-bold text-black/60 uppercase tracking-wider">Thông tin shipper</h4>
            <div className="p-3 rounded-lg bg-bg-base border border-border/55">
              <p className="text-xs text-black/80 leading-relaxed">
                {selectedOrder.shipperName || 'Không có tên shipper.'}
              </p>
              <p className="text-xs text-black/80 leading-relaxed">
                {selectedOrder.shipperPhone || 'Không có số điện thoại shipper.'}
              </p>
            </div>
          </>
          )}

          {/* Pricing Summary */}
          <div className="space-y-1.5 border-t border-border/60 pt-3 text-sm text-black/75">
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <span className="font-semibold">{itemsTotal.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển</span>
              <span className="font-semibold text-green-600">+{shippingFee.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between">
              <span>Giảm giá</span>
              <span className="font-semibold text-red-500">-{discount.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between border-t border-border/60 pt-2 text-base font-extrabold text-black">
              <span>Tổng cộng</span>
              <span className="text-interactive">{finalTotal.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          {/* Payment QR */}
          {selectedOrder.status === 'PROCESSING' && 
            user?.role === "CUSTOMER" && (
            <div className="rounded-lg bg-bg-base border border-border/55 p-3">
              <h4 className="text-xs font-bold text-black/60 uppercase tracking-wider mb-2">
                Mã QR Thanh Toán
              </h4>
              <p className="text-xs text-black/70 mb-2">
                Chuyển khoản <span className="font-bold">{finalTotal.toLocaleString('vi-VN')}đ</span> với nội dung: <span className="font-bold">TS{selectedOrder.id}</span>
              </p>
              <img
                src={buildVietQrUrl(selectedOrder.id, finalTotal)}
                alt="Payment QR"
                className="mx-auto max-w-52 rounded-md"
              />
              <p className="text-[10px] text-black/45 mt-1.5 text-center">
                Quét mã QR bằng ứng dụng ngân hàng của bạn
              </p>
            </div>
          )}

          {/* Shipper Assignment */}
          {["PROCESSING", "RETURN_PROCESSING", "PENDING", "RETURN_PENDING"].includes(selectedOrder.status)
           && user?.role === "MANAGER" && (
            <div className="p-3 rounded-lg bg-bg-base border border-border/55">
              <ShipperSelect
                value={selectedShipperId !== null ? selectedShipperId : (selectedOrder.shipperId ?? '')}
                selectedShipperName={selectedOrder.shipperName}
                onChange={(shipperId) => {
                  setSelectedShipperId(shipperId);
                }}
                disabled={isUpdatingShipper}
              />
              
            </div>
          )}
          
          {(updateError || changeOrderError) && (
                <p className="text-red-500 text-xs mt-1">{updateError ?? changeOrderError}</p>
              )}

          {/* Close / Actions */}
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="secondary" className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white" onClick={onClose}>
              Đóng
            </Button>

            {/* MANAGER Actions */}
            {["PROCESSING", "RETURN_PROCESSING", "PENDING", "RETURN_PENDING"].includes(selectedOrder.status) 
             && user?.role === "MANAGER" 
             && selectedShipperId !== null 
             && selectedShipperId !== (selectedOrder.shipperId ?? '') && (
              <Button
                variant="primary"
                className="px-4 py-2 bg-interactive"
                disabled={isUpdatingShipper}
                onClick={async () => {
                  const didUpdate = await updateShipper(selectedOrder.id, selectedShipperId);
                  if (didUpdate) {
                    fetchOrderDetail(selectedOrderId);
                    onOrderChange?.();
                    setSelectedShipperId(null);
                  }
                }}
              >
                Cập nhật Shipper
              </Button>
            )}

            {selectedOrder.status === "PENDING" && user?.role === "MANAGER" && (
              <Button
                variant="primary"
                className="px-4 py-2"
                disabled={isChangingStatus}
                onClick={async () => {
                  const success = await changeOrderStatus(selectedOrder.id, "DELIVERING");
                  if (success) {
                    fetchOrderDetail(selectedOrderId);
                    onOrderChange?.();
                  }
                }}
              >
                Giao hàng cho shipper
              </Button>
            )}

            {selectedOrder.status === "PROCESSING" && user?.role === "MANAGER" && (
              <Button
                variant="primary"
                className="px-4 py-2 bg-red-500 hover:bg-red-600 border-none"
                disabled={isChangingStatus}
                onClick={async () => {
                  const success = await changeOrderStatus(selectedOrder.id, "FAILED");
                  if (success) {
                    fetchOrderDetail(selectedOrderId);
                    onOrderChange?.();
                  }
                }}
              >
                Hủy đơn hàng
              </Button>
            )}

            {selectedOrder.status === "RETURNING" && user?.role === "MANAGER" && (
              <Button
                variant="primary"
                className="px-4 py-2"
                disabled={isChangingStatus}
                onClick={async () => {
                  const success = await changeOrderStatus(selectedOrder.id, "FAILED");
                  if (success) {
                    fetchOrderDetail(selectedOrderId);
                    onOrderChange?.();
                  }
                }}
              >
                Xác nhận đã nhận hàng hoàn trả
              </Button>
            )}

            {selectedOrder.status === "RECEIVED" && user?.role === "MANAGER" && (
              <Button
                variant="primary"
                className="px-4 py-2"
                onClick={() => {
                  alert(`Hóa đơn cho Đơn hàng #ORD-${selectedOrder.id} đã được gửi đến máy in!`);
                }}
              >
                In hóa đơn
              </Button>
            )}

            {/* SHIPPER Actions */}
            {selectedOrder.status === "DELIVERING" && user?.role === "SHIPPER" && (
              <>
                <Button
                  variant="primary"
                  className="px-4 py-2"
                  disabled={isChangingStatus}
                  onClick={async () => {
                    const success = await changeOrderStatus(selectedOrder.id, "ARRIVED");
                    if (success) {
                      fetchOrderDetail(selectedOrderId);
                      onOrderChange?.();
                    }
                  }}
                >
                  Xác nhận đã giao
                </Button>
                <Button
                  variant="primary"
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 border-none"
                  disabled={isChangingStatus}
                  onClick={async () => {
                    const success = await changeOrderStatus(selectedOrder.id, "RETURNING");
                    if (success) {
                      fetchOrderDetail(selectedOrderId);
                      onOrderChange?.();
                    }
                  }}
                >
                  Hủy giao hàng
                </Button>
              </>
            )}

            {selectedOrder.status === "RETURN_PENDING" && user?.role === "SHIPPER" && (
              <Button
                variant="primary"
                className="px-4 py-2"
                disabled={isChangingStatus}
                onClick={async () => {
                  const success = await changeOrderStatus(selectedOrder.id, "RETURNING");
                  if (success) {
                    fetchOrderDetail(selectedOrderId);
                    onOrderChange?.();
                  }
                }}
              >
                Xác nhận đã nhận hàng & đang hoàn trả
              </Button>
            )}

            {/* CUSTOMER Actions */}
            {selectedOrder.status === "ARRIVED" && user?.role === "CUSTOMER" && (
              <>
                <Button
                  variant="primary"
                  className="px-4 py-2"
                  disabled={isChangingStatus}
                  onClick={async () => {
                    const success = await changeOrderStatus(selectedOrder.id, "RECEIVED");
                    if (success) {
                      fetchOrderDetail(selectedOrderId);
                      onOrderChange?.();
                    }
                  }}
                >
                  Xác nhận đã nhận hàng
                </Button>
                <Button
                  variant="primary"
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 border-none"
                  disabled={isChangingStatus}
                  onClick={async () => {
                    const success = await changeOrderStatus(selectedOrder.id, "RETURN_PROCESSING");
                    if (success) {
                      fetchOrderDetail(selectedOrderId);
                      onOrderChange?.();
                    }
                  }}
                >
                  Trả hàng/Hoàn tiền
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
