import { NextResponse } from 'next/server';
import { triggerPusher } from '@/lib/pusher';

// API test Pusher — truy cập /api/test-pusher để kiểm tra
export async function GET() {
  const hasKeys = !!(
    process.env.PUSHER_APP_ID &&
    process.env.PUSHER_KEY &&
    process.env.PUSHER_SECRET
  );

  if (!hasKeys) {
    return NextResponse.json({
      status: 'ERROR',
      message: 'Missing Pusher environment variables!',
      vars: {
        PUSHER_APP_ID: !!process.env.PUSHER_APP_ID,
        PUSHER_KEY: !!process.env.PUSHER_KEY,
        PUSHER_SECRET: !!process.env.PUSHER_SECRET,
        PUSHER_CLUSTER: process.env.PUSHER_CLUSTER || 'NOT SET',
      },
    });
  }

  try {
    await triggerPusher('click-miss', { count: 1, source: 'test-api' });
    return NextResponse.json({
      status: 'SUCCESS',
      message: 'Pusher event triggered! Check dashboard.',
      vars: {
        PUSHER_APP_ID: '✅ SET',
        PUSHER_KEY: '✅ SET',
        PUSHER_SECRET: '✅ SET',
        PUSHER_CLUSTER: process.env.PUSHER_CLUSTER || 'ap1',
      },
    });
  } catch (err) {
    return NextResponse.json({
      status: 'ERROR',
      message: `Pusher trigger failed: ${err instanceof Error ? err.message : String(err)}`,
    });
  }
}
