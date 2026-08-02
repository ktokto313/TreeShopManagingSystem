import { Link } from 'react-router-dom';
import { Container } from '../../../components/global/Container';
import { useBlogs } from '../../blog/hooks/useBlog';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function BlogHighlight() {
    const { blogs, loading, error } = useBlogs();
    const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

    const recentBlogs = blogs?.slice(0, 4) || [];

    if (!loading && (error || recentBlogs.length === 0)) {
        return null;
    }

    return (
        <section className="py-16 bg-green-200/30 overflow-hidden" ref={ref}>
            <Container>
                {loading ? (
                    <div className="h-64 bg-stone-100 animate-pulse rounded-3xl w-full"></div>
                ) : (
                    <>
                        <div 
                            className={`flex flex-col md:flex-row justify-between items-end mb-12 transition-all duration-700 transform ${
                                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                            }`}
                        >
                            <div className="max-w-2xl">
                                <h2 className="text-3xl font-bold text-green-800 mb-4">Góc Chia Sẻ</h2>
                                <p className="text-green-600">
                                    Cập nhật những mẹo chăm sóc cây xanh và xu hướng trang trí không gian sống 
                                    mới nhất từ cộng đồng Greenshop.
                                </p>
                            </div>
                            <Link 
                                to="/blogs" 
                                className="mt-4 md:mt-0 px-6 py-2 text-green-700 bg-green-50 rounded-full font-medium hover:bg-green-100 transition whitespace-nowrap"
                            >
                                Xem tất cả
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {recentBlogs.map((blog, idx) => (
                                <Link 
                                    key={blog.id || idx} 
                                    to={`/blogs/${blog.id}`}
                                    className={`group flex flex-col gap-4 transition-all duration-700 transform ${
                                        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
                                    }`}
                                    style={{ transitionDelay: `${idx * 150}ms` }}
                                >
                                    <div className="relative h-60 rounded-3xl overflow-hidden shadow-sm border border-stone-100">
                                        <img 
                                            src={blog.thumbnail || 'https://images.unsplash.com/photo-1416879598555-27db45eb62df?auto=format&fit=crop&q=80&w=600'} 
                                            alt={blog.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-green-800">
                                            {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('vi-VN') : 'Mới'}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-green-800 group-hover:text-green-600 transition-colors line-clamp-2">
                                            {blog.title}
                                        </h3>
                                        <p className="text-stone-500 text-sm mt-2 line-clamp-2">
                                            {blog.summary || blog.content?.replace(/<[^>]*>?/gm, '') || 'Nhấn để đọc chi tiết bài viết này.'}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </Container>
        </section>
    );
}
