'use server';

import { triggerPusher } from '@/lib/pusher';
import { incrementStat, addSubmission } from '@/lib/store';

// Kiểu trả về chung cho submitForm
export type FormResult = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

// Hàm xử lý form — chưa có validation
export async function submitForm(
  prevState: unknown,
  formData: FormData
): Promise<FormResult> {
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
