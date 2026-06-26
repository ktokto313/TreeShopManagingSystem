import React, { useState, useEffect } from 'react';
import { Container } from '../../components/global/Container';
import { Button } from '../../components/ui/Button';
import useFetchProfit from './hooks/useFetchProfit';
import { Skeleton } from '../../components/ui/Skeleton';

export default function ProfitDashboard() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const { profit, isLoading, error, fetchProfit } = useFetchProfit();

    useEffect(() => {
        // Default to last 30 days
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        
        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];
        
        setStartDate(startStr);
        setEndDate(endStr);
        
        fetchProfit(startStr, endStr);
    }, [fetchProfit]);

    const handleFilter = () => {
        if (startDate && endDate) {
            fetchProfit(startDate, endDate);
        }
    };

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
                        <div className="p-8 rounded-2xl border border-border/60 bg-bg-surface/60 backdrop-blur-sm text-center">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-black/50 mb-4">Total Profit Generated</h3>
                            <div className="text-5xl md:text-6xl font-black text-interactive">
                                {isLoading ? (
                                    <Skeleton className="h-16 w-64 mx-auto" />
                                ) : (
                                    profit !== null ? `$${Number(profit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'
                                )}
                            </div>
                        </div>
                    )}
                </Container>
            </main>
        </div>
    );
}
