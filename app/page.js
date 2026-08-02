import { listReferralPlatforms } from '@/lib/referralData';
import HomeClient from './home-client';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const platforms = await listReferralPlatforms();

  return <HomeClient initialPlatforms={platforms} />;
}
