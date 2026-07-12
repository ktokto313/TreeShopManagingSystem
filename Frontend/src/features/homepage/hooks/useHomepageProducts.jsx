import { useState, useEffect, useCallback } from 'react';
import { requestJson } from '../../../utils/api';

export function useHomepageProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('Sản Phẩm Bán Chạy Mọi Thời Đại'); // Default fallback title
    const [error, setError] = useState(null);

    const loadProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // First, try fetching for the current month
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
            
            let data = await requestJson(`/api/statistic/products?startDate=${startOfMonth}&endDate=${endOfMonth}`);
            
            let topProducts = Array.isArray(data) ? data : [];

            if (topProducts.length < 4) {
                // Fallback to all-time
                const startOfAllTime = new Date(2000, 0, 1).toISOString();
                data = await requestJson(`/api/statistic/products?startDate=${startOfAllTime}&endDate=${endOfMonth}`);
                topProducts = Array.isArray(data) ? data : [];
                setTitle('Sản Phẩm Bán Chạy Nhất Mọi Thời Đại');
            } else {
                setTitle('Sản Phẩm Bán Chạy Nhất Tháng Này');
            }

            topProducts = topProducts.slice(0, 4);

            // Fetch full details for each top product
            const fullProductsPromises = topProducts.map(p => 
                requestJson(`/api/products/${p.productId}`).catch(() => null)
            );
            
            const fullProducts = (await Promise.all(fullProductsPromises)).filter(p => p !== null);
            setProducts(fullProducts);
        } catch (err) {
            console.error('Failed to load homepage products', err);
            setError('Không thể tải dữ liệu sản phẩm.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    return { products, loading, error, title };
}
