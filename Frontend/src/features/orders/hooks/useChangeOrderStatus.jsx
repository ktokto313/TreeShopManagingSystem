import { useState } from 'react';

/**
 * Hook to update an order's status.
 */
export default function useChangeOrderStatus() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const changeOrderStatus = async (orderId, status) => {
        if (!orderId || !status) return null;

        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/orders/${orderId}/status?status=${status}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Không thể thực hiện");
                } else if (response.status === 403) {
                    throw new Error(`${await response.text()}`)
                }
                throw new Error(`Failed to update status (Status: ${response.status})`);
            }
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        changeOrderStatus,
        isLoading,
        error,
    };
}
