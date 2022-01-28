import { noWhiteSpaceInBetweenPattern } from '@lib/RegexPatterns'
import { OrderBy } from '@request-response-types/Common'
import { z } from 'zod'

export const indexSchema = z.object({
  page: z.number().optional(),
  order: z.nativeEnum(OrderBy).optional(),
})

export const tagUpsertSchema = z.object({
  slug: z.string().regex(noWhiteSpaceInBetweenPattern),
})
