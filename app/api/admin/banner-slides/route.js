import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/adminAuth';
import { listAllBannerSlides, createBannerSlide } from '@/lib/homeBannerData';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const slides = await listAllBannerSlides();
  return NextResponse.json({ slides });
}

export async function POST(request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const imageUrl = body?.imageUrl?.trim();

  if (!imageUrl) {
    return NextResponse.json({ message: '請提供圖片' }, { status: 400 });
  }

  const slide = await createBannerSlide({
    imageUrl,
    linkHref: body?.linkHref?.trim() || null,
    title: body?.title?.trim() || null,
    subtitle: body?.subtitle?.trim() || null,
    sortOrder: Number.isFinite(body?.sortOrder) ? body.sortOrder : 0,
  });

  return NextResponse.json({ slide }, { status: 201 });
}
