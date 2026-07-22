import { useState, useCallback, useMemo } from "react";

export default function useFetchProducts(startDate, endDate) {
    const [products, setProducts] = useState([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [productsError, setProductsError] = useState(null);

    const fetchProducts = useCallback(async () => {
        setIsLoadingProducts(true);
        setProductsError(null);
        try {
            const params = new URLSearchParams();
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                params.append("startDate", start.toISOString().substring(0, 19));
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                params.append("endDate", end.toISOString().substring(0, 19));
            }

            const url = `/api/statistic/products?${params.toString()}`;

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
                throw new Error(`Failed to fetch products (Status: ${response.status})`);
            }

            const data = await response.json();
            setProducts(data);
        } catch (err) {
            setProductsError(err.message);
        } finally {
            setIsLoadingProducts(false);
        }
    }, [startDate, endDate]);

    const top5Products = useMemo(() => {
        return [...products].sort((a, b) => b.totalSold - a.totalSold).slice(0, 5);
    }, [products]);

    const pieChartData = useMemo(() => {
        const sortedProducts = [...products].sort((a, b) => b.totalSold - a.totalSold);
        const top5 = sortedProducts.slice(0, 5);
        const others = sortedProducts.slice(5);

        const data = top5.map(p => ({
            name: p.productName,
            value: p.totalSold
        }));

        if (others.length > 0) {
            const othersTotal = others.reduce((sum, p) => sum + p.totalSold, 0);
            data.push({
                name: "Khác",
                value: othersTotal
            });
        }
        return data;
    }, [products]);

    return {
        products,
        top5Products,
        pieChartData,
        isLoadingProducts,
        productsError,
        fetchProducts,
    };
}
