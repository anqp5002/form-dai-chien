'use server';

import { triggerPusher } from '@/lib/pusher';
import { incrementStat, addSubmission } from '@/lib/store';

// ╔════════════════════════════════════════════════════════════╗
// ║  📌 FILE NÀY LÀ TRỌNG TÂM LIVE CODE TRÊN LỚP            ║
// ║  Ban đầu: hàm submitForm KHÔNG validate                   ║
// ║  MC sẽ live code thêm: import Zod, Zod Schema, safeParse  ║
// ╚════════════════════════════════════════════════════════════╝

// ==============================================================
// HÀM XỬ LÝ FORM — BAN ĐẦU KHÔNG CÓ VALIDATION
// ==============================================================
export async function submitForm(
  prevState: unknown,
  formData: FormData
) {
  // Lấy dữ liệu từ form
  const rawData = Object.fromEntries(formData);
  const email = rawData.email as string;
  const password = rawData.password as string;

  // ⚠️ KHÔNG HỀ KIỂM TRA GÌ CẢ → lưu thẳng vào "DB"!
  addSubmission(email || '(trống)', false);
  incrementStat('hackAttempt');

  await triggerPusher('hack-attempt', {
    email: email || '(trống)',
    message: '🔓 Dữ liệu rác đã vào DB!',
  });

  return {
    success: true,
    message: `Đã lưu: email="${email}", password="${password}" — KHÔNG KIỂM TRA! 😱`,
  };


  // ==============================================================
  // 🔥 LIVE CODE ZONE — MC GÕ CODE TỪ ĐÂY TRỞ XUỐNG 🔥
  // ==============================================================

}

// ==============================================================
// Hàm phụ: Ghi nhận click trượt (chuẩn bị sẵn)
// ==============================================================
export async function reportClickMiss() {
  incrementStat('clickMiss');
  await triggerPusher('click-miss', { count: 1 });
}
