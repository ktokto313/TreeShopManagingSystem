import { useRef, useState } from 'react';
import MDEditor, { commands } from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

const empty = { title: '', content: '', thumbnail: '', images: [], status: 'PUBLISHED' };
const MAX_IMAGES = 4;

function countInlineImages(markdown) {
    const matches = markdown.match(/!\[[^\]]*\]\([^)]*\)/g);
    return matches ? matches.length : 0;
}

export default function BlogFormModal({ initial = null, onSubmit, onClose, role }) {
    const [form, setForm] = useState(initial ?? empty);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const textApiRef = useRef(null);
    const fileInputRef = useRef(null);
    const thumbnailFileInputRef = useRef(null); // NEW: ref for the thumbnail's hidden input
    const pendingFilesRef = useRef(new Map());  // NEW: blobUrl -> File, not yet uploaded to server
    const thumbnailFileRef = useRef(null);       // NEW: holds the picked thumbnail File until submit

    const imageCount = countInlineImages(form.content);
    const imagesLeft = MAX_IMAGES - imageCount;

    function set(field, value) {
        setForm(f => ({ ...f, [field]: value }));
    }

    // NEW: revokes every blob URL we created, whether it ended up used or not — pure cleanup, no backend calls
    function revokeAllBlobUrls() {
        for (const blobUrl of pendingFilesRef.current.keys()) {
            URL.revokeObjectURL(blobUrl);
        }
        pendingFilesRef.current.clear();
        if (thumbnailFileRef.current?.blobUrl) {
            URL.revokeObjectURL(thumbnailFileRef.current.blobUrl);
        }
        thumbnailFileRef.current = null;
    }

    // NEW: on cancel, just discard everything locally — nothing was ever uploaded
    function handleClose() {
        revokeAllBlobUrls();
        onClose();
    }

    // CHANGED: no fetch here anymore — just create a local preview and stash the File
    function handleInlineFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (countInlineImages(form.content) >= MAX_IMAGES) {
            setError(`Tối đa ${MAX_IMAGES} ảnh trong bài viết.`);
            e.target.value = '';
            return;
        }

        setError('');
        const blobUrl = URL.createObjectURL(file);
        pendingFilesRef.current.set(blobUrl, file);

        const api = textApiRef.current;
        if (api) {
            api.replaceSelection(`\n![](${blobUrl})\n`);
        } else {
            set('content', form.content + `\n![](${blobUrl})\n`);
        }
        e.target.value = '';
    }

    const imageUploadCommand = {
        name: 'image-upload',
        keyCommand: 'image-upload',
        buttonProps: { 'aria-label': 'Chèn ảnh', title: 'Chèn ảnh vào vị trí con trỏ' },
        icon: (
            <svg width="12" height="12" viewBox="0 0 20 20">
                <path
                    fill="currentColor"
                    d="M15 2H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2zm-1.5 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM5 16l3.5-4.5 2.5 3L14.5 10 17 16H5z"
                />
            </svg>
        ),
        execute: (state, api) => {
            if (countInlineImages(form.content) >= MAX_IMAGES) {
                setError(`Tối đa ${MAX_IMAGES} ảnh trong bài viết.`);
                return;
            }
            textApiRef.current = api;
            fileInputRef.current?.click();
        },
    };

    // CHANGED: thumbnail also deferred — local preview only, no upload yet
    function handleThumbnailFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (thumbnailFileRef.current?.blobUrl) {
            URL.revokeObjectURL(thumbnailFileRef.current.blobUrl); // replacing a previous unsaved pick
        }

        const blobUrl = URL.createObjectURL(file);
        thumbnailFileRef.current = { file, blobUrl };
        set('thumbnail', blobUrl);
        e.target.value = '';
    }

    // NEW: uploads only the images that survived to submit time, then swaps blob URLs for real ones
    async function uploadPendingImagesAndFinalize() {
        let finalContent = form.content;
        let finalThumbnail = form.thumbnail;

        // only upload blob URLs that are still actually referenced in the content
        const stillUsed = [...pendingFilesRef.current.entries()]
            .filter(([blobUrl]) => finalContent.includes(blobUrl));

        for (const [blobUrl, file] of stillUsed) {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/blogs/images/upload', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });
            if (!res.ok) throw new Error('Upload ảnh thất bại.');
            const data = await res.json();
            finalContent = finalContent.split(blobUrl).join(data.url);
        }

        if (finalThumbnail && finalThumbnail.startsWith('blob:') && thumbnailFileRef.current) {
            const formData = new FormData();
            formData.append('file', thumbnailFileRef.current.file);
            const res = await fetch('/api/blogs/images/upload', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });
            if (!res.ok) throw new Error('Upload thumbnail thất bại.');
            const data = await res.json();
            finalThumbnail = data.url;
        }

        revokeAllBlobUrls();
        return { finalContent, finalThumbnail };
    }

    async function handleSubmit(status) {
        setError('');
        if (countInlineImages(form.content) > MAX_IMAGES) {
            setError(`Bài viết vượt quá ${MAX_IMAGES} ảnh, vui lòng xóa bớt.`);
            return;
        }
        setSaving(true);
        try {
            const { finalContent, finalThumbnail } = await uploadPendingImagesAndFinalize();
            await onSubmit({ ...form, content: finalContent, thumbnail: finalThumbnail, status });
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
                        <button onClick={handleClose} className="text-stone-400 hover:text-stone-600 text-2xl leading-none">&times;</button>
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

                    <div className="space-y-1" data-color-mode="light">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-stone-700">Nội dung (Markdown)</label>
                            <span className={`text-xs ${imagesLeft <= 0 ? 'text-red-500' : 'text-stone-500'}`}>
                                Ảnh: {imageCount}/{MAX_IMAGES}
                            </span>
                        </div>
                        <MDEditor
                            value={form.content}
                            onChange={(val) => set('content', val ?? '')}
                            preview="live"
                            height={300}
                            commands={[
                                ...commands.getCommands(),
                                commands.divider,
                                imageUploadCommand,
                            ]}
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleInlineFileChange}
                            disabled={imagesLeft <= 0}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-stone-700">Thumbnail</label>
                        <div className="flex gap-2">
                            <input
                                className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                value={form.thumbnail.startsWith('blob:') ? '' : form.thumbnail}
                                onChange={e => set('thumbnail', e.target.value)}
                                placeholder="Dán URL thumbnail..."
                            />
                            <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors shrink-0 bg-stone-100 hover:bg-stone-200 text-stone-700">
                                Chọn file
                                <input
                                    ref={thumbnailFileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleThumbnailFileChange}
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