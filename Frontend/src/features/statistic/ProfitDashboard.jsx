import { useState, useEffect } from 'react';
import { Container } from '../../components/global/Container';
import useFetchProfit from './hooks/useFetchProfit';
import useFetchProducts from './hooks/useFetchOrders';
import { Skeleton } from '../../components/ui/Skeleton';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
export default function ProfitDashboard() {
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const { profit, isLoading, error, fetchProfit } = useFetchProfit();
    const { fetchProducts, top5Products, pieChartData } = useFetchProducts(startDate, endDate);

    useEffect(() => {
        fetchProfit(startDate, endDate);
        fetchProducts();
    }, [fetchProfit, fetchProducts]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

    return (
        <div className="min-h-screen flex flex-col bg-bg-base font-main">
            <main className="grow py-8 bg-linear-to-b from-bg-base to-bg-surface/30">
                <Container>
                    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight">
                                Bảng Thống Kê Lợi Nhuận
                            </h1>
                            <p className="text-sm text-black/60 mt-1">
                                Thống kê doanh số bán hàng
                            </p>
                        </div>
                    </div>

                    <div className="bg-bg-surface/40 border border-border/60 rounded-2xl p-4 mb-8 backdrop-blur-sm flex flex-col gap-4 lg:flex-row lg:items-end">
                        <div className="flex flex-col gap-1.5 grow">
                            <label className="text-xs font-bold text-black/70">Ngày bắt đầu</label>
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2.5 bg-bg-base border border-border/80 rounded-xl text-sm text-black focus:outline-none focus:border-interactive transition-colors"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 grow">
                            <label className="text-xs font-bold text-black/70">Ngày kết thúc</label>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2.5 bg-bg-base border border-border/80 rounded-xl text-sm text-black focus:outline-none focus:border-interactive transition-colors"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-8 rounded-xl border border-red-500/20 bg-red-500/5 text-center mb-8">
                            <p className="text-sm text-red-600 font-medium">{error === 'UNAUTHORIZED' ? 'Bạn cần đăng nhập bằng tài khoản quản lý để xem dữ liệu này.' : error}</p>
                        </div>
                    )}

                    {!error && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <div className="p-8 rounded-2xl border border-border/60 bg-bg-surface/60 backdrop-blur-sm text-center flex flex-col justify-center">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-black/50 mb-4">Tổng lợi nhuận</h3>
                                <div className="text-5xl md:text-6xl font-black text-interactive">
                                    {isLoading ? (
                                        <Skeleton className="h-16 w-64 mx-auto" />
                                    ) : (
                                        profit !== null ? `${Number(profit).toLocaleString('vi-VN')}đ` : "0đ"
                                    )}
                                </div>
                            </div>
                            <div className="p-8 rounded-2xl border border-border/60 bg-bg-surface/60 backdrop-blur-sm">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-black/50 mb-4 text-center">Thị phần sản phẩm trong khoảng thời gian</h3>
                                <div className="h-80 w-full">
                                    {pieChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {pieChartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-black/50">Không có sản phẩm nào trong khoảng thời gian đã chọn</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {!error && (
                        <div className="bg-bg-surface/40 border border-border/60 rounded-2xl p-6 backdrop-blur-sm">
                            <h3 className="text-lg font-bold text-black mb-4">Top 5 sản phẩm bán chạy nhất</h3>
                            {top5Products.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-black/80">
                                        <thead className="bg-bg-base/50 text-xs uppercase text-black/60 border-b border-border/60">
                                            <tr>
                                                <th className="px-4 py-3">ID sản phẩm</th>
                                                <th className="px-4 py-3">Tên sản phẩm</th>
                                                <th className="px-4 py-3">Tổng số đã bán</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {top5Products.map(product => (
                                                <tr key={product.productId} className="border-b border-border/30 hover:bg-black/5 transition-colors">
                                                    <td className="px-4 py-3 font-medium">#{product.productId}</td>
                                                    <td className="px-4 py-3">{product.productName}</td>
                                                    <td className="px-4 py-3 font-semibold text-interactive">{product.totalSold}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-black/50">Chưa có sản phẩm nào được bán trong giai đoạn này</div>
                            )}
                        </div>
                    )}
                </Container>
            </main>
        </div>
    );
}
