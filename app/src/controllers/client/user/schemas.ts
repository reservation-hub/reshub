import { passwordPattern } from '@lib/RegexPatterns'
import { z } from 'zod'

export const signUpSchema = z.object({
  username: z.string(),
  password: z.string().regex(passwordPattern),
  confirm: z.string().regex(passwordPattern),
  email: z.string().email(),
})
