'use client';

import { useState, useRef, useCallback, useEffect, useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { submitForm, reportClickMiss } from '@/actions/formActions';

// Client-side Zod schema (dùng lại pattern giống server)
const clientSchema = z.object({
  email: z
    .string()
    .min(1, 'Bạn ơi, email đâu rồi? 😭')
    .email('Email gì mà kỳ vậy? Phải có @ chứ! 🤔'),
  password: z
    .string()
    .min(8, 'Mật khẩu yếu quá, chó nhà tui còn đoán được! 🐕')
    .regex(/[A-Z]/, 'Phải có ít nhất 1 chữ HOA (A-Z) nha! ⬆️')
    .regex(/[0-9]/, 'Thêm ít nhất 1 con số (0-9) đi! 🔢'),
});

type FormValues = z.infer<typeof clientSchema>;

export default function FunnyForm() {
  const [serverState, formAction, isPending] = useActionState(submitForm, null);
  const [buttonPos, setButtonPos] = useState({ x: 0, y: 0 });
  const [missCount, setMissCount] = useState(0);
  const [catchCount, setCatchCount] = useState(0); // Đếm số lần bắt được nút
  const [gravityMode, setGravityMode] = useState(false);
  const [warningLogs, setWarningLogs] = useState<Array<{id: number; text: string; type: 'warn' | 'error' | 'info'}>>([]);
  const [caughtFirstTime, setCaughtFirstTime] = useState(false); // Đã bắt lần 1 chưa
  const logIdRef = useRef(0);
  const [weakClickCount, setWeakClickCount] = useState(0); // Đếm click khi mật khẩu yếu
  const formContainerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    formState: { errors, isValid },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(clientSchema),
    mode: 'onChange',
  });

  const password = watch('password') || '';

  // Tính sức mạnh mật khẩu
  const getPasswordStrength = useCallback((pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  }, []);

  // Thêm log cảnh báo
  const addLog = useCallback((text: string, type: 'warn' | 'error' | 'info' = 'warn') => {
    const id = ++logIdRef.current;
    setWarningLogs((prev) => [{ id, text, type }, ...prev].slice(0, 8));
  }, []);

  // Taunt messages khi click trượt
  const tauntMessages = [
    'Không bắt được tui đâu!',
    'Nhầm rồi, tui ở đây nè!',
    'Gần lắm rồi... mà chưa đủ!',
    'Nhanh hơn tí nữa đi!',
    'Nhắm kỹ hơn đi bạn ơi!',
    'Form này có bug hay bạn lag?',
    'Chuột bạn chạy chậm quá!',
    'Boing boing ~ nhảy đi đâu rồi!',
    'Chào mừng đến rạp xiếc!',
  ];

  // Nút submit LUÔN chạy trốn (kể cả form valid)
  const handleButtonDodge = useCallback(() => {
    // Nếu đã bắt lần 1 rồi (caughtFirstTime = true) → cho nút đứng yên
    if (caughtFirstTime) return;

    const container = formContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const maxX = rect.width - 200;
    const maxY = 120;
    const newX = Math.random() * maxX - maxX / 2;
    const newY = Math.random() * maxY - maxY / 2;

    setButtonPos({ x: newX, y: newY });
    setMissCount((prev) => prev + 1);

    // Nếu mật khẩu yếu → đếm click, trigger rơi chữ khi nhiều lần
    const strength = getPasswordStrength(password);
    if (strength <= 1 && password.length > 0) {
      setWeakClickCount((prev) => {
        const newCount = prev + 1;
        // Sau 5 lần click với mật khẩu yếu → rơi chữ!
        if (newCount >= 5 && !gravityMode) {
          setGravityMode(true);
          setTimeout(() => setGravityMode(false), 4000);
        }
        return newCount;
      });
    }

    // Show log
    const taunt = tauntMessages[Math.floor(Math.random() * tauntMessages.length)];
    addLog(taunt, 'warn');

    // Gửi event lên server
    reportClickMiss();
  }, [caughtFirstTime, password, gravityMode, getPasswordStrength]);

  // Xử lý khi click trúng nút submit
  const handleSubmitClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (caughtFirstTime) {
        // Lần 2 bắt được → cho submit thật!
        return; // Để form action chạy bình thường
      }

      // Lần 1 bắt được → CHẶN submit, show WARNING LOG nổi bật
      e.preventDefault();
      setCatchCount((prev) => prev + 1);
      setCaughtFirstTime(true);
      addLog('⚠️ BẤM GÌ NHANH QUÁ VẬY?! Đố bạn bắt được tui lần nữa!', 'error');
      // Reset vị trí nút
      setButtonPos({ x: 0, y: 0 });

      // Sau 1.5 giây nút bắt đầu chạy lại
      setTimeout(() => {
        setCaughtFirstTime(false);
        addLog('Nút Submit đã hồi sinh! Thử bắt lại đi~ 🏃', 'info');
      }, 1500);
    },
    [caughtFirstTime]
  );

  // Reset weakClickCount khi mật khẩu thay đổi
  useEffect(() => {
    setWeakClickCount(0);
  }, [password]);

  // Auto-clear old logs after 10 seconds
  useEffect(() => {
    if (warningLogs.length > 0) {
      const timer = setTimeout(() => setWarningLogs((prev) => prev.slice(0, 5)), 10000);
      return () => clearTimeout(timer);
    }
  }, [warningLogs]);

  return (
    <div
      ref={formContainerRef}
      className={`form-container ${gravityMode ? 'gravity-mode' : ''}`}
    >
      {/* Header */}
      <div className="form-header">
        <div className="form-icon">🏰</div>
        <h1 className="form-title">ĐẠI CHIẾN PHÁ FORM</h1>
        <p className="form-subtitle">
          Bạn có phá được lớp phòng thủ Validation không?
        </p>
      </div>

      {/* Miss counter */}
      {missCount > 0 && (
        <div className="miss-counter">
          <span className="miss-icon">🎯</span>
          <span>
            Bạn đã click trượt <strong>{missCount}</strong> lần!
            {catchCount > 0 && (
              <> | Bắt được: <strong>{catchCount}</strong> lần</>
            )}
          </span>
        </div>
      )}

      {/* Warning Logs — Console-style */}
      {warningLogs.length > 0 && (
        <div className="warning-logs">
          <div className="logs-header">
            <span className="logs-icon">📟</span> Console Log
          </div>
          <div className="logs-body">
            {warningLogs.map((log) => (
              <div key={log.id} className={`log-entry log-${log.type}`}>
                <span className="log-prefix">
                  {log.type === 'error' ? '🔴 ERROR' : log.type === 'info' ? '🔵 INFO' : '🟡 WARN'}
                </span>
                <span className="log-text">{log.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gravity warning */}
      {gravityMode && (
        <div className="gravity-warning">
          💀 Mật khẩu yếu quá! Form đang sụp đổ...
        </div>
      )}

      {/* Server response */}
      {serverState?.success && (
        <div className="success-banner">
          <span className="success-icon">🏆</span>
          <p>{serverState.message}</p>
        </div>
      )}

      {serverState?.errors && (
        <div className="server-error-banner">
          <span>⚠️ Server nói:</span>
          {Object.entries(serverState.errors).map(([field, msgs]) => (
            <p key={field}>
              <strong>{field}:</strong> {(msgs as string[]).join(', ')}
            </p>
          ))}
        </div>
      )}

      {/* The Form */}
      <form ref={formRef} action={formAction} className="funny-form">
        {/* Email Field */}
        <div className="form-field">
          <label htmlFor="email" className="field-label">
            <span className="label-icon">📧</span> Email
          </label>
          <input
            {...register('email')}
            id="email"
            name="email"
            type="text"
            placeholder="your@email.com"
            className={`field-input ${errors.email ? 'input-error' : ''}`}
            aria-describedby="email-error"
            autoComplete="email"
          />
          {errors.email && (
            <p id="email-error" className="field-error" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="form-field">
          <label htmlFor="password" className="field-label">
            <span className="label-icon">🔐</span> Mật khẩu
          </label>
          <input
            {...register('password')}
            id="password"
            name="password"
            type="password"
            placeholder="Tối thiểu 8 ký tự, có chữ HOA + số"
            className={`field-input ${errors.password ? 'input-error' : ''}`}
            aria-describedby="password-error"
            autoComplete="new-password"
          />
          {errors.password && (
            <p id="password-error" className="field-error" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Password strength hint */}
        <PasswordStrength password={password} />

        {/* Submit Button — LUÔN CHẠY TRỐN! */}
        <div className="submit-area">
          <button
            ref={buttonRef}
            type="submit"
            disabled={isPending}
            className={`submit-btn ${caughtFirstTime ? 'btn-caught' : 'btn-running'}`}
            style={{
              transform: `translate(${buttonPos.x}px, ${buttonPos.y}px)`,
              transition: 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            }}
            onMouseEnter={handleButtonDodge}
            onTouchStart={handleButtonDodge}
            onClick={handleSubmitClick}
          >
            {isPending ? (
              <>
                <span className="spinner" /> Đang gửi...
              </>
            ) : caughtFirstTime ? (
              '😤 Bắt tui nè!'
            ) : (
              '🔒 Submit'
            )}
          </button>
        </div>


      </form>
    </div>
  );
}

// Sub-component: thanh đo sức mạnh mật khẩu
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const labels = ['Rất yếu 😰', 'Yếu 😟', 'Tạm được 🤔', 'Mạnh 💪', 'Siêu mạnh 🛡️'];
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4'];

  return (
    <div className="password-strength">
      <div className="strength-bar-bg">
        <div
          className="strength-bar-fill"
          style={{
            width: `${(strength / 4) * 100}%`,
            backgroundColor: colors[strength],
          }}
        />
      </div>
      <span className="strength-label" style={{ color: colors[strength] }}>
        {labels[strength]}
      </span>
    </div>
  );
}
