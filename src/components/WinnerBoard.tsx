'use client';

import { useState, useEffect, useRef } from 'react';
import { getPusherClient } from '@/lib/pusher';

type Winner = {
  id: number;
  email: string;
  time: string;
};

export default function WinnerBoard() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const idRef = useRef(0);

  useEffect(() => {
    const pusher = getPusherClient();

    if (pusher) {
      const channel = pusher.subscribe('form-battle');
      setIsConnected(true);

      channel.bind('success-event', (data: { email: string }) => {
        const id = ++idRef.current;
        const time = new Date().toLocaleTimeString('vi-VN');
        setWinners((prev) => [...prev, { id, email: data.email, time }]);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      });

      return () => {
        channel.unbind_all();
        pusher.unsubscribe('form-battle');
      };
    }
  }, []);

  return (
    <div className="winner-container">
      {/* Confetti */}
      {showConfetti && (
        <div className="confetti-container">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                backgroundColor: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bff'][i % 5],
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <header className="winner-header">
        <h1 className="winner-title">
          🏆 BẢNG VINH DANH 🏆
        </h1>
        <p className="winner-subtitle">Những chiến binh vượt qua hàng rào bảo mật</p>
        <div className={`connection-badge ${isConnected ? 'connected' : ''}`}>
          <span className="pulse-dot" />
          {isConnected ? '⚡ LIVE' : 'Connecting...'}
        </div>
      </header>

      {/* Winner Count */}
      <div className="winner-count-box">
        <span className="winner-count-number">{winners.length}</span>
        <span className="winner-count-label">người vượt qua</span>
      </div>

      {/* Winner List */}
      <div className="winner-list">
        {winners.length === 0 ? (
          <div className="winner-empty">
            <p className="winner-empty-icon">⏳</p>
            <p>Chưa có ai vượt qua...</p>
            <p className="winner-empty-hint">Quét QR và thử phá form!</p>
          </div>
        ) : (
          winners.map((w, index) => (
            <div
              key={w.id}
              className={`winner-card ${index === winners.length - 1 ? 'winner-card-latest' : ''}`}
            >
              <div className="winner-rank">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </div>
              <div className="winner-info">
                <span className="winner-email">{w.email}</span>
                <span className="winner-time">{w.time}</span>
              </div>
              <div className="winner-badge">✅ PASSED</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
