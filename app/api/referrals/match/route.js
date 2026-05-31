import { NextResponse } from 'next/server';
import { matchReferralCode } from '@/lib/referralData';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const platformId = searchParams.get('platformId');
  const query = searchParams.get('q');
  const excludeIds = searchParams.get('excludeIds')?.split(',').filter(Boolean) || [];

  const match = matchReferralCode({ platformId, query, excludeIds });

  if (!match) {
    return NextResponse.json(
      {
        message: '找不到可用的邀請碼',
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    inviteCode: match,
  });
}
