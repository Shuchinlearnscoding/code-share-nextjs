import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/adminAuth';
import { listAllBannerSlides } from '@/lib/homeBannerData';
import BannerAdminClient from './BannerAdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminBannerPage() {
  const admin = await getAdminUser();
  if (!admin) {
    redirect('/auth/login');
  }

  let slides = [];
  let loadError = null;
  try {
    slides = await listAllBannerSlides();
  } catch (err) {
    console.error('[admin/banner] failed to load slides', err);
    loadError = '無法載入輪播圖片資料，請確認資料庫連線設定';
  }

  return <BannerAdminClient initialSlides={slides} loadError={loadError} />;
}
