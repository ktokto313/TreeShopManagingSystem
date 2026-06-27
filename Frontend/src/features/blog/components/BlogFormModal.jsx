import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

const empty = { title: '', content: '', thumbnail: '', images: [], status: 'PUBLISHED' };

export default function BlogFormModal({ initial = null, onSubmit, onClose, role }) {
    const [form, setForm] = useState(initial ?? empty);
    const [imageInput, setImageInput] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    function set(field, value) {
        setForm(f => ({ ...f, [field]: value }));
    }

    function addImage() {
        const url = imageInput.trim();
        if (!url) { setError('Vui lòng nhập URL ảnh.'); return; }
        if (form.images.length >= 4) { setError('Tối đa 4 ảnh.'); return; }
        setError('');
        set('images', [...form.images, url]);
        setImageInput('');
    }

    async function handleThumbnailUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/blogs/images/upload', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            set('thumbnail', data.url);
        } catch {
            setError('Upload thumbnail thất bại.');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    }

    async function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (form.images.length >= 4) { setError('Tối đa 4 ảnh.'); return; }

        setUploading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/blogs/images/upload', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            set('images', [...form.images, data.url]);
        } catch {
            setError('Upload ảnh thất bại.');
        } finally {
            setUploading(false);
            e.target.value = ''; // reset input để chọn lại cùng file nếu cần
        }
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

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-stone-700">Thumbnail</label>
                        <div className="flex gap-2">
                            <input
                                className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                value={form.thumbnail}
                                onChange={e => set('thumbnail', e.target.value)}
                                placeholder="Dán URL thumbnail..."
                            />
                            <label className={`cursor-pointer inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors shrink-0
            ${uploading ? 'bg-stone-100 text-stone-400 pointer-events-none' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'}`}>
                                {uploading ? 'Đang tải...' : 'Chọn file'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleThumbnailUpload}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                        {form.thumbnail && (
                            <img
                                src={form.thumbnail}
                                alt="thumbnail preview"
                                className="w-full h-40 object-cover rounded-lg border border-stone-200 mt-1"
                            />
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-700">
                            Ảnh gallery (tối đa 4) — còn {4 - form.images.length} slot
                        </label>
                        <div className="flex gap-2">
                            <input
                                className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                value={imageInput}
                                onChange={e => setImageInput(e.target.value)}
                                placeholder="Dán URL ảnh..."
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())}
                            />
                            <Button
                                onClick={addImage}
                                className="bg-green-400 hover:bg-green-500 text-white shrink-0"
                            >
                                Thêm URL
                            </Button>
                            <label className={`cursor-pointer inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors shrink-0
                                ${uploading ? 'bg-stone-100 text-stone-400 pointer-events-none' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'}`}>
                                {uploading ? 'Đang tải...' : 'Chọn file'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    disabled={uploading || form.images.length >= 4}
                                />
                            </label>
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
                        {(role === 'MANAGER' || role === 'CUSTOMER') && (
                            <Button
                                disabled={saving}
                                onClick={() => handleSubmit('DRAFT')}
                                className="hover:bg-stone-200 bg-stone-100 text-stone-700"
                            >
                                Lưu nháp
                            </Button>
                        )}
                        <Button
                            disabled={saving || uploading}
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