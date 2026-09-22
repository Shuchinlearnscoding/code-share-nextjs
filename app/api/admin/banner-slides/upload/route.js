import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getAdminUser } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export async function POST(request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get('file');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ message: '請選擇圖片檔案' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ message: '僅支援 JPEG、PNG、WebP 或 GIF 圖片' }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ message: '圖片大小需在 5MB 以內' }, { status: 400 });
  }

  const ext = (file.name?.split('.').pop() || file.type.split('/')[1] || 'jpg').toLowerCase();
  const key = `home-banner/${Date.now()}-${randomUUID()}.${ext}`;

  try {
    const blob = await put(key, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch (err) {
    console.error('[admin/banner-slides/upload] blob upload failed', err);
    return NextResponse.json({ message: '圖片上傳失敗，請確認 Blob 儲存設定' }, { status: 500 });
  }
}
