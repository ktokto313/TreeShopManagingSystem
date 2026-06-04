import { useState, useEffect } from 'react';
import { Header } from '../components/global/Header';
import { Footer } from '../components/global/Footer';
import { Container } from '../components/global/Container';
import { OrderCard } from '../features/orders/OrderCard';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { loginApi } from '../data/authApi';
import { timeFormat } from '../utils/timeFormat';
import useAuthUser from '../hooks/useAuthUser';

export default function OrderManagement() {
  const { isLoading, error, executeAuth } = useAuthUser();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  useEffect(() => {
    executeAuth();
  }, []);

  const fetchOrders = async () => {
    const response = await fetch("/api/orders", {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include"
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error("UNAUTHORIZED");
      }
      throw new Error(`Failed to fetch orders (Status: ${response.status})`);
    }

    const data = await response.json();
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleTestLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      await loginApi();
      // Wait a moment and then re-fetch
      await fetchOrders();
    } catch (err) {
      setError(`Authentication failed: ${err.message}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Compute metrics
  const totalOrders = orders.length;

  const activeOrdersCount = orders.filter(o =>
    ['PROCESSING', 'PENDING', 'DELIVERING', 'RETURN_PENDING', 'RETURNING'].includes(o.status)
  ).length;

  const totalSpent = orders.reduce((sum, order) => {
    const orderDetails = order.orderDetailList || [];
    const itemsTotal = orderDetails.reduce((iSum, item) => iSum + (Number(item.pricePaid || 0) * (item.quantity || 0)), 0);
    const shippingFee = Number(order.shippingFee || 0);
    const discount = Number(order.discount || 0);
    return sum + Math.max(0, itemsTotal + shippingFee - discount);
  }, 0);

  // Filter and Search Logic
  const filteredOrders = orders.filter(order => {
    // Search filter
    const matchesSearch =
      order.id.toString().includes(searchQuery) ||
      (order.shippingAddress && order.shippingAddress.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Tab filter
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'PENDING') return order.status === 'PENDING';
    if (selectedFilter === 'PROCESSING') return order.status === 'PROCESSING';
    if (selectedFilter === 'DELIVERING') return order.status === 'DELIVERING';
    if (selectedFilter === 'COMPLETED') return ['RECEIVED', 'ARRIVED'].includes(order.status);
    if (selectedFilter === 'FAILED') return ['FAILED', 'RETURN_PENDING', 'RETURNING'].includes(order.status);

    return true;
  });

  // Render Modal Details Breakdown
  const renderOrderDetailsModal = () => {
    if (!selectedOrder) return null;

    const details = selectedOrder.orderDetailList || [];
    const itemsTotal = details.reduce((sum, item) => sum + (Number(item.pricePaid || 0) * (item.quantity || 0)), 0);
    const shippingFee = Number(selectedOrder.shippingFee || 0);
    const discount = Number(selectedOrder.discount || 0);
    const finalTotal = Math.max(0, itemsTotal + shippingFee - discount);

    return (
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order Details - #ORD-${selectedOrder.id}`}
      >
        <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Status Banner */}
          <div className="rounded-lg bg-interactive/10 p-3 flex items-center justify-between border border-interactive/20">
            <div>
              <span className="text-[10px] uppercase font-bold text-black/55">Status</span>
              <p className="text-sm font-bold text-interactive mt-0.5">{selectedOrder.status}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-black/55">Ordered On</span>
              <p className="text-xs font-semibold text-black/75 mt-0.5">{timeFormat(selectedOrder.createdAt)}</p>
            </div>
          </div>

          {/* Items Section */}
          <div>
            <h4 className="text-xs font-bold text-black/60 uppercase tracking-wider mb-2">Items Breakdown</h4>
            <div className="space-y-2">
              {details.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-bg-base border border-border/55">
                  <div className="flex flex-col max-w-[200px]">
                    <span className="text-sm font-semibold text-black/90 truncate">
                      {item.product?.name || 'Unknown Product'}
                    </span>
                    <span className="text-[10px] text-black/45 mt-0.5">
                      SKU: {item.product?.sku || 'N/A'}
                    </span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="text-sm font-bold text-black/85">
                      ${(Number(item.pricePaid || 0) * (item.quantity || 0)).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-black/50 mt-0.5">
                      ${Number(item.pricePaid || 0).toFixed(2)} x {item.quantity}
                    </span>
                  </div>
                </div>
              ))}
              {details.length === 0 && (
                <p className="text-sm text-black/40 italic">No products listed in this order.</p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="p-3 rounded-lg bg-bg-base border border-border/55">
            <h4 className="text-xs font-bold text-black/60 uppercase tracking-wider mb-1.5">Shipping Address</h4>
            <p className="text-xs text-black/80 leading-relaxed">
              {selectedOrder.shippingAddress || 'No shipping address specified.'}
            </p>
          </div>

          {/* Pricing Summary */}
          <div className="space-y-1.5 border-t border-border/60 pt-3 text-sm text-black/75">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold">${itemsTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="font-semibold text-green-600">+${shippingFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount Applied</span>
              <span className="font-semibold text-red-500">-${discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-border/60 pt-2 text-base font-extrabold text-black">
              <span>Grand Total</span>
              <span className="text-interactive">${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Close / Actions */}
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="secondary" className="px-4 py-2" onClick={() => setSelectedOrder(null)}>
              Close
            </Button>
            <Button
              variant="primary"
              className="px-4 py-2"
              onClick={() => {
                alert(`Receipt for Order #ORD-${selectedOrder.id} sent to printer!`);
              }}
            >
              Print Receipt
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-base font-main">
      <Header />

      <main className="flex-grow py-8 bg-gradient-to-b from-bg-base to-bg-surface/30">
        <Container>
          {/* Header Title Section */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight">
                Order Dashboard
              </h1>
              <p className="text-sm text-black/60 mt-1">
                Manage, trace, and inspect customer transactions and fulfillment statuses.
              </p>
            </div>
            <Button
              variant="secondary"
              className="self-start md:self-auto flex items-center gap-2"
              onClick={fetchOrders}
              disabled={isLoading}
            >
              <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15.57M21 21v-5h-.581m0 0a8.003 8.003 0 01-15.357-2" />
              </svg>
              Refresh Orders
            </Button>
          </div>

          {/* Statistics/Metrics Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <div className="p-5 rounded-xl border border-border/60 bg-bg-surface/40 backdrop-blur-sm relative overflow-hidden group hover:border-interactive/40 transition-all duration-300">
              <span className="text-xs font-bold uppercase tracking-wider text-black/50">Total Orders</span>
              <p className="text-3xl font-black text-black mt-2">
                {isLoading ? <Skeleton className="h-9 w-16 mt-1" /> : totalOrders}
              </p>
              <div className="absolute right-4 bottom-4 text-interactive/10 group-hover:text-interactive/20 transition-all duration-300">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-border/60 bg-bg-surface/40 backdrop-blur-sm relative overflow-hidden group hover:border-interactive/40 transition-all duration-300">
              <span className="text-xs font-bold uppercase tracking-wider text-black/50">Active Deliveries</span>
              <p className="text-3xl font-black text-black mt-2">
                {isLoading ? <Skeleton className="h-9 w-16 mt-1" /> : activeOrdersCount}
              </p>
              <div className="absolute right-4 bottom-4 text-interactive/10 group-hover:text-interactive/20 transition-all duration-300">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-border/60 bg-bg-surface/40 backdrop-blur-sm relative overflow-hidden group hover:border-interactive/40 transition-all duration-300">
              <span className="text-xs font-bold uppercase tracking-wider text-black/50">Total Revenue Generated</span>
              <p className="text-3xl font-black text-interactive mt-2">
                {isLoading ? (
                  <Skeleton className="h-9 w-32 mt-1" />
                ) : (
                  `$${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                )}
              </p>
              <div className="absolute right-4 bottom-4 text-interactive/10 group-hover:text-interactive/20 transition-all duration-300">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16V5" />
                </svg>
              </div>
            </div>
          </div>

          {/* Search and Filters controls panel */}
          <div className="bg-bg-surface/40 border border-border/60 rounded-2xl p-4 mb-8 backdrop-blur-sm flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
            {/* Search */}
            <div className="relative flex-grow max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black/40">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by Order ID or Shipping Address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-bg-base border border-border/80 rounded-xl text-sm text-black placeholder-black/40 focus:outline-none focus:border-interactive transition-colors"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'ALL', label: 'All Orders' },
                { id: 'PENDING', label: 'Pending' },
                { id: 'PROCESSING', label: 'Processing' },
                { id: 'DELIVERING', label: 'Delivering' },
                { id: 'COMPLETED', label: 'Completed' },
                { id: 'FAILED', label: 'Failed & Returns' },
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
                <div key={i} className="min-h-[260px] p-6 rounded-xl border border-border bg-bg-surface/20 flex flex-col justify-between">
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
                {error === 'UNAUTHORIZED' ? 'Authentication Required' : 'Failed to Load Orders'}
              </h3>
              <p className="text-sm text-black/60 mb-6 leading-relaxed">
                {error === 'UNAUTHORIZED'
                  ? 'You need to be signed in to access your order dashboard.'
                  : error
                }
              </p>
              {error === 'UNAUTHORIZED' ? (
                <Button
                  variant="primary"
                  onClick={handleTestLogin}
                  disabled={isLoggingIn}
                  className="px-6 py-2.5 shadow-md"
                >
                  {isLoggingIn ? 'Logging In...' : 'Log In as Test User'}
                </Button>
              ) : (
                <Button variant="primary" onClick={fetchOrders} className="px-6 py-2.5">
                  Try Again
                </Button>
              )}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredOrders.length === 0 && (
            <div className="text-center py-16 px-4 max-w-md mx-auto">
              <div className="w-16 h-16 bg-interactive/10 text-interactive rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-black mb-1">No Orders Found</h3>
              <p className="text-sm text-black/60 mb-6">
                {searchQuery || selectedFilter !== 'ALL'
                  ? "We couldn't find any orders matching your search query or filter."
                  : "You haven't placed any orders yet. Visit our shop catalog to find your next favorite tree!"
                }
              </p>
              {(searchQuery || selectedFilter !== 'ALL') ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedFilter('ALL');
                  }}
                  className="px-5 py-2"
                >
                  Clear Filters
                </Button>
              ) : (
                <a href="/">
                  <Button variant="primary" className="px-5 py-2">
                    Browse Shop
                  </Button>
                </a>
              )}
            </div>
          )}

          {/* Orders Grid List */}
          {!isLoading && !error && filteredOrders.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onViewDetails={setSelectedOrder}
                />
              ))}
            </div>
          )}
        </Container>
      </main>

      <Footer />
      {renderOrderDetailsModal()}
    </div>
  );
}
