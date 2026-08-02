import { NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { getUserReferralStats } from '@/lib/referralData';

export const dynamic = 'force-dynamic';

export async function GET() {
  // The user id comes from the session, never from the client.
  const { data: session } = await getAuth().getSession();

  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ stats: await getUserReferralStats(session.user.id) });
}
