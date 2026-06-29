import { useState, useCallback } from "react";

export default function useFetchProfit() {
    const [profit, setProfit] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProfit = useCallback(async (startDate, endDate) => {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (startDate) params.append("startDate", startDate);
            if (endDate) params.append("endDate", endDate);

            const url = `/api/statistic/profit?${params.toString()}`;

            const response = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error("UNAUTHORIZED");
                }
                throw new Error(`Failed to fetch profit (Status: ${response.status})`);
            }

            const data = await response.json();
            setProfit(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        profit,
        isLoading,
        error,
        fetchProfit,
    };
}
