import { UserForAuth } from '@entities/User'
import AuthService from '@client/auth/services/AuthService'
import { AuthControllerInterface } from '@controller-adapter/client/Auth'
import { googleSchema } from '@client/auth/schemas'

export type AuthServiceInterface = {
  hack(): Promise<UserForAuth>
  createToken(user: UserForAuth, expiresIn: string): string,
  verifyIfUserInTokenIsLoggedIn(authToken: string, headerToken?: string): Promise<void>
  silentRefreshTokenChecks(authToken: string, refreshToken: string, headerToken?: string): Promise<void>
  googleAuthenticate(token: string): Promise<UserForAuth>
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

  async googleAuthenticate(body) {
    const schemaValues = await googleSchema.parseAsync(body)
    const user = await AuthService.googleAuthenticate(schemaValues.tokenId)
    return {
      id: user.id,
      role: user.role,
    }
  },

}

export default AuthController
