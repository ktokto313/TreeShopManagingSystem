import { useState, useCallback, useMemo } from "react";

export default function useFetchOrders(startDate, endDate) {
    const [orders, setOrders] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [ordersError, setOrdersError] = useState(null);

    const fetchOrders = useCallback(async () => {
        setIsLoadingOrders(true);
        setOrdersError(null);
        try {
            const response = await fetch('/api/orders', {
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error("UNAUTHORIZED");
                }
                throw new Error(`Failed to fetch orders (Status: ${response.status})`);
            }

            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setOrdersError(err.message);
        } finally {
            setIsLoadingOrders(false);
        }
    }, []);

    const filteredOrders = useMemo(() => {
        if (!orders) return [];
        if (!startDate || !endDate) return orders;
        const start = new Date(startDate);
        start.setHours(0,0,0,0);
        const end = new Date(endDate);
        end.setHours(23,59,59,999);
        
        return orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= start && orderDate <= end && order.status === "RECEIVED";
        });
    }, [orders, startDate, endDate]);

    const pieChartData = useMemo(() => {
        const counts = {};
        filteredOrders.forEach(order => {
            const dateStr = new Date(order.createdAt).toISOString().split('T')[0];
            counts[dateStr] = (counts[dateStr] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [filteredOrders]);

    return {
        orders,
        filteredOrders,
        pieChartData,
        isLoadingOrders,
        ordersError,
        fetchOrders,
    };
}
