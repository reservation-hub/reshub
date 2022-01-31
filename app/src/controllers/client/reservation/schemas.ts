import { defaultDatePattern } from '@lib/RegexPatterns'
import { OrderBy } from '@request-response-types/client/Common'
import { z } from 'zod'

export const indexSchema = z.object({
  page: z.number().optional(),
  order: z.nativeEnum(OrderBy).optional(),
  take: z.number().optional(),
})

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
