'use server';

import { triggerPusher } from '@/lib/pusher';
import { incrementStat, addSubmission } from '@/lib/store';

// Hàm xử lý form — chưa có validation
export async function submitForm(
  prevState: unknown,
  formData: FormData
) {
  const rawData = Object.fromEntries(formData);

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

// Ghi nhận click trượt
export async function reportClickMiss() {
  incrementStat('clickMiss');
  await triggerPusher('click-miss', { count: 1 });
}
