import { z } from 'zod'

export const reservationUpsertSchema = z.object({
  reservationDate:
    z.string().regex(/^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]) \d\d:\d\d:00$/),
  menuId: z.number().min(1),
  stylistId: z.number().min(1),
})

export const reservationQuerySchema = z.object({
  reservationDate:
    z.string().regex(/^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]) \d\d:\d\d:00$/),
})
