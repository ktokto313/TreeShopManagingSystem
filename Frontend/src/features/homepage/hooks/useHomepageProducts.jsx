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
            const data = await requestJson('/api/products/homepage-featured');
            if (data) {
                setProducts(data.products || []);
                setTitle(data.title || 'Sản Phẩm Bán Chạy');
            }
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
