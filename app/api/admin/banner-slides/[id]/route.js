import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/adminAuth';
import { updateBannerSlide, deleteBannerSlide } from '@/lib/homeBannerData';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }

  const slide = await updateBannerSlide(id, {
    imageUrl: typeof body.imageUrl === 'string' ? body.imageUrl.trim() : undefined,
    linkHref: typeof body.linkHref === 'string' ? body.linkHref.trim() : undefined,
    title: typeof body.title === 'string' ? body.title.trim() : undefined,
    subtitle: typeof body.subtitle === 'string' ? body.subtitle.trim() : undefined,
    sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : undefined,
    isActive: typeof body.isActive === 'boolean' ? body.isActive : undefined,
  });

  if (!slide) {
    return NextResponse.json({ message: 'Slide not found' }, { status: 404 });
  }

  return NextResponse.json({ slide });
}

export async function DELETE(_request, { params }) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  const ok = await deleteBannerSlide(id);

  if (!ok) {
    return NextResponse.json({ message: 'Slide not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
