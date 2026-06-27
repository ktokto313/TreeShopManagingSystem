//Create: HungDLM on 27/06/2026
//Lastest update: HungDLM on 27/06/2026
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../../../components/global/Container';
import { Button } from '../../../components/ui/Button';
import { AuthContext } from '../../../context/AuthContext';
import BlogFormModal from '../components/BlogFormModal';
import { createBlog, updateBlog, deleteBlog } from '../hooks/useBlog';

const STATUS_LABEL = {
    PUBLISHED: { text: 'Đã đăng',  cls: 'bg-green-100 text-green-700' },
    PENDING:   { text: 'Chờ duyệt', cls: 'bg-amber-100 text-amber-700' },
    DRAFT:     { text: 'Nháp',      cls: 'bg-stone-100 text-stone-500' },
    REJECTED:  { text: 'Bị từ chối', cls: 'bg-red-100 text-red-600'   },
};

export default function MyBlogPage() {
    const { user } = useContext(AuthContext);
    const role = user?.roleName ?? user?.role;
    const navigate = useNavigate();

    const [posts, setPosts]       = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');
    const [editing, setEditing]   = useState(null);   // blog đang edit
    const [showForm, setShowForm] = useState(false);

    async function load() {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/blogs/my', { credentials: 'include' });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setPosts(Array.isArray(data) ? data : []);
        } catch {
            setError('Không thể tải danh sách bài viết.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function handleCreate(body) {
        await createBlog(body);
        load();
    }

    async function handleUpdate(body) {
        await updateBlog(editing.id, body);
        setEditing(null);
        load();
    }

    async function handleDelete(id) {
        if (!confirm('Xoá bài viết này?')) return;
        await deleteBlog(id);
        load();
    }

    return (
        <main className="bg-gradient-to-br from-green-50 to-white min-h-screen">
            {/* Hero */}
            <section className="bg-gradient-to-r from-green-700 to-green-500 text-white py-14">
                <Container className="max-w-5xl space-y-3">
                    <p className="text-green-200 text-sm font-medium uppercase tracking-widest">Quản lý</p>
                    <h1 className="text-4xl sm:text-5xl font-bold leading-tight">Bài viết của tôi</h1>
                    <p className="text-green-100 text-lg max-w-xl">
                        Xem và quản lý tất cả bài viết bạn đã tạo.
                    </p>
                </Container>
            </section>

            <Container className="max-w-5xl py-10 space-y-6">
                {/* Action bar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-2xl font-semibold text-green-800">
                        Bài viết ({posts.length})
                    </h2>
                    <div className="flex gap-3">
                        <Button
                            className="bg-stone-100 hover:bg-stone-200 text-stone-700"
                            onClick={() => navigate('/blogs')}
                        >
                            ← Quay lại Blog
                        </Button>
                        <Button
                            className="bg-green-500 hover:bg-green-600 text-white"
                            onClick={() => setShowForm(true)}
                        >
                            + Tạo bài viết
                        </Button>
                    </div>
                </div>

                {/* States */}
                {loading && (
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-stone-100 h-24 animate-pulse" />
                        ))}
                    </div>
                )}

                {!loading && error && (
                    <div className="text-center py-16 text-stone-500">{error}</div>
                )}

                {!loading && !error && posts.length === 0 && (
                    <div className="text-center py-16 text-stone-400 border-2 border-dashed border-stone-200 rounded-2xl">
                        Bạn chưa có bài viết nào.
                    </div>
                )}

                {!loading && !error && posts.length > 0 && (
                    <div className="space-y-3">
                        {posts.map(post => {
                            const s = STATUS_LABEL[post.status] ?? STATUS_LABEL.DRAFT;
                            const date = post.createdAt
                                ? new Date(post.createdAt).toLocaleDateString('vi-VN')
                                : '';
                            return (
                                <div
                                    key={post.id}
                                    className="bg-white rounded-2xl border border-stone-200 p-5 flex gap-4 items-start shadow-sm"
                                >
                                    {/* Thumbnail nhỏ */}
                                    {post.thumbnail && (
                                        <img
                                            src={post.thumbnail}
                                            alt=""
                                            className="w-20 h-20 object-cover rounded-xl border border-stone-100 shrink-0"
                                        />
                                    )}

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.cls}`}>
                                                {s.text}
                                            </span>
                                            {date && (
                                                <span className="text-xs text-stone-400">{date}</span>
                                            )}
                                        </div>
                                        <h3
                                            className="font-semibold text-green-800 line-clamp-1 cursor-pointer hover:underline"
                                            onClick={() => post.status === 'PUBLISHED' && navigate(`/blogs/${post.id}`)}
                                        >
                                            {post.title}
                                        </h3>
                                        <p className="text-stone-500 text-sm line-clamp-2">{post.content}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 shrink-0">
                                        <Button
                                            onClick={() => setEditing(post)}
                                            className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs px-3 py-1.5"
                                        >
                                            Sửa
                                        </Button>
                                        {role === 'MANAGER' && (
                                            <Button
                                                onClick={() => handleDelete(post.id)}
                                                className="bg-red-50 hover:bg-red-100 text-red-600 text-xs px-3 py-1.5"
                                            >
                                                Xoá
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Container>

            {/* Modal tạo mới */}
            {showForm && (
                <BlogFormModal
                    role={role}
                    onSubmit={handleCreate}
                    onClose={() => setShowForm(false)}
                />
            )}

            {/* Modal chỉnh sửa */}
            {editing && (
                <BlogFormModal
                    initial={editing}
                    role={role}
                    onSubmit={handleUpdate}
                    onClose={() => setEditing(null)}
                />
            )}
        </main>
    );
}