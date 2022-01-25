import { passwordPattern } from '@lib/RegexPatterns'
import { z } from 'zod'

export const localStrategySchema = z.object({
  username: z.string(),
  password: z.string().regex(passwordPattern),
})

export const googleSchema = z.object({
  provider: z.string().regex(/^google$/),
  tokenId: z.string(),
})
