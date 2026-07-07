//Create: HungDLM on 26/06/2026
//Lastest update: HungDLM on 07/07/2026
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
    const [acting, setActing] = useState(null);
    const [preview, setPreview] = useState(null);

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
            if (preview?.id === id) setPreview(null);
        } catch {
            setError('Thao tác thất bại, thử lại.');
        } finally {
            setActing(null);
        }
    }

    function display(post) {
        const isEdit = post.hasPendingEdit;
        return {
            isEdit,
            title: isEdit ? post.pendingTitle : post.title,
            content: isEdit ? post.pendingContent : post.content,
            thumbnail: isEdit ? post.pendingThumbnail : post.thumbnail,
            images: isEdit ? post.pendingImages : post.images,
        };
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

                {console.log("posts in render:", posts)}
                {!loading && posts.map(post => {
                    const d = display(post);
                    return (
                        <div key={post.id} className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-sm">
                            {d.isEdit && (
                                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full inline-block">
                                    Chỉnh sửa bài đã đăng
                                </span>
                            )}
                            <div className="flex gap-4">
                                {d.thumbnail && (
                                    <img
                                        src={d.thumbnail}
                                        alt=""
                                        className="w-24 h-24 rounded-xl object-cover border border-stone-100 shrink-0"
                                    />
                                )}
                                <div className="space-y-1 flex-1 min-w-0">
                                    <h3 className="font-semibold text-green-800 text-lg leading-snug">{d.title}</h3>
                                    <p className="text-sm text-stone-500">bởi {post.authorName}</p>
                                    <p className="text-sm text-stone-600 line-clamp-3">{d.content}</p>
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
                                    onClick={() => setPreview(post)}
                                    className="hover:bg-stone-100 bg-stone-50 text-stone-600 border border-stone-200"
                                >
                                    Xem chi tiết
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </Container>

            {/* Preview Modal */}
            {preview && (() => {
                const d = display(preview);
                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 space-y-5">
                                {/* Header modal */}
                                <div className="flex items-center justify-between">
                                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                                        d.isEdit ? 'text-blue-600 bg-blue-50' : 'text-amber-600 bg-amber-50'
                                    }`}>
                                        {d.isEdit ? 'Chỉnh sửa bài đã đăng' : 'Chờ duyệt'}
                                    </span>
                                    <button
                                        onClick={() => setPreview(null)}
                                        className="text-stone-400 hover:text-stone-600 text-2xl leading-none"
                                    >
                                        &times;
                                    </button>
                                </div>

                                {/* Thumbnail */}
                                {d.thumbnail && (
                                    <div className="rounded-xl overflow-hidden h-56">
                                        <img src={d.thumbnail} alt="" className="w-full h-full object-cover" />
                                    </div>
                                )}

                                {/* Title + meta */}
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold text-green-800">{d.title}</h2>
                                    <p className="text-sm text-stone-500">
                                        bởi <span className="font-medium text-stone-700">{preview.authorName}</span>
                                        {preview.createdAt && (
                                            <> · {new Date(preview.createdAt).toLocaleDateString('vi-VN')}</>
                                        )}
                                    </p>
                                </div>

                                {/* Content */}
                                <div className="text-stone-700 leading-relaxed whitespace-pre-wrap text-sm">
                                    {d.content}
                                </div>

                                {/* Gallery */}
                                {d.images?.length > 0 && (
                                    <div className="grid grid-cols-2 gap-3">
                                        {d.images.map((url, i) => (
                                            <div key={i} className="rounded-xl overflow-hidden h-40 border border-stone-200">
                                                <img src={url} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Current live version, for comparison, when reviewing an edit */}
                                {d.isEdit && (
                                    <div className="pt-4 border-t border-stone-100 space-y-2">
                                        <p className="text-xs font-medium text-stone-400 uppercase tracking-wide">
                                            Bản đang hiển thị (hiện tại)
                                        </p>
                                        <h3 className="font-semibold text-stone-600">{preview.title}</h3>
                                        <p className="text-sm text-stone-500 line-clamp-3">{preview.content}</p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 pt-2 border-t border-stone-100">
                                    <Button
                                        disabled={acting === preview.id}
                                        onClick={() => handle(preview.id, 'approve')}
                                        className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white flex-1"
                                    >
                                        <HiCheck /> Duyệt
                                    </Button>
                                    <Button
                                        disabled={acting === preview.id}
                                        onClick={() => handle(preview.id, 'reject')}
                                        className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white flex-1"
                                    >
                                        <HiX /> Từ chối
                                    </Button>
                                    <Button
                                        onClick={() => setPreview(null)}
                                        className="bg-stone-100 hover:bg-stone-200 text-stone-700"
                                    >
                                        Đóng
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </main>
    );
}