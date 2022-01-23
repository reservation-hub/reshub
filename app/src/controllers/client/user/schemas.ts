import { z } from 'zod'

export const signUpSchema = z.object({
  username: z.string(),
  password: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d~!@#$%^&*()+|=]{8,}$/),
  confirm: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d~!@#$%^&*()+|=]{8,}$/),
  email: z.string().email(),
})
