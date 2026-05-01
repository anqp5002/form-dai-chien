import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

// Tạo Pusher server instance để gửi events
export function getPusherServer(): PusherServer | null {
  if (
    !process.env.PUSHER_APP_ID ||
    !process.env.PUSHER_KEY ||
    !process.env.PUSHER_SECRET
  ) {
    console.log('[Pusher] Missing keys, falling back to polling');
    return null;
  }

  return new PusherServer({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER || 'ap1',
    useTLS: true,
  });
}

// Trigger event đến tất cả client đang subscribe
export async function triggerPusher(
  eventName: string,
  data: Record<string, unknown> = {}
) {
  const server = getPusherServer();
  if (server) {
    try {
      await server.trigger('form-battle', eventName, data);
      console.log(`[Pusher] Triggered: ${eventName}`);
    } catch (err) {
      console.error('[Pusher] Trigger error:', err);
    }
  }
}

// Tạo Pusher client instance để nhận events (browser)
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
