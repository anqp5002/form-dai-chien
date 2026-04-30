import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

// ============================================
// SERVER-SIDE: Pusher instance để trigger events
// ============================================

// Dùng globalThis để tránh duplicate instance khi hot-reload
declare global {
  // eslint-disable-next-line no-var
  var __pusherServer: PusherServer | undefined;
}

export function getPusherServer(): PusherServer | null {
  if (
    !process.env.PUSHER_APP_ID ||
    !process.env.PUSHER_KEY ||
    !process.env.PUSHER_SECRET
  ) {
    // Không có Pusher keys → dùng polling fallback
    return null;
  }

  if (!globalThis.__pusherServer) {
    globalThis.__pusherServer = new PusherServer({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER || 'ap1',
      useTLS: true,
    });
  }

  return globalThis.__pusherServer;
}

// Hàm trigger event — tự động fallback nếu không có Pusher
export async function triggerPusher(
  eventName: string,
  data: Record<string, unknown> = {}
) {
  const server = getPusherServer();
  if (server) {
    try {
      await server.trigger('form-battle', eventName, data);
    } catch (err) {
      console.error('[Pusher] Trigger error:', err);
    }
  }
  // Nếu không có Pusher → client sẽ dùng polling qua API route
}

// ============================================
// CLIENT-SIDE: Pusher instance để subscribe
// ============================================

let pusherClient: PusherClient | null = null;

export function getPusherClient(): PusherClient | null {
  if (typeof window === 'undefined') return null;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || key === 'your_key') return null;

  if (!pusherClient) {
    pusherClient = new PusherClient(key, {
      cluster: cluster || 'ap1',
    });
  }

  return pusherClient;
}
