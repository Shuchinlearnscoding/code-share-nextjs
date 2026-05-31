import { NextResponse } from 'next/server';
import {
  getReferralMetadata,
  listReferralCategories,
  listReferralPlatforms,
} from '@/lib/referralData';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const includeWanted = searchParams.get('includeWanted') === 'true';
  const popularOnly = searchParams.get('popularOnly') === 'true';

  return NextResponse.json({
    metadata: getReferralMetadata(),
    categories: listReferralCategories(),
    platforms: listReferralPlatforms({ includeWanted, popularOnly }),
  });
}
