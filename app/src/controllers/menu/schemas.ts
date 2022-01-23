import { OrderBy } from '@request-response-types/Common'
import { z } from 'zod'

export const indexSchema = z.object({
  page: z.number().optional(),
  order: z.nativeEnum(OrderBy).optional(),
})

export const menuUpsertSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number().min(0),
  duration: z.number().multipleOf(30),
})
