import { ScheduleDays } from '@request-response-types/models/Common'
import { OrderBy } from '@request-response-types/Common'
import { z } from 'zod'

export const indexSchema = z.object({
  page: z.number().optional(),
  order: z.nativeEnum(OrderBy).optional(),
})

export const shopUpsertSchema = z.object({
  name: z.string(),
  address: z.string(),
  phoneNumber: z.string(),
  areaId: z.number().positive().int(),
  prefectureId: z.number().positive().int(),
  cityId: z.number().positive().int(),
  details: z.string(),
  days: z.nativeEnum(ScheduleDays).array().min(1),
  seats: z.number().positive().int(),
  startTime: z.string()
    .regex(/^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]) \d\d:\d\d:00$/),
  endTime: z.string()
    .regex(/^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]) \d\d:\d\d:00$/),
})

export const searchSchema = z.object({
  keyword: z.string(),
  page: z.number().positive().int().optional(),
  order: z.nativeEnum(OrderBy).optional(),
})
