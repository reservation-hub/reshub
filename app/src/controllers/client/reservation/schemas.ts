import { defaultDatePattern } from '@lib/RegexPatterns'
import { z } from 'zod'

export const reservationUpsertSchema = z.object({
  reservationDate:
    z.string().regex(defaultDatePattern),
  menuId: z.number().min(1),
  stylistId: z.number().min(1),
})

export const reservationQuerySchema = z.object({
  reservationDate:
    z.string().regex(defaultDatePattern),
})
