import { z } from 'zod'

export const localStrategySchema = z.object({
  username: z.string(),
  password: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d~!@#$%^&*()+|=]{8,}$/),
})
