'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getPusherClient } from '@/lib/pusher';
import type { StatsData } from '@/lib/store';

export default function DashboardTV() {
  const [stats, setStats] = useState<StatsData>({
    clickMiss: 0,
    validationFail: 0,
    hackAttempt: 0,
    successCount: 0,
    submissions: [],
  });
  const [recentEvents, setRecentEvents] = useState<
    Array<{ id: number; text: string; type: string }>
  >([]);
  const [confetti, setConfetti] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const eventIdRef = useRef(0);

  // Add event to feed
  const addEvent = useCallback((text: string, type: string) => {
    const id = ++eventIdRef.current;
    setRecentEvents((prev) => [{ id, text, type }, ...prev].slice(0, 15));
  }, []);

  // Try Pusher first, fallback to polling
  useEffect(() => {
    const pusher = getPusherClient();

    if (pusher) {
      // === PUSHER MODE ===
      const channel = pusher.subscribe('form-battle');
      setIsConnected(true);

      channel.bind('click-miss', () => {
        setStats((s) => ({ ...s, clickMiss: s.clickMiss + 1 }));
        addEvent('🎯 Có người click trượt!', 'miss');
      });

      channel.bind('validation-fail', (data: { errors: Record<string, string[]> }) => {
        setStats((s) => ({ ...s, validationFail: s.validationFail + 1 }));
        const fieldNames = Object.keys(data.errors || {}).join(', ');
        addEvent(`❌ Validation fail: ${fieldNames}`, 'fail');
      });

      channel.bind('hack-attempt', (data: { email: string; message: string }) => {
        setStats((s) => ({ ...s, hackAttempt: s.hackAttempt + 1 }));
        addEvent(`🔓 HACK: ${data.email} — ${data.message}`, 'hack');
      });

      channel.bind('success-event', (data: { email: string }) => {
        setStats((s) => ({ ...s, successCount: s.successCount + 1 }));
        addEvent(`🎉 THÀNH CÔNG: ${data.email}`, 'success');
        setConfetti(true);
        setTimeout(() => setConfetti(false), 3000);
      });

      return () => {
        channel.unbind_all();
        pusher.unsubscribe('form-battle');
      };
    } else {
      // === POLLING MODE ===
      setIsConnected(true);
      const interval = setInterval(async () => {
        try {
          const res = await fetch('/api/stats');
          const data: StatsData = await res.json();

          setStats((prev) => {
            // Detect changes and add events
            if (data.clickMiss > prev.clickMiss) {
              addEvent('🎯 Có người click trượt!', 'miss');
            }
            if (data.validationFail > prev.validationFail) {
              addEvent('❌ Validation fail!', 'fail');
            }
            if (data.hackAttempt > prev.hackAttempt) {
              addEvent('🔓 HACK detected!', 'hack');
            }
            if (data.successCount > prev.successCount) {
              addEvent('🎉 Có người vượt qua!', 'success');
              setConfetti(true);
              setTimeout(() => setConfetti(false), 3000);
            }
            return data;
          });
        } catch {
          // Silently ignore polling errors
        }
      }, 1500);

      return () => clearInterval(interval);
    }
  }, [addEvent]);

  // Auto-hide cursor for TV mode
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const hideCursor = () => {
      document.body.style.cursor = 'none';
    };
    const showCursor = () => {
      document.body.style.cursor = 'auto';
      clearTimeout(timer);
      timer = setTimeout(hideCursor, 3000);
    };
    window.addEventListener('mousemove', showCursor);
    timer = setTimeout(hideCursor, 3000);
    return () => {
      window.removeEventListener('mousemove', showCursor);
      clearTimeout(timer);
      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <div className="dashboard-container">
      {/* Confetti Effect */}
      {confetti && (
        <div className="confetti-container">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                backgroundColor: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bff'][
                  i % 5
                ],
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <header className="dashboard-header">
        <h1 className="dashboard-title">
          <span className="title-emoji">⚔️</span>
          ĐẠI CHIẾN PHÁ FORM
          <span className="title-emoji">🛡️</span>
        </h1>
        <p className="dashboard-subtitle">Bảng Điều Khiển Trực Tiếp</p>
        <div className={`connection-badge ${isConnected ? 'connected' : ''}`}>
          <span className="pulse-dot" />
          {isConnected ? 'LIVE' : 'Connecting...'}
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          icon="🎯"
          label="Click Trượt"
          value={stats.clickMiss}
          color="orange"
          description="Lượt bấm trượt nút Submit"
        />
        <StatCard
          icon="❌"
          label="Validation Fail"
          value={stats.validationFail}
          color="red"
          description="Lần bị Zod từ chối"
        />
        <StatCard
          icon="🔓"
          label="Hack Attempts"
          value={stats.hackAttempt}
          color="purple"
          description="Bypass client thành công"
        />
        <StatCard
          icon="✅"
          label="Thành Công"
          value={stats.successCount}
          color="green"
          description="Vượt qua server validation"
        />
      </div>

      {/* Live Event Feed */}
      <div className="event-feed">
        <h2 className="feed-title">
          <span className="pulse-dot red" /> Sự kiện trực tiếp
        </h2>
        <div className="feed-list">
          {recentEvents.length === 0 ? (
            <div className="feed-empty">
              <p>⏳ Đang chờ sinh viên quét QR...</p>
              <p className="feed-empty-hint">Mở form trên điện thoại để bắt đầu!</p>
            </div>
          ) : (
            recentEvents.map((event) => (
              <div
                key={event.id}
                className={`feed-item feed-${event.type}`}
              >
                <span className="feed-text">{event.text}</span>
                <span className="feed-time">vừa xong</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DB Submissions (for hack demo) */}
      {stats.submissions.length > 0 && (
        <div className="submissions-panel">
          <h2 className="submissions-title">
            🗄️ Dữ liệu trong &ldquo;Database&rdquo;
          </h2>
          <div className="submissions-table-wrap">
            <table className="submissions-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Email</th>
                  <th>Thời gian</th>
                  <th>An toàn?</th>
                </tr>
              </thead>
              <tbody>
                {stats.submissions.slice(-10).reverse().map((sub, i) => (
                  <tr key={i} className={sub.isSecure ? 'row-safe' : 'row-danger'}>
                    <td>{stats.submissions.length - i}</td>
                    <td className="cell-email">{sub.email}</td>
                    <td>{new Date(sub.timestamp).toLocaleTimeString('vi-VN')}</td>
                    <td>{sub.isSecure ? '✅ Có' : '🔓 KHÔNG'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component: Stat Card with animated counter
function StatCard({
  icon,
  label,
  value,
  color,
  description,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
  description: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    const start = prevValueRef.current;
    const end = value;
    if (start === end) return;

    const duration = 500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplayValue(Math.round(start + (end - start) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
    prevValueRef.current = end;
  }, [value]);

  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{displayValue.toLocaleString()}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-desc">{description}</div>
    </div>
  );
}
