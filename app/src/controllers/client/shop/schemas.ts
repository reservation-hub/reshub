import { z } from 'zod'
import { OrderBy } from '@request-response-types/Common'
import { noWhiteSpaceInBetweenPattern } from '@lib/RegexPatterns'

export const indexSchema = z.object({
  page: z.number().optional(),
  order: z.nativeEnum(OrderBy).optional(),
  take: z.number().optional(),
})

export const searchByAreaSchema = z.object({
  page: z.number().optional(),
  order: z.nativeEnum(OrderBy).optional(),
  areaId: z.number().min(1),
  prefectureId: z.number().min(1).optional(),
  cityId: z.number().min(1).optional(),
  take: z.number().optional(),
})

export const searchByTagsSchema = z.object({
  page: z.number().optional(),
  order: z.nativeEnum(OrderBy).optional(),
  tags: z.array(z.string().regex(noWhiteSpaceInBetweenPattern)),
  take: z.number().optional(),
})

export const searchByNameSchema = z.object({
  name: z.string(),
  page: z.number().optional(),
  order: z.nativeEnum(OrderBy).optional(),
  take: z.number().optional(),
})
