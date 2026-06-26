import { useState, useEffect, useCallback } from 'react';

const BASE = '/api/blogs';

async function apiFetch(url, options = {}) {
    const res = await fetch(url, { credentials: 'include', ...options });
    if (!res.ok) throw { status: res.status };
    return res.json();
}

export function useBlogs() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await apiFetch(BASE);
            setBlogs(Array.isArray(data) ? data : []);
        } catch {
            setError('Không thể tải danh sách bài viết.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    return { blogs, loading, error, reload: load };
}

export function useBlogDetail(id) {
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError('');
        apiFetch(`${BASE}/${id}`)
            .then(data => setBlog(data))
            .catch(() => setError('Không thể tải bài viết.'))
            .finally(() => setLoading(false));
    }, [id]);

    return { blog, loading, error };
}

export async function toggleVote(id) {
    return apiFetch(`${BASE}/${id}/vote`, { method: 'POST' });
}

export async function createBlog(body) {
    return apiFetch(BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

export async function updateBlog(id, body) {
    return apiFetch(`${BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

export async function deleteBlog(id) {
    return apiFetch(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function getPending() {
    return apiFetch(`${BASE}/pending`);
}

export async function approveBlog(id) {
    return apiFetch(`${BASE}/${id}/approve`, { method: 'POST' });
}

export async function rejectBlog(id) {
    return apiFetch(`${BASE}/${id}/reject`, { method: 'POST' });
}