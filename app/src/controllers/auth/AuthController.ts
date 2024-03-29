import { UserForAuth } from '@entities/User'
import AuthService from '@auth/services/AuthService'
import { AuthControllerInterface } from '@controller-adapter/Auth'
import { RoleSlug } from '@entities/Role'
import { googleSchema } from '@auth/schemas'

enum CookieDuration {
  ONE_DAY = '1d',
  THIRTY_DAYS = '30d'
}

export type AuthServiceInterface = {
  createToken(user: UserForAuth, expiresIn: CookieDuration): string,
  verifyIfUserInTokenIsLoggedIn(authToken: string, headerToken?: string): Promise<void>
  silentRefreshTokenChecks(authToken: string, refreshToken: string, headerToken?: string): Promise<void>
  googleAuthenticate(token: string): Promise<UserForAuth>
  hack(role?: RoleSlug, userId?: number): Promise<UserForAuth>
}

const AuthController : AuthControllerInterface = {
  async hack(role, userId) {
    let user: UserForAuth
    if (role && role === RoleSlug.SHOP_STAFF) {
      user = await AuthService.hack(RoleSlug.SHOP_STAFF, userId)
    } else {
      user = await AuthService.hack()
    }
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
