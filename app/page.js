import { listReferralPlatforms } from '@/lib/referralData';
import { listActiveBannerSlides } from '@/lib/homeBannerData';
import HomeClient from './home-client';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const platforms = await listReferralPlatforms();

  let bannerSlides = [];
  try {
    bannerSlides = await listActiveBannerSlides();
  } catch (err) {
    console.error('[home] failed to load banner slides, falling back to defaults', err);
  }

  return <HomeClient initialPlatforms={platforms} bannerSlides={bannerSlides} />;
}
