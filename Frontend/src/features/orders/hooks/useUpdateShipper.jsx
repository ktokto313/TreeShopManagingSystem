import { useState } from 'react';

/**
 * Hook to update an order's shipper.
 */
export default function useUpdateShipper() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const updateShipper = async (orderId, shipperId) => {
        if (!shipperId) return null;

        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    "shipperId": shipperId
                }),
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error("UNAUTHORIZED");
                }
                throw new Error(`Failed to update shipper (Status: ${response.status})`);
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
        updateShipper,
        isLoading,
        error,
    };
}
