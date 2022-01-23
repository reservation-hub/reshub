import { passwordPattern } from '@lib/RegexPatterns'
import { z } from 'zod'

export const localStrategySchema = z.object({
  username: z.string(),
  password: z.string().regex(passwordPattern),
})
