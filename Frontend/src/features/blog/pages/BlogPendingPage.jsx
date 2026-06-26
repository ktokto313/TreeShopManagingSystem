import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../../../components/global/Container';
import { Button } from '../../../components/ui/Button';
import { getPending, approveBlog, rejectBlog } from '../hooks/useBlog';
import { HiArrowLeft, HiCheck, HiX } from 'react-icons/hi';

export default function BlogPendingPage() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [acting, setActing] = useState(null); // postId đang xử lý

    async function load() {
        setLoading(true);
        setError('');
        try {
            const data = await getPending();
            setPosts(Array.isArray(data) ? data : []);
        } catch {
            setError('Không thể tải danh sách chờ duyệt.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function handle(id, action) {
        setActing(id);
        try {
            action === 'approve' ? await approveBlog(id) : await rejectBlog(id);
            setPosts(p => p.filter(b => b.id !== id));
        } catch {
            setError('Thao tác thất bại, thử lại.');
        } finally {
            setActing(null);
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-amber-50 to-white">
            <Container className="max-w-4xl py-10 space-y-6">
                <button
                    onClick={() => navigate('/blogs')}
                    className="flex items-center gap-2 text-sm text-stone-500 hover:text-green-600 transition-colors"
                >
                    <HiArrowLeft /> Quay lại Blog
                </button>

                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-amber-800">Duyệt bài viết</h1>
                    <p className="text-stone-500 text-sm">Xem xét và phê duyệt các bài viết đang chờ.</p>
                </div>

                {error && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-stone-100 h-40 animate-pulse" />
                        ))}
                    </div>
                )}

                {!loading && posts.length === 0 && !error && (
                    <div className="text-center py-20 text-stone-400 border-2 border-dashed border-stone-200 rounded-2xl">
                        Không có bài viết nào chờ duyệt.
                    </div>
                )}

                {!loading && posts.map(post => (
                    <div key={post.id} className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-sm">
                        <div className="flex gap-4">
                            {post.thumbnail && (
                                <img
                                    src={post.thumbnail}
                                    alt=""
                                    className="w-24 h-24 rounded-xl object-cover border border-stone-100 shrink-0"
                                />
                            )}
                            <div className="space-y-1 flex-1 min-w-0">
                                <h3 className="font-semibold text-green-800 text-lg leading-snug">{post.title}</h3>
                                <p className="text-sm text-stone-500">bởi {post.authorName}</p>
                                <p className="text-sm text-stone-600 line-clamp-3">{post.content}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2 border-t border-stone-100">
                            <Button
                                disabled={acting === post.id}
                                onClick={() => handle(post.id, 'approve')}
                                className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white"
                            >
                                <HiCheck /> Duyệt
                            </Button>
                            <Button
                                disabled={acting === post.id}
                                onClick={() => handle(post.id, 'reject')}
                                className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white"
                            >
                                <HiX /> Từ chối
                            </Button>
                            <Button
                                onClick={() => navigate(`/blogs/${post.id}`)}
                                className="hover:bg-stone-100 bg-stone-50 text-stone-600 border border-stone-200"
                            >
                                Xem chi tiết
                            </Button>
                        </div>
                    </div>
                ))}
            </Container>
        </main>
    );
}