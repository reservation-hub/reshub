import Joi from 'joi'
import { Request, Response, NextFunction } from 'express'
import pt from '../controllers/utils/passport'
import { User } from '../entities/User'
import { InvalidParamsError, UnauthorizedError } from './errors'

export const protectRoute = pt.authenticate('jwt', { session: false })
export const roleCheck = (roles: string[]) => (req: any, res: any, next: any): void => {
  const { user }: { user: User } = req
  if (!user.roles) return next(new UnauthorizedError())
  const authorized: boolean = user.roles.filter(ur => roles.includes(ur.name)).length > 0
  if (!authorized) return next(new UnauthorizedError())
  return next()
}

const idSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9]+$/),
  shopId: Joi.string().pattern(/^[0-9]+$/),
  menuId: Joi.string().pattern(/^[0-9]+$/),
})

export const parseIntIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = idSchema.validate(req.params)
  if (error) {
    return next(new InvalidParamsError())
  }
  res.locals.id = parseInt(value.id, 10)
  if (value.shopId) {
    res.locals.shopId = parseInt(value.shopId, 10)
  }
  if (value.menuId) {
    res.locals.menuId = parseInt(value.menuId, 10)
  }
  return next()
}
