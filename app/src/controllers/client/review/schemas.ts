import { ReviewScore } from '@prisma/client'
import { OrderBy } from '@request-response-types/client/Common'
import { z } from 'zod'

export const indexSchema = z.object({
  page: z.number().optional(),
  order: z.nativeEnum(OrderBy).optional(),
  take: z.number().optional(),
})

export const reviewInsertSchema = z.object({
  shopId: z.number(),
  review: z.string(),
  reviewScore: z.nativeEnum(ReviewScore),
})