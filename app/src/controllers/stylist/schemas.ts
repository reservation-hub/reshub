import { OrderBy } from '@request-response-types/Common'
import { ScheduleDays } from '@request-response-types/models/Common'
import { z } from 'zod'

export const indexSchema = z.object({
  page: z.number().optional(),
  order: z.nativeEnum(OrderBy).optional(),
})

export const shopStylistUpsertSchema = z.object({
  name: z.string(),
  price: z.number().min(0),
  days: z.nativeEnum(ScheduleDays).array().min(1),
  startTime: z.string()
    .regex(/^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]) \d\d:\d\d:00$/),
  endTime: z.string()
    .regex(/^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]) \d\d:\d\d:00$/),
})
