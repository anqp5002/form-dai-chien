'use server';

import { z } from 'zod';  // ← MC thêm dòng này
import { triggerPusher } from '@/lib/pusher';
import { incrementStat, addSubmission } from '@/lib/store';

// ╔════════════════════════════════════════════════════════════╗
// ║  📌 FILE SAU KHI LIVE CODE XONG                           ║
// ╚════════════════════════════════════════════════════════════╝

// ==============================================================
// 🔥 PHẦN MC GÕ: Zod Schema
// ==============================================================
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

// ==============================================================
// HÀM XỬ LÝ FORM — SAU KHI THÊM VALIDATION
// ==============================================================
export async function submitForm(
  prevState: unknown,
  formData: FormData
) {
  const rawData = Object.fromEntries(formData);

  // 🔥 MC GÕ: Validate bằng Zod
  const validated = formSchema.safeParse(rawData);

  if (!validated.success) {
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
// Hàm phụ: Ghi nhận click trượt (chuẩn bị sẵn)
// ==============================================================
export async function reportClickMiss() {
  incrementStat('clickMiss');
  await triggerPusher('click-miss', { count: 1 });
}
