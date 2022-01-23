import { OrderBy } from '@request-response-types/Common'
import { z } from 'zod'

export const indexSchema = z.object({
  page: z.number().optional(),
  order: z.nativeEnum(OrderBy).optional(),
})

export const indexCalendarSchema = z.object({
  year: z.number().min(2000),
  month: z.number().min(1).max(12),
})

export const reservationUpsertSchema = z.object({
  reservationDate:
    z.string().regex(/^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]) \d\d:\d\d:00$/),
  stylistId: z.number().positive().int(),
  userId: z.number().positive().int(),
  menuId: z.number().positive().int(),
})
