import Joi from 'joi'
import { Request, Response, NextFunction } from 'express'
import { UserForAuth } from '@entities/User'
import adminPassport from '@/controllers/auth/middlewares/passport'
import clientPassport from '@/controllers/client/auth/middlewares/passport'
import { UnauthorizedError } from './errors'

export const protectAdminRoute = adminPassport.authenticate('admin-jwt', { session: false })
export const protectClientRoute = clientPassport.authenticate('client-jwt', { session: false })

export const roleCheck = (roles: string[]) => (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user as UserForAuth
  if (!user.role) return next(new UnauthorizedError())
  const authorized: boolean = roles.includes(user.role.slug)
  if (!authorized) return next(new UnauthorizedError())
  return next()
}

const idSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9]+$/),
  shopId: Joi.string().pattern(/^[0-9]+$/),
  stylistId: Joi.string().pattern(/^[0-9]+$/),
  menuId: Joi.string().pattern(/^[0-9]+$/),
  reservationId: Joi.string().pattern(/^[0-9]+$/),
})

const joiOptions = { abortEarly: false, stripUnknown: true }

export const parseIntIdMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const ids = await idSchema.validateAsync(req.params, joiOptions)
  res.locals.id = parseInt(ids.id, 10)
  if (ids.shopId) {
    res.locals.shopId = parseInt(ids.shopId, 10)
  }
  if (ids.menuId) {
    res.locals.menuId = parseInt(ids.menuId, 10)
  }
  if (ids.stylistId) {
    res.locals.stylistId = parseInt(ids.stylistId, 10)
  }
  if (ids.reservationId) {
    res.locals.reservationId = parseInt(ids.reservationId, 10)
  }
  return next()
}
