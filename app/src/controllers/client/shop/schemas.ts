import { z } from 'zod'
import { OrderBy } from '@request-response-types/Common'

export const indexSchema = z.object({
  page: z.number().optional(),
  order: z.nativeEnum(OrderBy).optional(),
})

export const searchByAreaSchema = z.object({
  page: z.number().optional(),
  order: z.nativeEnum(OrderBy).optional(),
  areaId: z.number().min(1),
  prefectureId: z.number().min(1).optional(),
  cityId: z.number().min(1).optional(),
})
