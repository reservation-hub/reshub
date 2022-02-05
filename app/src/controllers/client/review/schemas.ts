import { OrderBy } from '@request-response-types/client/Common'
import { ReviewScore } from '@request-response-types/client/models/Review'
import { z } from 'zod'

export const indexSchema = z.object({
  page: z.number().optional(),
  order: z.nativeEnum(OrderBy).optional(),
  take: z.number().optional(),
})

export const upsertSchema = z.object({
  text: z.string(),
  score: z.nativeEnum(ReviewScore),
})
