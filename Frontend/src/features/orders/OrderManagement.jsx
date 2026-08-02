import { useEffect } from 'react';
import { Container } from '../../components/global/Container';
import { OrderCard } from './OrderCard';
import { Button } from '../../components/ui/Button';
import { useState } from 'react';
import useFetchAllOrders from './hooks/useFetchAllOrders';
import OrderModal from './OrderModal';
import { Skeleton } from '../../components/ui/Skeleton';
import { TbReload } from "react-icons/tb";
import { PageBar } from '../../components/ui/PageBar';

export default function OrderManagement() {
  const {
    orders,
    isLoading,
    error,
    selectedFilter,
    setSelectedFilter,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    fetchOrders,
  } = useFetchAllOrders();

  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, currentPage]);

  // Compute metrics
  const totalOrders = totalElements;

  return (
    <div className="min-h-screen flex flex-col bg-bg-base font-main">
      <main className="grow py-8 bg-linear-to-b from-bg-base to-bg-surface/30">
        <Container>
          {/* Header Title Section */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight">
                Quản lý Đơn Hàng
              </h1>
              <p className="text-sm text-black/60 mt-1">
                Quản lý, theo dõi và kiểm tra các giao dịch và trạng thái đơn hàng của khách hàng.
              </p>
            </div>
            <Button
              variant="secondary"
              className="self-start md:self-auto flex items-center gap-1"
              onClick={fetchOrders}
              disabled={isLoading}
            >
              <TbReload></TbReload>
              Làm mới
            </Button>
          </div>

          {/* Statistics/Metrics Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            <div className="p-5 rounded-xl border border-border/60 bg-bg-surface/40 backdrop-blur-sm relative overflow-hidden group hover:border-interactive/40 transition-all duration-300">
              <span className="text-xs font-bold uppercase tracking-wider text-black/50">Tổng số đơn hàng trong bộ lọc</span>
              <div className="text-3xl font-black text-black mt-2">
                {isLoading ? <Skeleton className="h-9 w-16 mt-1" /> : totalOrders}
              </div>
              <div className="absolute right-4 bottom-4 text-interactive/10 group-hover:text-interactive/20 transition-all duration-300">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>

            {/*<div className="p-5 rounded-xl border border-border/60 bg-bg-surface/40 backdrop-blur-sm relative overflow-hidden group hover:border-interactive/40 transition-all duration-300">
              <span className="text-xs font-bold uppercase tracking-wider text-black/50">Đang Giao</span>
              <div className="text-3xl font-black text-black mt-2">
                {isLoading ? <Skeleton className="h-9 w-16 mt-1" /> : totalOrders}
              </div>
              <div className="absolute right-4 bottom-4 text-interactive/10 group-hover:text-interactive/20 transition-all duration-300">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div> */}
          </div>

          {/* Search and Filters controls panel */}
          <div className="bg-bg-surface/40 border border-border/60 rounded-2xl p-4 mb-8 backdrop-blur-sm flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
            {/* Search */}
            <div className="relative grow max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black/40">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm theo mã đơn hàng hoặc địa chỉ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-bg-base border border-border/80 rounded-xl text-sm text-black placeholder-black/40 focus:outline-none focus:border-interactive transition-colors"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'ALL', label: 'Tất cả' },
                { id: 'PROCESSING', label: 'Đang xử lý' },
                { id: 'PENDING', label: 'Chờ lấy hàng' },
                { id: 'DELIVERING', label: 'Đang giao' },
                { id: 'TORECEIVE', label: 'Chờ nhận'},
                { id: 'COMPLETED', label: 'Hoàn thành' },
                { id: 'FAILED', label: 'Thất bại & Hoàn trả' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${selectedFilter === tab.id
                    ? 'bg-interactive text-white shadow-sm'
                    : 'bg-bg-base hover:bg-border/40 text-black/75 border border-border/60'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loader State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="min-h-64 p-6 rounded-xl border border-border bg-bg-surface/20 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <div className="space-y-2 pt-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-5/6" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-t border-border pt-4">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-8 w-24 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error / Unauthorized State */}
          {!isLoading && error && (
            <div className="p-8 rounded-xl border border-red-500/20 bg-red-500/5 text-center max-w-lg mx-auto">
              <div className="w-12 h-12 bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-black mb-2">
                {error === 'UNAUTHORIZED' ? 'Yêu cầu xác thực' : 'Lỗi khi tải đơn hàng'}
              </h3>
              <p className="text-sm text-black/60 mb-6 leading-relaxed">
                {error === 'UNAUTHORIZED'
                  ? 'Bạn cần đăng nhập để truy cập quản lý đơn hàng.'
                  : error
                }
              </p>
              <Button variant="primary" onClick={fetchOrders} className="px-6 py-2.5">
                Thử Lại
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && orders.length === 0 && (
            <div className="text-center py-16 px-4 max-w-md mx-auto">
              <div className="w-16 h-16 bg-interactive/10 text-interactive rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-black mb-1">Không tìm thấy đơn hàng</h3>
              <p className="text-sm text-black/60 mb-6">
                {searchQuery || selectedFilter !== 'ALL'
                  ? "Chúng tôi không thể tìm thấy đơn hàng nào khớp với tìm kiếm hoặc bộ lọc của bạn."
                  : "Chưa có đơn hàng nào được đặt."
                }
              </p>
              {(searchQuery || selectedFilter !== 'ALL') && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedFilter('ALL');
                  }}
                  className="px-5 py-2"
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          )}

          {/* Orders Grid List */}
          {!isLoading && !error && orders.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onViewDetails={(selectedOrder) => setSelectedOrderId(selectedOrder.id)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !error && totalPages > 1 && (
            <PageBar
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="mt-8"
            />
          )}
        </Container>
      </main>

      {/* Order Detail Modal */}
      <OrderModal
        selectedOrderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        onOrderChange={() => fetchOrders()}
      />
    </div>
  );
}
