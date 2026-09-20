import { NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import {
  setUserInviteCodeStatus,
  updateUserInviteCode,
  softDeleteUserInviteCode,
} from '@/lib/referralData';

export const dynamic = 'force-dynamic';

async function requireUser() {
  const { data: session } = await getAuth().getSession();
  return session?.user ?? null;
}

export async function PATCH(request, { params }) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);

  let inviteCode;

  if (body?.status) {
    if (!['active', 'inactive'].includes(body.status)) {
      return NextResponse.json({ message: '無效的狀態' }, { status: 400 });
    }
    inviteCode = await setUserInviteCodeStatus(user.id, id, body.status);
  } else {
    const code = body?.code?.trim();
    if (!code) {
      return NextResponse.json({ message: '邀請碼為必填' }, { status: 400 });
    }
    inviteCode = await updateUserInviteCode(user.id, id, {
      code,
      expiresAt: body?.expiresAt || null,
    });
  }

  if (!inviteCode) {
    return NextResponse.json({ message: '找不到邀請碼' }, { status: 404 });
  }

  return NextResponse.json({ inviteCode });
}

export async function DELETE(_request, { params }) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const ok = await softDeleteUserInviteCode(user.id, id);

  if (!ok) {
    return NextResponse.json({ message: '找不到邀請碼' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
