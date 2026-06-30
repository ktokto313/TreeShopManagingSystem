import { useState, useEffect } from 'react';
import { Container } from '../../components/global/Container';
import { Button } from '../../components/ui/Button';
import useFetchProfit from './hooks/useFetchProfit';
import useFetchOrders from './hooks/useFetchOrders';
import { Skeleton } from '../../components/ui/Skeleton';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
export default function ProfitDashboard() {
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const { profit, isLoading, error, fetchProfit } = useFetchProfit();
    const { fetchOrders, filteredOrders, pieChartData } = useFetchOrders(startDate, endDate);

    useEffect(() => {
        fetchProfit(startDate, endDate);
        fetchOrders();
    }, [fetchProfit, fetchOrders]);

    const handleFilter = () => {
        if (startDate && endDate) {
            fetchProfit(startDate, endDate);
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

    return (
        <div className="min-h-screen flex flex-col bg-bg-base font-main">
            <main className="grow py-8 bg-linear-to-b from-bg-base to-bg-surface/30">
                <Container>
                    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight">
                                Profit Dashboard
                            </h1>
                            <p className="text-sm text-black/60 mt-1">
                                Analyze your store's profitability over time.
                            </p>
                        </div>
                    </div>

                    <div className="bg-bg-surface/40 border border-border/60 rounded-2xl p-4 mb-8 backdrop-blur-sm flex flex-col gap-4 lg:flex-row lg:items-end">
                        <div className="flex flex-col gap-1.5 grow">
                            <label className="text-xs font-bold text-black/70">Start Date</label>
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2.5 bg-bg-base border border-border/80 rounded-xl text-sm text-black focus:outline-none focus:border-interactive transition-colors"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 grow">
                            <label className="text-xs font-bold text-black/70">End Date</label>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2.5 bg-bg-base border border-border/80 rounded-xl text-sm text-black focus:outline-none focus:border-interactive transition-colors"
                            />
                        </div>
                        <Button 
                            onClick={handleFilter} 
                            disabled={isLoading || !startDate || !endDate}
                            className="py-2.5"
                        >
                            {isLoading ? 'Calculating...' : 'Apply Filter'}
                        </Button>
                    </div>

                    {error && (
                        <div className="p-8 rounded-xl border border-red-500/20 bg-red-500/5 text-center mb-8">
                            <p className="text-sm text-red-600 font-medium">{error === 'UNAUTHORIZED' ? 'You need to be signed in as a manager to view this data.' : error}</p>
                        </div>
                    )}

                    {!error && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <div className="p-8 rounded-2xl border border-border/60 bg-bg-surface/60 backdrop-blur-sm text-center flex flex-col justify-center">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-black/50 mb-4">Total Profit Generated</h3>
                                <div className="text-5xl md:text-6xl font-black text-interactive">
                                    {isLoading ? (
                                        <Skeleton className="h-16 w-64 mx-auto" />
                                    ) : (
                                        profit !== null ? `$${Number(profit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'
                                    )}
                                </div>
                            </div>
                            <div className="p-8 rounded-2xl border border-border/60 bg-bg-surface/60 backdrop-blur-sm">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-black/50 mb-4 text-center">Orders per Day</h3>
                                <div className="h-64 w-full">
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
                                        <div className="h-full flex items-center justify-center text-black/50">No orders found for this date range</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {!error && (
                        <div className="bg-bg-surface/40 border border-border/60 rounded-2xl p-6 backdrop-blur-sm">
                            <h3 className="text-lg font-bold text-black mb-4">List of Orders</h3>
                            {filteredOrders.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-black/80">
                                        <thead className="bg-bg-base/50 text-xs uppercase text-black/60 border-b border-border/60">
                                            <tr>
                                                <th className="px-4 py-3">Order ID</th>
                                                <th className="px-4 py-3">Date</th>
                                                <th className="px-4 py-3">Status</th>
                                                <th className="px-4 py-3">Shipping Fee</th>
                                                <th className="px-4 py-3">Discount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredOrders.map(order => (
                                                <tr key={order.id} className="border-b border-border/30 hover:bg-black/5 transition-colors">
                                                    <td className="px-4 py-3 font-medium">#{order.id}</td>
                                                    <td className="px-4 py-3">{new Date(order.createdAt).toLocaleString()}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="px-2 py-1 bg-interactive/10 text-interactive rounded text-xs font-semibold">
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">${order.shippingFee ? Number(order.shippingFee).toFixed(2) : '0.00'}</td>
                                                    <td className="px-4 py-3">${order.discount ? Number(order.discount).toFixed(2) : '0.00'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-black/50">No orders in this period.</div>
                            )}
                        </div>
                    )}
                </Container>
            </main>
        </div>
    );
}
