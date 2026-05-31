import { NextResponse } from 'next/server';

const SUPPORTED_EVENTS = new Set(['used', 'reported']);

export async function POST(request) {
  const body = await request.json().catch(() => null);

  if (!body?.inviteCodeId || !SUPPORTED_EVENTS.has(body.eventType)) {
    return NextResponse.json(
      {
        message: '事件資料不完整',
      },
      { status: 400 },
    );
  }

  // Local JSON is read-only at runtime. This API keeps the frontend contract stable
  // until the event sink is replaced with Firestore, SQL, or another remote service.
  return NextResponse.json({
    ok: true,
    persisted: false,
    event: {
      inviteCodeId: body.inviteCodeId,
      eventType: body.eventType,
      createdAt: new Date().toISOString(),
    },
  });
}
