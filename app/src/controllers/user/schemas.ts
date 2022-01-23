import { RoleSlug } from '@request-response-types/models/Role'
import { OrderBy } from '@request-response-types/Common'
import { z } from 'zod'
import { Gender } from '@request-response-types/models/User'

export const indexSchema = z.object({
  page: z.number().optional(),
  order: z.nativeEnum(OrderBy).optional(),
})

export const userInsertSchema = z.object({
  password: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d~!@#$%^&*()+|=]{8,}$/),
  confirm: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d~!@#$%^&*()+|=]{8,}$/),
  email: z.string().email(),
  roleSlug: z.nativeEnum(RoleSlug),
  firstNameKanji: z.string(),
  lastNameKanji: z.string(),
  firstNameKana: z.string(),
  lastNameKana: z.string(),
  gender: z.nativeEnum(Gender),
  birthday: z.string().regex(/^[1-2][0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/),
})

export const userUpdateSchema = z.object({
  email: z.string().email(),
  roleSlug: z.nativeEnum(RoleSlug),
  firstNameKanji: z.string(),
  lastNameKanji: z.string(),
  firstNameKana: z.string(),
  lastNameKana: z.string(),
  gender: z.nativeEnum(Gender),
  birthday: z.string().regex(/^[1-2][0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/),
})

export const userPasswordUpdateSchema = z.object({
  oldPassword: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d~!@#$%^&*()+|=]{8,}$/),
  newPassword: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d~!@#$%^&*()+|=]{8,}$/),
  confirmNewPassword: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d~!@#$%^&*()+|=]{8,}$/),
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
