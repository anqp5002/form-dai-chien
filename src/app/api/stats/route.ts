import { NextResponse } from 'next/server';
import { getStats, resetStats } from '@/lib/store';

// API Route cho polling fallback (khi không có Pusher)
// Dashboard sẽ gọi endpoint này mỗi 1-2 giây để lấy stats mới nhất

export async function GET() {
  const stats = getStats();
  return NextResponse.json(stats);
}

// POST để reset stats (cho MC dùng)
export async function POST(request: Request) {
  const body = await request.json();
  if (body.action === 'reset') {
    resetStats();
    return NextResponse.json({ message: 'Stats đã được reset!' });
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
