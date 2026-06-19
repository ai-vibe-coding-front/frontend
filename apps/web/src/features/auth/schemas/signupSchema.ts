import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다')
    .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, '영문과 숫자를 조합해주세요'),
  nickname: z.string().trim().min(1, '닉네임을 입력해주세요').max(20, '닉네임은 20자 이하로 입력해주세요').optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
