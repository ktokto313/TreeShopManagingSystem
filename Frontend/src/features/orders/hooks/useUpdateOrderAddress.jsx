import { useState } from 'react';

/**
 * Hook to update an order's shipping address.
 */
export default function useUpdateOrderAddress() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const updateAddress = async (orderId, shippingAddress) => {
        if (!shippingAddress || !shippingAddress.trim()) return null;

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
                    "shippingAddress": shippingAddress
                }),
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error("UNAUTHORIZED");
                }
                throw new Error(`Failed to update address (Status: ${response.status})`);
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
        updateAddress,
        isLoading,
        error,
    };
}
