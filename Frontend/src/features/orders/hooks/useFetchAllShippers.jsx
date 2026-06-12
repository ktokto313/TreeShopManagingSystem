import { useState } from 'react';

/**
 * Fetches all users with the SHIPPER role from the API.
 * Endpoint: GET /api/users?role=SHIPPER
 * Note: The endpoint is not yet implemented on the backend.
 */
export default function useFetchAllShippers() {
    const [shippers, setShippers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchShippers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/users?role=SHIPPER", {
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error("UNAUTHORIZED");
                }
                throw new Error(`Failed to fetch shippers (Status: ${response.status})`);
            }

            const data = await response.json();
            setShippers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        shippers,
        isLoading,
        error,
        fetchShippers,
    };
}
