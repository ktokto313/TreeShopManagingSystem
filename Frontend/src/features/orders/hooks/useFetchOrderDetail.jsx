import { useState } from 'react';
import { useCallback } from 'react';

export default function useFetchOrderDetail() {
    const [orderDetail, setOrderDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchOrderDetail = useCallback(async (orderId) => {
        if (!orderId) {
            setOrderDetail(null);
            return false;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error("UNAUTHORIZED");
                }
                throw new Error(`Failed to fetch order detail (Status: ${response.status})`);
            }

            const data = await response.json();
            setOrderDetail(data);
        } catch (err) {
            setError(err.message);
            setOrderDetail(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        orderDetail,
        isLoading,
        error,
        fetchOrderDetail,
    };
}
