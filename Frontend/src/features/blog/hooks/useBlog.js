import { useState, useEffect, useCallback } from 'react';

const BASE = '/api/blogs';

async function apiFetch(url, options = {}) {
    const res = await fetch(url, { credentials: 'include', ...options });
    if (!res.ok) throw { status: res.status };
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

function buildTagsQuery(tags) {
    if (!tags || tags.length === 0) return '';
    const params = new URLSearchParams();
    tags.forEach(t => params.append('tags', t));
    return `?${params.toString()}`;
}

export function useBlogs(tags = []) {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // stable key so the effect only re-runs when the actual tag selection changes
    const tagsKey = tags.join(',');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await apiFetch(`${BASE}${buildTagsQuery(tags)}`);
            setBlogs(Array.isArray(data) ? data : []);
        } catch {
            setError('Không thể tải danh sách bài viết.');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tagsKey]);

    useEffect(() => { load(); }, [load]);

    return { blogs, loading, error, reload: load };
}

export function useAvailableTags() {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch(`${BASE}/tags`)
            .then(data => setTags(Array.isArray(data) ? data : []))
            .catch(() => setTags([]))
            .finally(() => setLoading(false));
    }, []);

    return { tags, loading };
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