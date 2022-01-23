import { z } from 'zod'
import { OrderBy } from '@request-response-types/Common'

export const indexSchema = z.object({
  page: z.number().optional(),
  order: z.nativeEnum(OrderBy).optional(),
})
