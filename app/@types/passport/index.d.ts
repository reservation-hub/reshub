import { UserForAuth } from '@entities/User'

declare global {
  namespace Express {
    // eslint-disable-next-line
    export interface User extends UserForAuth {}
    export interface AuthenticatedRequest extends Request {
      user: User
    }
  }
}
