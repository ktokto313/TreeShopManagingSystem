// Utility functions cho việc in hóa đơn / phiếu xác nhận

/**
 * Lấy thông tin document dựa trên status đơn hàng
 * @param {string} status - Trạng thái đơn hàng
 * @returns {{ title: string, actionLabel: string, canPrint: boolean }}
 */
export const getOrderDocumentInfo = (status) => {
  switch (status) {
    case 'PROCESSING':
      return {
        title: 'PHIẾU XÁC NHẬN ĐƠN HÀNG',
        actionLabel: 'In phiếu xác nhận',
        canPrint: true,
      };
    case 'PENDING':
    case 'CONFIRMED':
    case 'DELIVERING':
    case 'ARRIVED':
    case 'RECEIVED':
    case 'CANCELLED':
      return {
        title: 'HÓA ĐƠN BÁN HÀNG',
        actionLabel: 'In hóa đơn',
        canPrint: true,
      };
    case 'RETURN_REQUESTED':
    case 'RETURN_APPROVED':
    case 'RETURN_COMPLETED':
    case 'RETURN_REJECTED':
    case 'RETURN_PROCESSING':
    case 'RETURN_PENDING':
    case 'RETURNING':
      return {
        title: 'HÓA ĐƠN BÁN HÀNG',
        actionLabel: 'In hóa đơn',
        canPrint: true,
      };
    case 'FAILED':
    default:
      return {
        title: null,
        actionLabel: null,
        canPrint: false,
      };
  }
};

/**
 * Định dạng số tiền VND
 * @param {number} value - Số tiền
 * @returns {string}
 */
export const formatCurrency = (value) => {
  if (value == null || isNaN(value)) return '0đ';
  return Number(value).toLocaleString('vi-VN') + 'đ';
};

/**
 * Định dạng ngày
 * @param {string|Date} dateString - Ngày cần format
 * @returns {string}
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('vi-VN');
};

/**
 * Chuẩn hóa dữ liệu order cho document
 * @param {object} order - Order object từ API
 * @returns {object}
 */
export const normalizeOrderDocument = (order) => {
  const details = order?.orderDetailList || [];

  return {
    id: order?.id || 0,
    code: order?.code || `ORD-${order?.id || 0}`,
    customerName: order?.customerName || order?.fullName || 'N/A',
    customerPhone: order?.customerPhone || order?.phone || 'N/A',
    customerEmail: order?.customerEmail || order?.email || '',
    shippingAddress: order?.shippingAddress || order?.address || 'N/A',
    createdAt: order?.createdAt || order?.orderDate || null,
    notes: order?.notes || order?.customerNotes || '',
    subtotal: order?.subtotal || details.reduce((sum, item) => sum + (Number(item.pricePaid || 0) * (item.quantity || 0)), 0),
    shippingFee: Number(order?.shippingFee || 0),
    discount: Number(order?.discount || 0),
    total: order?.total || order?.finalTotal || 0,
    paymentMethod: order?.paymentMethod || order?.paymentType || 'N/A',
    paymentStatus: order?.paymentStatus || 'N/A',
    items: details.map((item, index) => ({
      stt: index + 1,
      name: item.productName || item.name || 'N/A',
      sku: item.sku || '',
      price: Number(item.pricePaid || item.price || 0),
      quantity: item.quantity || 0,
      total: Number((item.pricePaid || item.price || 0) * (item.quantity || 0)),
    })),
  };
};
