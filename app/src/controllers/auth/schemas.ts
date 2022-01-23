import { z } from 'zod'

export const localStrategySchema = z.object({
  email: z.string().email(),
  password: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d~!@#$%^&*()+|=]{8,}$/),
})

export const googleSchema = z.object({
  provider: z.string().regex(/^google$/),
  tokenId: z.string(),
})
