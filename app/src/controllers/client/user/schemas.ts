import { datePattern, passwordPattern } from '@lib/RegexPatterns'
import { Gender } from '@request-response-types/client/models/User'
import { z } from 'zod'

export const signUpSchema = z.object({
  username: z.string(),
  password: z.string().regex(passwordPattern),
  confirm: z.string().regex(passwordPattern),
  email: z.string().email(),
})

export const updateUserSchema = z.object({
  lastNameKanji: z.string(),
  firstNameKanji: z.string(),
  lastNameKana: z.string(),
  firstNameKana: z.string(),
  gender: z.nativeEnum(Gender),
  birthday: z.string().regex(datePattern),
})

export const userPasswordUpdateSchema = z.object({
  oldPassword: z.string().regex(passwordPattern),
  newPassword: z.string().regex(passwordPattern),
  confirmNewPassword: z.string().regex(passwordPattern),
})
