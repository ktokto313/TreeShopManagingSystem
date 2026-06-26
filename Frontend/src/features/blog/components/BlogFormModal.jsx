import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

const empty = { title: '', content: '', thumbnail: '', images: [], status: 'PUBLISHED' };

export default function BlogFormModal({ initial = null, onSubmit, onClose, role }) {
    const [form, setForm] = useState(initial ?? empty);
    const [imageInput, setImageInput] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    function set(field, value) {
        setForm(f => ({ ...f, [field]: value }));
    }

    function addImage() {
        const url = imageInput.trim();
        if (!url) return;
        if (form.images.length >= 4) { setError('Tối đa 4 ảnh.'); return; }
        set('images', [...form.images, url]);
        setImageInput('');
    }

    function removeImage(idx) {
        set('images', form.images.filter((_, i) => i !== idx));
    }

    async function handleSubmit(status) {
        setError('');
        setSaving(true);
        try {
            await onSubmit({ ...form, status });
            onClose();
        } catch {
            setError('Lưu thất bại, vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 space-y-5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-green-800">
                            {initial ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
                        </h2>
                        <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-2xl leading-none">&times;</button>
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            {error}
                        </div>
                    )}

                    <Input
                        label="Tiêu đề"
                        value={form.title}
                        onChange={e => set('title', e.target.value)}
                        placeholder="Tiêu đề bài viết (tối đa 100 từ)"
                    />

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-stone-700">Nội dung</label>
                        <textarea
                            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 min-h-40 resize-y"
                            value={form.content}
                            onChange={e => set('content', e.target.value)}
                            placeholder="Nội dung bài viết..."
                        />
                    </div>

                    <Input
                        label="Thumbnail URL"
                        value={form.thumbnail}
                        onChange={e => set('thumbnail', e.target.value)}
                        placeholder="https://..."
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-700">Ảnh gallery (tối đa 4)</label>
                        <div className="flex gap-2">
                            <input
                                className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                value={imageInput}
                                onChange={e => setImageInput(e.target.value)}
                                placeholder="URL ảnh..."
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())}
                            />
                            {/* <Button onClick={addImage} className="hover:bg-green-400 shrink-0">Thêm</Button> */}
                        </div>
                        {form.images.length > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                                {form.images.map((url, i) => (
                                    <div key={i} className="relative group">
                                        <img src={url} alt="" className="w-full h-24 object-cover rounded-lg border border-stone-200" />
                                        <button
                                            onClick={() => removeImage(i)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >×</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2 border-t border-stone-100">
                        {/* Manager có thể save draft */}
                        {role === 'MANAGER' && (
                            <Button
                                disabled={saving}
                                onClick={() => handleSubmit('DRAFT')}
                                className="hover:bg-stone-200 bg-stone-100 text-stone-700"
                            >
                                Lưu nháp
                            </Button>
                        )}
                        {/* Customer cũng có thể save draft */}
                        {role === 'CUSTOMER' && (
                            <Button
                                disabled={saving}
                                onClick={() => handleSubmit('DRAFT')}
                                className="hover:bg-stone-200 bg-stone-100 text-stone-700"
                            >
                                Lưu nháp
                            </Button>
                        )}
                        <Button
                            disabled={saving}
                            onClick={() => handleSubmit('PUBLISHED')}
                            className="hover:bg-green-500 bg-green-400 text-white flex-1"
                        >
                            {saving ? 'Đang lưu...' : (role === 'MANAGER' ? 'Đăng ngay' : 'Gửi duyệt')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}