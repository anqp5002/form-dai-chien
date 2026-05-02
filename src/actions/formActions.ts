'use server';

import { triggerPusher } from '@/lib/pusher';
import { incrementStat, addSubmission } from '@/lib/store';

import { z } from 'zod';

// Kiểu trả về chung cho submitForm
export type FormResult = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

const formSchema = z.object({
  email: z
    .string()
    .min(1, 'bạn ơi, email đâu rồi')
    .email('email gì đây @ đâu :))'),
  password: z
    .string()
    .min(8, 'mật khẩu yếu'),
});

// Hàm xử lý form — chưa có validation
export async function submitForm(
  prevState: unknown,
  formData: FormData
): Promise<FormResult> {
  const rawData = Object.fromEntries(formData);
  const validated = formSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
    };
  }
  const email = validated.data.email;
  addSubmission(email, true);
  incrementStat('successCount');

  await triggerPusher('success-event', {
    email,
    message: '✅ Có người vượt qua validation!',
  });

  return {
    success: true,
    message: 'Chúc mừng! Bạn đã vượt qua hàng rào bảo mật! 🎉🏆',
  };
}

// Ghi nhận click trượt
export async function reportClickMiss() {
  incrementStat('clickMiss');
  await triggerPusher('click-miss', { count: 1 });
}
