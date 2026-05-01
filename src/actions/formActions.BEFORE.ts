'use server';

import { triggerPusher } from '@/lib/pusher';
import { incrementStat, addSubmission } from '@/lib/store';

// ╔════════════════════════════════════════════════════════════╗
// ║  📌 FILE TRƯỚC KHI DEMO — KHÔNG CÓ VALIDATION             ║
// ║  MC sẽ thêm code validation VÀO GIỮA hàm submitForm      ║
// ╚════════════════════════════════════════════════════════════╝

// ==============================================================
// 🔥 LIVE CODE: MC sẽ thêm import { z } from 'zod' ở đây
// ==============================================================

// ==============================================================
// 🔥 LIVE CODE: MC sẽ thêm Zod Schema ở đây
// ==============================================================

// Hàm xử lý form
export async function submitForm(
  prevState: unknown,
  formData: FormData
) {
  // Lấy dữ liệu từ form
  const rawData = Object.fromEntries(formData);

  // ==============================================================
  // 🔥 LIVE CODE: MC sẽ thêm validation ở đây
  // Khi thêm xong → dữ liệu sai sẽ bị chặn ở trên
  // → code bên dưới chỉ chạy khi dữ liệu ĐÚNG
  // ==============================================================

  // Hiện tại: lưu thẳng KHÔNG kiểm tra!
  const email = (rawData.email as string) || '(trống)';
  addSubmission(email, false);
  incrementStat('hackAttempt');

  await triggerPusher('hack-attempt', {
    email,
    message: '🔓 Dữ liệu rác đã vào DB!',
  });

  return {
    success: true,
    message: `Đã lưu: email="${email}" — KHÔNG KIỂM TRA! 😱`,
  };
}

// Hàm phụ: Ghi nhận click trượt (chuẩn bị sẵn, không cần gõ)
export async function reportClickMiss() {
  incrementStat('clickMiss');
  await triggerPusher('click-miss', { count: 1 });
}
