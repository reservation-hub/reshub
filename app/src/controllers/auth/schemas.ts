import { passwordPattern } from '@lib/RegexPatterns'
import { z } from 'zod'

export const localStrategySchema = z.object({
  email: z.string().email(),
  password: z.string().regex(passwordPattern),
})

export const googleSchema = z.object({
  provider: z.string().regex(/^google$/),
  tokenId: z.string(),
})
