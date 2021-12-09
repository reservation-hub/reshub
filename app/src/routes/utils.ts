import Joi from 'joi'
import { Request, Response, NextFunction } from 'express'
import pt from '@middlewares/passport'
import { User } from '@entities/User'
import { UnauthorizedError } from './errors'

export const protectAdminRoute = pt.authenticate('admin-jwt', { session: false })
export const protectClientRoute = pt.authenticate('client-jwt', { session: false })

export const roleCheck = (roles: string[]) => (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user as User
  if (!user.role) return next(new UnauthorizedError())
  const authorized: boolean = roles.includes(user.role.slug)
  if (!authorized) return next(new UnauthorizedError())
  return next()
}

const idSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9]+$/),
  shopId: Joi.string().pattern(/^[0-9]+$/),
  stylistId: Joi.string().pattern(/^[0-9]+$/),
  menuItemId: Joi.string().pattern(/^[0-9]+$/),
  reservationId: Joi.string().pattern(/^[0-9]+$/),
})

const joiOptions = { abortEarly: false, stripUnknown: true }

export const parseIntIdMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const ids = await idSchema.validateAsync(req.params, joiOptions)
  res.locals.id = parseInt(ids.id, 10)
  if (ids.shopId) {
    res.locals.shopId = parseInt(ids.shopId, 10)
  }
  if (ids.menuItemId) {
    res.locals.menuItemId = parseInt(ids.menuItemId, 10)
  }
  if (ids.stylistId) {
    res.locals.stylistId = parseInt(ids.stylistId, 10)
  }
  if (ids.reservationId) {
    res.locals.reservationId = parseInt(ids.reservationId, 10)
  }
  return next()
}
