import { useState, useEffect, useCallback } from 'react';
import { requestJson } from '../../../utils/api';

export function useHomepageTestimonials() {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadTestimonials = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await requestJson('/api/reviews/curated');
            setTestimonials(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load testimonials', err);
            setError('Không thể tải đánh giá.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTestimonials();
    }, [loadTestimonials]);

    return { testimonials, loading, error, reload: loadTestimonials };
}
