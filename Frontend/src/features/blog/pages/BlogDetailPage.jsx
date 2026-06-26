import { useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container } from '../../../components/global/Container';
import { Button } from '../../../components/ui/Button';
import { AuthContext } from '../../../context/AuthContext';
import { useBlogDetail, toggleVote } from '../hooks/useBlog';
import { HiThumbUp, HiOutlineThumbUp, HiArrowLeft } from 'react-icons/hi';

export default function BlogDetailPage() {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { blog, loading, error } = useBlogDetail(id);

    async function handleVote() {
        if (!user) { navigate('/login'); return; }
        await toggleVote(id);
        // reload bằng cách navigate lại
        navigate(0);
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-green-50 to-white">
                <Container className="max-w-3xl py-16 space-y-4">
                    <div className="h-8 bg-stone-200 rounded animate-pulse w-2/3" />
                    <div className="h-4 bg-stone-100 rounded animate-pulse w-1/3" />
                    <div className="h-64 bg-stone-100 rounded-2xl animate-pulse" />
                </Container>
            </main>
        );
    }

    if (error || !blog) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-stone-500 text-lg">Bài viết không tồn tại hoặc đã bị xóa.</p>
                    <Button onClick={() => navigate('/blogs')} className="hover:bg-green-400">
                        Quay lại Blog
                    </Button>
                </div>
            </main>
        );
    }

    const date = blog.createdAt
        ? new Date(blog.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })
        : '';

    return (
        <main className="min-h-screen bg-gradient-to-br from-green-50 to-white">
            <Container className="max-w-3xl py-10 space-y-8">
                {/* Back */}
                <button
                    onClick={() => navigate('/blogs')}
                    className="flex items-center gap-2 text-sm text-stone-500 hover:text-green-600 transition-colors"
                >
                    <HiArrowLeft /> Quay lại Blog
                </button>

                {/* Thumbnail */}
                {blog.thumbnail && (
                    <div className="rounded-2xl overflow-hidden h-72 shadow">
                        <img src={blog.thumbnail} alt={blog.title} className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Header */}
                <div className="space-y-3">
                    <h1 className="text-3xl sm:text-4xl font-bold text-green-800 leading-tight">
                        {blog.title}
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-stone-500">
                        <span className="font-medium text-stone-700">{blog.authorName}</span>
                        {date && <><span>·</span><span>{date}</span></>}
                    </div>
                </div>

                {/* Content */}
                <div className="prose prose-green max-w-none text-stone-700 leading-relaxed whitespace-pre-wrap">
                    {blog.content}
                </div>

                {/* Gallery */}
                {blog.images?.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wide">Ảnh đính kèm</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {blog.images.map((url, i) => (
                                <div key={i} className="rounded-xl overflow-hidden border border-stone-200 h-48">
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Vote */}
                <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                    <button
                        onClick={handleVote}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                            blog.votedByCurrentUser
                                ? 'bg-green-50 border-green-300 text-green-600'
                                : 'border-stone-300 text-stone-500 hover:border-green-300 hover:text-green-600'
                        }`}
                    >
                        {blog.votedByCurrentUser
                            ? <HiThumbUp className="text-base" />
                            : <HiOutlineThumbUp className="text-base" />}
                        {blog.votedByCurrentUser ? 'Đã thích' : 'Thích'}
                        <span className="ml-1 font-semibold">{blog.voteCount}</span>
                    </button>
                </div>
            </Container>
        </main>
    );
}