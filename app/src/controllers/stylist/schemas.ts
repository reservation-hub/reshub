import { hoursPattern } from '@lib/RegexPatterns'
import { OrderBy } from '@request-response-types/Common'
import { ScheduleDays } from '@request-response-types/models/Common'
import { z } from 'zod'

export const indexSchema = z.object({
  page: z.number().optional(),
  order: z.nativeEnum(OrderBy).optional(),
  take: z.number().optional(),
})

export const shopStylistUpsertSchema = z.object({
  name: z.string(),
  price: z.number().min(0),
  days: z.nativeEnum(ScheduleDays).array().min(1),
  startTime: z.string()
    .regex(hoursPattern),
  endTime: z.string()
    .regex(hoursPattern),
})
