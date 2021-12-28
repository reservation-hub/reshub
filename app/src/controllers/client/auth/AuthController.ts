import { User } from '@entities/User'
import AuthService from '@client/auth/services/AuthService'
import { AuthControllerInterface } from '@controller-adapter/client/Auth'

export type AuthServiceInterface = {
  hack(): Promise<User>
  createToken(user: Express.User, expiresIn: string): string,
  verifyIfUserInTokenIsLoggedIn(authToken: string, headerToken?: string): Promise<void>
  silentRefreshTokenChecks(authToken: string, refreshToken: string, headerToken?: string): Promise<void>
}

enum CookieDuration {
  ONE_DAY = '1d',
  THIRTY_DAYS = '30d'
}

const AuthController: AuthControllerInterface = {
  async hack() {
    const user = await AuthService.hack()
    return {
      id: user.id,
      role: user.role,
    }
  },

  createOneDayToken(user) {
    return AuthService.createToken(user, CookieDuration.ONE_DAY)
  },

  createThirtyDaysToken(user) {
    return AuthService.createToken(user, CookieDuration.THIRTY_DAYS)
  },

  async verifyIfUserInTokenIsLoggedIn(authToken, headerToken?) {
    return AuthService.verifyIfUserInTokenIsLoggedIn(authToken, headerToken)
  },

  async silentRefreshTokenChecks(authToken, refreshToken, headerToken?) {
    return AuthService.silentRefreshTokenChecks(authToken, refreshToken, headerToken)
  },
}

export default AuthController
