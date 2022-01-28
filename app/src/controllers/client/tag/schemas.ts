import { noWhiteSpaceInBetweenPattern } from '@lib/RegexPatterns'
import { OrderBy } from '@request-response-types/Common'
import { z } from 'zod'

export const searchSchema = z.object({
  keyword: z.string().regex(noWhiteSpaceInBetweenPattern),
  page: z.number().positive().int().optional(),
  order: z.nativeEnum(OrderBy).optional(),
})
