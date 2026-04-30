'use server';

import { z } from 'zod';
import { triggerPusher } from '@/lib/pusher';
import { incrementStat, addSubmission } from '@/lib/store';

// ╔════════════════════════════════════════════════════════════╗
// ║  📌 FILE NÀY LÀ TRỌNG TÂM LIVE CODE TRÊN LỚP            ║
// ║  Ban đầu chỉ có hàm submitFormInsecure (KHÔNG validate)   ║
// ║  MC sẽ live code thêm Zod Schema + submitFormSecure       ║
// ╚════════════════════════════════════════════════════════════╝

// ==============================================================
// 🚨 HÀM KHÔNG AN TOÀN — Dùng ở Giai đoạn 1 & 2 (khiêu khích)
// Chấp nhận MỌI dữ liệu, KHÔNG validate
// ==============================================================
export async function submitFormInsecure(formData: FormData) {
  const rawData = Object.fromEntries(formData);
  const email = rawData.email as string;
  const password = rawData.password as string;

  // Lưu luôn mà KHÔNG kiểm tra gì cả → lỗ hổng bảo mật!
  addSubmission(email || '(trống)', false);
  incrementStat('hackAttempt');

  await triggerPusher('hack-attempt', {
    email: email || '(trống)',
    message: '🔓 Có người bypass thành công! Dữ liệu rác đã vào DB!',
  });

  return {
    success: true,
    message: `Dữ liệu đã lưu: email="${email}", password="${password}" — KHÔNG HỀ KIỂM TRA! 😱`,
  };
}

// ==============================================================
// === 🔥 LIVE CODE ZONE — MC GÕ PHẦN NÀY TRÊN LỚP 🔥 ===
// ==============================================================

// 1. Định nghĩa Zod Schema (gõ trực tiếp)
const formSchema = z.object({
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

// 2. Server Action AN TOÀN — validate bằng Zod
export async function submitFormSecure(
  prevState: unknown,
  formData: FormData
) {
  // Lấy dữ liệu từ FormData
  const rawData = Object.fromEntries(formData);

  // Validate chặt chẽ bằng Zod
  const validated = formSchema.safeParse(rawData);

  if (!validated.success) {
    // Trả lỗi về Client — không cần tạo API Route!
    incrementStat('validationFail');
    await triggerPusher('validation-fail', {
      errors: validated.error.flatten().fieldErrors,
    });

    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  // Dữ liệu sạch → lưu vào "DB"
  addSubmission(validated.data.email, true);
  incrementStat('successCount');

  await triggerPusher('success-event', {
    email: validated.data.email,
    message: '✅ Có người vượt qua validation!',
  });

  return {
    success: true,
    message: 'Chúc mừng! Bạn đã vượt qua hàng rào bảo mật! 🎉🏆',
  };
}

// ==============================================================
// Hàm phụ: Ghi nhận click trượt
// ==============================================================
export async function reportClickMiss() {
  incrementStat('clickMiss');
  await triggerPusher('click-miss', { count: 1 });
}
