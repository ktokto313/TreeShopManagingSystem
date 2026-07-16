//Create: HungDLM on 26/06/2026
//Lastest update: HungDLM on 29/06/2026
import { useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../../../components/global/Container';
import { Button } from '../../../components/ui/Button';
import { AuthContext } from '../../../context/AuthContext';
import BlogCard from '../components/BlogCard';
import BlogFormModal from '../components/BlogFormModal';
import { useBlogs, useAvailableTags, toggleVote, createBlog, deleteBlog } from '../hooks/useBlog';

export default function BlogPage() {
    const { user } = useContext(AuthContext);
    const role = user?.roleName ?? user?.role;
    const navigate = useNavigate();

    const [selectedTags, setSelectedTags] = useState([]);
    const { blogs, loading, error, reload } = useBlogs(selectedTags);
    const { tags: availableTags } = useAvailableTags(); // [{ value, label }]
    const [showForm, setShowForm] = useState(false);

    // { CARE_TIPS: "Mẹo chăm sóc", ... } — passed down so cards can show labels, not raw enum values
    const tagLabelMap = useMemo(
        () => Object.fromEntries(availableTags.map(t => [t.value, t.label])),
        [availableTags]
    );

    function toggleTag(value) {
        setSelectedTags(prev =>
            prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value]
        );
    }

    async function handleVote(id) {
        if (!user) { navigate('/login'); return; }
        await toggleVote(id);
        reload();
    }

    async function handleCreate(body) {
        await createBlog(body);
        reload();
    }

    async function handleDelete(id) {
        await deleteBlog(id);
        reload();
    }

    return (
        <main className="bg-gradient-to-br from-green-50 to-white min-h-screen">
            {/* Hero */}
            <section className="bg-gradient-to-r from-green-700 to-green-500 text-white py-14">
                <Container className="max-w-5xl space-y-3">
                    <p className="text-green-200 text-sm font-medium uppercase tracking-widest">Cộng đồng xanh</p>
                    <h1 className="text-4xl sm:text-5xl font-bold leading-tight">Blog cây xanh</h1>
                    <p className="text-green-100 text-lg max-w-xl">
                        Chia sẻ kinh nghiệm trồng cây, chăm sóc và trang trí không gian sống với cộng đồng.
                    </p>
                </Container>
            </section>

            <Container className="max-w-5xl py-10 space-y-6">
                {/* Action bar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-2xl font-semibold text-green-800">
                        Bài viết ({blogs.length})
                    </h2>
                    <div className="flex gap-3">
                        {(role === 'CUSTOMER' || role === 'MANAGER') && (
                            <Button
                                className="bg-green-500 hover:bg-green-600 text-white"
                                onClick={() => setShowForm(true)}
                            >
                                + Tạo bài viết
                            </Button>
                        )}
                        {(role === 'CUSTOMER' || role === 'MANAGER') && (
                            <Button
                                className="bg-stone-100 hover:bg-stone-200 text-stone-700"
                                onClick={() => navigate('/blogs/my')}
                            >
                                Bài viết của tôi
                            </Button>
                        )}
                        {role === 'MANAGER' && (
                            <Button
                                className="bg-amber-500 hover:bg-amber-600 text-white"
                                onClick={() => navigate('/blogs/pending')}
                            >
                                Duyệt bài
                            </Button>
                        )}
                    </div>
                </div>

                {/* Tag filter — fixed taxonomy, always shown regardless of what's currently in use */}
                {availableTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {availableTags.map(tag => {
                            const active = selectedTags.includes(tag.value);
                            return (
                                <button
                                    key={tag.value}
                                    onClick={() => toggleTag(tag.value)}
                                    className={
                                        active
                                            ? 'bg-green-600 text-white px-3 py-1 rounded-full text-sm transition-colors'
                                            : 'bg-white text-green-700 border border-green-300 hover:bg-green-50 px-3 py-1 rounded-full text-sm transition-colors'
                                    }
                                >
                                    {tag.label}
                                </button>
                            );
                        })}
                        {selectedTags.length > 0 && (
                            <button
                                onClick={() => setSelectedTags([])}
                                className="text-sm text-stone-400 hover:text-stone-600 px-2"
                            >
                                Xóa lọc
                            </button>
                        )}
                    </div>
                )}

                {/* States */}
                {loading && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-stone-100 h-72 animate-pulse" />
                        ))}
                    </div>
                )}

                {!loading && error && (
                    <div className="text-center py-16 text-stone-500">{error}</div>
                )}

                {!loading && !error && blogs.length === 0 && (
                    <div className="text-center py-16 text-stone-400 border-2 border-dashed border-stone-200 rounded-2xl">
                        {selectedTags.length > 0
                            ? 'Không có bài viết nào phù hợp với danh mục đã chọn.'
                            : 'Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ!'}
                    </div>
                )}

                {!loading && !error && blogs.length > 0 && (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {blogs.map(blog => (
                            <BlogCard
                                key={blog.id}
                                blog={blog}
                                onVote={handleVote}
                                onDelete={handleDelete}
                                currentUser={user}
                                tagLabelMap={tagLabelMap}
                            />
                        ))}
                    </div>
                )}
            </Container>

            {showForm && (
                <BlogFormModal
                    role={role}
                    onSubmit={handleCreate}
                    onClose={() => setShowForm(false)}
                />
            )}
        </main>
    );
}