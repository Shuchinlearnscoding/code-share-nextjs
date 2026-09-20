import { NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { listUserInviteCodes, createUserInviteCode } from '@/lib/referralData';

export const dynamic = 'force-dynamic';

async function requireUser() {
  const { data: session } = await getAuth().getSession();
  return session?.user ?? null;
}

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const inviteCodes = await listUserInviteCodes(user.id);
  return NextResponse.json({ inviteCodes });
}

export async function POST(request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const platformId = body?.platformId?.trim();
  const platformName = body?.platformName?.trim();
  const code = body?.code?.trim();
  const expiresAt = body?.expiresAt || null;

  if ((!platformId && !platformName) || !code) {
    return NextResponse.json({ message: '平台與邀請碼為必填' }, { status: 400 });
  }

  const result = await createUserInviteCode(user.id, { platformId, platformName, code, expiresAt });

  if (result.error === 'platform_not_found') {
    return NextResponse.json({ message: '此平台尚未支援新增邀請碼，請選擇清單中的平台' }, { status: 400 });
  }
  if (result.error === 'limit_reached') {
    return NextResponse.json({ message: '此平台的邀請碼已達上限（2 組）' }, { status: 409 });
  }

  return NextResponse.json({ inviteCode: result.inviteCode }, { status: 201 });
}
