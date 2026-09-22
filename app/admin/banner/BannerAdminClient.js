'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import HomeBanner from '@/app/components/HomeBanner';
import '../admin.css';
import './banner-admin.css';

const emptyForm = {
    imageUrl: '',
    title: '',
    subtitle: '',
    linkHref: '',
    sortOrder: 0,
};

async function parseJsonSafe(response) {
    return response.json().catch(() => null);
}

function SlideRow({ slide, onSave, onDelete }) {
    const [draft, setDraft] = useState({
        title: slide.title || '',
        subtitle: slide.subtitle || '',
        linkHref: slide.linkHref || '',
        sortOrder: slide.sortOrder ?? 0,
        isActive: slide.isActive,
    });
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');

    const dirty =
        draft.title !== (slide.title || '') ||
        draft.subtitle !== (slide.subtitle || '') ||
        draft.linkHref !== (slide.linkHref || '') ||
        Number(draft.sortOrder) !== (slide.sortOrder ?? 0) ||
        draft.isActive !== slide.isActive;

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            await onSave(slide.id, {
                title: draft.title,
                subtitle: draft.subtitle,
                linkHref: draft.linkHref,
                sortOrder: Number(draft.sortOrder) || 0,
                isActive: draft.isActive,
            });
        } catch (err) {
            setError(err.message || '儲存失敗');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('確定要刪除這張輪播圖片嗎？')) return;
        setDeleting(true);
        setError('');
        try {
            await onDelete(slide.id);
        } catch (err) {
            setError(err.message || '刪除失敗');
            setDeleting(false);
        }
    };

    return (
        <div className={`banner-row ${!slide.isActive ? 'banner-row-inactive' : ''}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.imageUrl} alt="" className="banner-row-thumb" />

            <div className="banner-row-fields">
                <label>
                    標題
                    <input
                        type="text"
                        value={draft.title}
                        onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                        placeholder="（選填）"
                    />
                </label>
                <label>
                    副標題
                    <input
                        type="text"
                        value={draft.subtitle}
                        onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))}
                        placeholder="（選填）"
                    />
                </label>
                <label>
                    連結
                    <input
                        type="text"
                        value={draft.linkHref}
                        onChange={(e) => setDraft((d) => ({ ...d, linkHref: e.target.value }))}
                        placeholder="/manageCode 或 https://..."
                    />
                </label>
                <label className="banner-row-order">
                    順序
                    <input
                        type="number"
                        value={draft.sortOrder}
                        onChange={(e) => setDraft((d) => ({ ...d, sortOrder: e.target.value }))}
                    />
                </label>
                <label className="banner-row-active">
                    <input
                        type="checkbox"
                        checked={draft.isActive}
                        onChange={(e) => setDraft((d) => ({ ...d, isActive: e.target.checked }))}
                    />
                    啟用中
                </label>
            </div>

            <div className="banner-row-actions">
                <button type="button" onClick={handleSave} disabled={!dirty || saving} className="banner-btn banner-btn-save">
                    {saving ? '儲存中…' : '儲存'}
                </button>
                <button type="button" onClick={handleDelete} disabled={deleting} className="banner-btn banner-btn-delete">
                    {deleting ? '刪除中…' : '刪除'}
                </button>
            </div>

            {error && <div className="banner-row-error">{error}</div>}
        </div>
    );
}

export default function BannerAdminClient({ initialSlides = [], loadError = null }) {
    const [slides, setSlides] = useState(initialSlides);
    const [form, setForm] = useState(emptyForm);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setFormError('');
        try {
            const body = new FormData();
            body.append('file', file);
            const res = await fetch('/api/admin/banner-slides/upload', { method: 'POST', body });
            const data = await parseJsonSafe(res);
            if (!res.ok) {
                throw new Error(data?.message || '圖片上傳失敗');
            }
            setForm((f) => ({ ...f, imageUrl: data.url }));
        } catch (err) {
            setFormError(err.message || '圖片上傳失敗');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleAddSlide = async (e) => {
        e.preventDefault();
        if (!form.imageUrl) {
            setFormError('請先上傳圖片');
            return;
        }

        setSubmitting(true);
        setFormError('');
        try {
            const res = await fetch('/api/admin/banner-slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageUrl: form.imageUrl,
                    title: form.title,
                    subtitle: form.subtitle,
                    linkHref: form.linkHref,
                    sortOrder: Number(form.sortOrder) || 0,
                }),
            });
            const data = await parseJsonSafe(res);
            if (!res.ok) {
                throw new Error(data?.message || '新增失敗');
            }
            setSlides((prev) => [...prev, data.slide]);
            setForm(emptyForm);
        } catch (err) {
            setFormError(err.message || '新增失敗');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveSlide = async (id, patch) => {
        const res = await fetch(`/api/admin/banner-slides/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patch),
        });
        const data = await parseJsonSafe(res);
        if (!res.ok) {
            throw new Error(data?.message || '儲存失敗');
        }
        setSlides((prev) => prev.map((s) => (s.id === id ? data.slide : s)));
    };

    const handleDeleteSlide = async (id) => {
        const res = await fetch(`/api/admin/banner-slides/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const data = await parseJsonSafe(res);
            throw new Error(data?.message || '刪除失敗');
        }
        setSlides((prev) => prev.filter((s) => s.id !== id));
    };

    const previewSlides = useMemo(() => {
        const draft = form.imageUrl
            ? [{
                id: '__draft__',
                imageUrl: form.imageUrl,
                linkHref: form.linkHref || null,
                title: form.title || null,
                subtitle: form.subtitle || null,
                sortOrder: Number(form.sortOrder) || 0,
                isActive: true,
            }]
            : [];

        return [...slides.filter((s) => s.isActive), ...draft].sort(
            (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
        );
    }, [slides, form]);

    return (
        <div className="admin-container banner-admin">
            <Link href="/admin" className="admin-back-link">← 返回管理後台</Link>
            <h1 className="admin-title">首頁輪播圖片管理</h1>
            <p className="admin-subtitle">若尚未設定任何輪播圖片，首頁將自動顯示預設的圖示輪播內容。</p>

            {loadError && <div className="admin-error">{loadError}</div>}

            <section className="banner-preview-section">
                <h2 className="banner-section-title">預覽效果</h2>
                <div className="banner-preview-frame">
                    <HomeBanner slides={previewSlides} preview />
                </div>
                <p className="banner-preview-hint">
                    {previewSlides.length === 0
                        ? '目前沒有啟用中的圖片，首頁將顯示預設輪播內容。'
                        : `目前共 ${previewSlides.length} 張輪播圖片（依順序排列）。`}
                </p>
            </section>

            <section className="banner-form-section">
                <h2 className="banner-section-title">新增輪播圖片</h2>
                <form onSubmit={handleAddSlide} className="banner-form">
                    <label>
                        圖片
                        <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                    </label>
                    {uploading && <p className="banner-upload-status">上傳中…</p>}
                    {form.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={form.imageUrl} alt="" className="banner-form-thumb" />
                    )}
                    <label>
                        標題
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                            placeholder="（選填）"
                        />
                    </label>
                    <label>
                        副標題
                        <input
                            type="text"
                            value={form.subtitle}
                            onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                            placeholder="（選填）"
                        />
                    </label>
                    <label>
                        連結
                        <input
                            type="text"
                            value={form.linkHref}
                            onChange={(e) => setForm((f) => ({ ...f, linkHref: e.target.value }))}
                            placeholder="/manageCode 或 https://..."
                        />
                    </label>
                    <label>
                        順序（數字越小越前面）
                        <input
                            type="number"
                            value={form.sortOrder}
                            onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                        />
                    </label>

                    {formError && <div className="banner-row-error">{formError}</div>}

                    <button type="submit" className="banner-btn banner-btn-add" disabled={uploading || submitting || !form.imageUrl}>
                        {submitting ? '新增中…' : '新增'}
                    </button>
                </form>
            </section>

            <section className="banner-list-section">
                <h2 className="banner-section-title">現有輪播圖片（{slides.length}）</h2>
                {slides.length === 0 ? (
                    <p className="banner-empty">尚未新增任何輪播圖片。</p>
                ) : (
                    <div className="banner-list">
                        {[...slides]
                            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                            .map((slide) => (
                                <SlideRow
                                    key={slide.id}
                                    slide={slide}
                                    onSave={handleSaveSlide}
                                    onDelete={handleDeleteSlide}
                                />
                            ))}
                    </div>
                )}
            </section>
        </div>
    );
}
