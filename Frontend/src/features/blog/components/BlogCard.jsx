import { useNavigate } from 'react-router-dom';
import { HiThumbUp, HiOutlineThumbUp, HiTrash } from 'react-icons/hi';

export default function BlogCard({ blog, onVote, onDelete, currentUser }) {
    const navigate = useNavigate();
    const isManager = currentUser?.role === 'MANAGER';

    const date = blog.createdAt
        ? new Date(blog.createdAt).toLocaleDateString('vi-VN')
        : '';

    return (
        <div
            className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex flex-col"
            onClick={() => navigate(`/blogs/${blog.id}`)}
        >
            {blog.thumbnail && (
                <div className="h-48 overflow-hidden">
                    <img
                        src={blog.thumbnail}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            )}

            <div className="p-5 flex flex-col flex-1 gap-3">
                <h3 className="text-green-800 font-semibold text-lg leading-snug line-clamp-2">
                    {blog.title}
                </h3>

                <p className="text-stone-500 text-sm line-clamp-3 flex-1">
                    {blog.content}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <div className="text-xs text-stone-400">
                        <span className="font-medium text-stone-600">{blog.authorName}</span>
                        {date && <span> · {date}</span>}
                    </div>

                    <div className="flex items-center gap-2">
                        {isManager && (
                            <button
                                className="flex items-center gap-1 text-sm text-stone-400 hover:text-red-500 transition-colors"
                                onClick={e => {
                                    e.stopPropagation();
                                    if (window.confirm(`Xóa bài "${blog.title}"?`)) {
                                        onDelete?.(blog.id);
                                    }
                                }}
                            >
                                <HiTrash className="text-base" />
                            </button>
                        )}

                        {!isManager && (
                            <button
                                className="flex items-center gap-1 text-sm text-stone-500 hover:text-green-600 transition-colors"
                                onClick={e => { e.stopPropagation(); onVote?.(blog.id); }}
                            >
                                {blog.votedByCurrentUser
                                    ? <HiThumbUp className="text-green-500 text-base" />
                                    : <HiOutlineThumbUp className="text-base" />}
                                <span>{blog.voteCount}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}