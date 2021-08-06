import Joi from 'joi'
import { Request, Response, NextFunction } from 'express'
import pt from './passport'
import { User } from '../entities/User'

export const protectRoute = pt.authenticate('jwt', { session: false })
export const roleCheck = (roles: string[]) => (req: any, res: any, next: any): void => {
  const { user }: { user: User } = req
  if (!user.roles) return next({ code: 403, message: 'User unauthorized' })
  const authorized: boolean = user.roles.filter(ur => roles.includes(ur.name)).length > 0
  if (!authorized) return next({ code: 403, message: 'User unauthorized' })
  return next()
}

const idSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9]+$/),
})

export const parseIntIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = idSchema.validate(req.params)
  if (error) {
    return next({ code: 400, message: 'Invalid param value' })
  }
  res.locals.id = parseInt(value.id, 10)
  return next()
}
