import { RoleSlug } from '@request-response-types/models/Role'
import { OrderBy } from '@request-response-types/Common'
import { z } from 'zod'
import { Gender } from '@request-response-types/models/User'
import { birthdayDatePattern, passwordPattern } from '@lib/RegexPatterns'

export const indexSchema = z.object({
  page: z.number().optional(),
  order: z.nativeEnum(OrderBy).optional(),
})

export const userInsertSchema = z.object({
  password: z.string().regex(passwordPattern),
  confirm: z.string().regex(passwordPattern),
  email: z.string().email(),
  roleSlug: z.nativeEnum(RoleSlug),
  firstNameKanji: z.string(),
  lastNameKanji: z.string(),
  firstNameKana: z.string(),
  lastNameKana: z.string(),
  gender: z.nativeEnum(Gender),
  birthday: z.string().regex(birthdayDatePattern),
})

export const userUpdateSchema = z.object({
  email: z.string().email(),
  roleSlug: z.nativeEnum(RoleSlug),
  firstNameKanji: z.string(),
  lastNameKanji: z.string(),
  firstNameKana: z.string(),
  lastNameKana: z.string(),
  gender: z.nativeEnum(Gender),
  birthday: z.string().regex(birthdayDatePattern),
})

export const userPasswordUpdateSchema = z.object({
  oldPassword: z.string().regex(passwordPattern),
  newPassword: z.string().regex(passwordPattern),
  confirmNewPassword: z.string().regex(passwordPattern),
})

export const userOAuthIdUpsertSchema = z.object({
  googleId: z.string().optional(),
  lineId: z.string().optional(),
  twitterId: z.string().optional(),
})

export const searchSchema = z.object({
  keyword: z.string(),
  page: z.number().positive().int().optional(),
  order: z.nativeEnum(OrderBy).optional(),
})
