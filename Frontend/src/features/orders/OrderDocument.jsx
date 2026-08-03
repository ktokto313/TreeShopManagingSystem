import React from 'react';
import { formatCurrency, formatDate, normalizeOrderDocument, getOrderDocumentInfo } from './utils/orderDocumentUtils';

// CSS cho in ấn - chỉ hiện #printable-order-document
const printStyles = `
  @page {
    size: A4;
    margin: 12mm;
  }

  @media print {
    body * {
      visibility: hidden;
    }
    #printable-order-document,
    #printable-order-document * {
      visibility: visible;
    }
    #printable-order-document {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      display: block !important;
      visibility: visible !important;
      background: white !important;
      box-shadow: none !important;
    }
  }

  /* Mặc định ẩn document khi xem trên màn hình */
  #printable-order-document {
    display: none !important;
  }
`;

const OrderDocument = ({ order, status }) => {
  const normalizedOrder = normalizeOrderDocument(order);
  const documentInfo = getOrderDocumentInfo(status);
  const isProcessing = status === 'PROCESSING';
  const isReturning = status?.startsWith('RETURN_') || status === 'RETURNING';

  return (
    <>
      <style>{printStyles}</style>
      <div
        id="printable-order-document"
        style={{
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '14px',
          lineHeight: '1.5',
          color: '#000',
          background: '#fff',
          padding: '20px',
          maxWidth: '210mm',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '1px solid #ddd', paddingBottom: '16px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#2e7d32' }}>
            GREENSHOP
          </h1>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 12px 0' }}>
            {documentInfo.title}
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '13px', color: '#555' }}>
            <span>Mã đơn: <strong>#ORD-{normalizedOrder.id}</strong></span>
            <span>Ngày: <strong>{formatDate(normalizedOrder.createdAt)}</strong></span>
          </div>
          {!isProcessing && (
            <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>
              Thanh toán: <strong style={{ color: '#2e7d32' }}>Đã thanh toán</strong>
            </div>
          )}
        </div>

        {/* Customer Info */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
            Thông tin khách hàng
          </h3>
          <table style={{ width: '100%', fontSize: '13px' }}>
            <tbody>
              <tr>
                <td style={{ width: '100px', color: '#666', padding: '3px 0' }}>Họ tên:</td>
                <td style={{ padding: '3px 0', fontWeight: '500' }}>{normalizedOrder.customerName}</td>
              </tr>
              <tr>
                <td style={{ color: '#666', padding: '3px 0' }}>Điện thoại:</td>
                <td style={{ padding: '3px 0' }}>{normalizedOrder.customerPhone}</td>
              </tr>
              {normalizedOrder.customerEmail && (
                <tr>
                  <td style={{ color: '#666', padding: '3px 0' }}>Email:</td>
                  <td style={{ padding: '3px 0' }}>{normalizedOrder.customerEmail}</td>
                </tr>
              )}
              <tr>
                <td style={{ color: '#666', padding: '3px 0', verticalAlign: 'top' }}>Địa chỉ:</td>
                <td style={{ padding: '3px 0' }}>{normalizedOrder.shippingAddress}</td>
              </tr>
              {normalizedOrder.notes && (
                <tr>
                  <td style={{ color: '#666', padding: '3px 0', verticalAlign: 'top' }}>Ghi chú:</td>
                  <td style={{ padding: '3px 0', fontStyle: 'italic' }}>{normalizedOrder.notes}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Items Table */}
        <div style={{ marginBottom: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', width: '40px' }}>STT</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Tên sản phẩm</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', width: '60px' }}>SL</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', width: '100px' }}>Đơn giá</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', width: '110px' }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {normalizedOrder.items.map((item) => (
                <tr key={item.stt}>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{item.stt}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>
                    {item.name}
                    {item.sku && <span style={{ color: '#999', fontSize: '11px' }}> (SKU: {item.sku})</span>}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{formatCurrency(item.price)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <table style={{ fontSize: '13px', minWidth: '240px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 16px 4px 0', textAlign: 'right' }}>Tạm tính:</td>
                <td style={{ padding: '4px 0', textAlign: 'right', minWidth: '100px' }}>{formatCurrency(normalizedOrder.subtotal)}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 16px 4px 0', textAlign: 'right' }}>Phí vận chuyển:</td>
                <td style={{ padding: '4px 0', textAlign: 'right' }}>{formatCurrency(normalizedOrder.shippingFee)}</td>
              </tr>
              {normalizedOrder.discount > 0 && (
                <tr style={{ color: '#c62828' }}>
                  <td style={{ padding: '4px 16px 4px 0', textAlign: 'right' }}>Giảm giá:</td>
                  <td style={{ padding: '4px 0', textAlign: 'right' }}>-{formatCurrency(normalizedOrder.discount)}</td>
                </tr>
              )}
              <tr style={{ fontSize: '16px', fontWeight: 'bold' }}>
                <td style={{ padding: '8px 16px 8px 0', textAlign: 'right', borderTop: '2px solid #333' }}>TỔNG CỘNG:</td>
                <td style={{ padding: '8px 0', textAlign: 'right', borderTop: '2px solid #333', color: '#2e7d32' }}>
                  {formatCurrency(normalizedOrder.total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Status Message */}
        {isProcessing && (
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            padding: '10px 12px',
            marginBottom: '16px',
            fontSize: '12px',
            color: '#856404',
          }}>
            Đơn hàng chưa được thanh toán. Đây là phiếu xác nhận đơn hàng, không phải hóa đơn thanh toán.
          </div>
        )}

        {isReturning && (
          <div style={{
            background: '#e3f2fd',
            border: '1px solid #90caf9',
            borderRadius: '4px',
            padding: '10px 12px',
            marginBottom: '16px',
            fontSize: '12px',
            color: '#1565c0',
          }}>
            Đơn hàng đang trong quá trình xử lý trả hàng.
          </div>
        )}

        {/* Payment Method */}
        {!isProcessing && normalizedOrder.paymentMethod && (
          <div style={{ marginBottom: '20px', fontSize: '13px' }}>
            <strong>Phương thức thanh toán:</strong> {normalizedOrder.paymentMethod}
          </div>
        )}

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #ddd',
          fontSize: '12px',
          color: '#666',
        }}>
          <p style={{ margin: '4px 0' }}>Cảm ơn bạn đã mua hàng tại GREENSHOP.</p>
          <p style={{ margin: '4px 0' }}>Vui lòng giữ chứng từ để được hỗ trợ khi cần thiết.</p>
          <p style={{ margin: '4px 0', fontStyle: 'italic' }}>Tài liệu này không phải hóa đơn VAT.</p>
        </div>
      </div>
    </>
  );
};

export default OrderDocument;
