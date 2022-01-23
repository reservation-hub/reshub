import { z } from 'zod'
import { Request, Response, NextFunction } from 'express'
import adminPassport from '@auth/middlewares/passport'
import clientPassport from '@client/auth/middlewares/passport'
import { UnauthorizedError } from '@errors/RouteErrors'

export const protectAdminRoute = adminPassport.authenticate('admin-jwt', { session: false })
export const protectClientRoute = clientPassport.authenticate('client-jwt', { session: false })

export const roleCheck = (roles: string[]) => (req: Request, res: Response, next: NextFunction): void => {
  const { user } = req
  if (!user) return next(new UnauthorizedError())
  if (!user.role) return next(new UnauthorizedError())
  const authorized: boolean = roles.includes(user.role.slug)
  if (!authorized) return next(new UnauthorizedError())
  return next()
}

const idSchema = z.object({
  id: z.preprocess(id => parseInt(id as string, 10), z.number().positive().int()).optional(),
  shopId: z.preprocess(id => parseInt(id as string, 10), z.number().positive().int()).optional(),
  stylistId: z.preprocess(id => parseInt(id as string, 10), z.number().positive().int()).optional(),
  menuId: z.preprocess(id => parseInt(id as string, 10), z.number().positive().int()).optional(),
  reservationId: z.preprocess(id => parseInt(id as string, 10), z.number().positive().int()).optional(),
})

export const parseIntIdMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ids = await idSchema.parseAsync(req.params)
    res.locals.id = ids.id
    if (ids.shopId) {
      res.locals.shopId = ids.shopId
    }
    if (ids.menuId) {
      res.locals.menuId = ids.menuId
    }
    if (ids.stylistId) {
      res.locals.stylistId = ids.stylistId
    }
    if (ids.reservationId) {
      res.locals.reservationId = ids.reservationId
    }
    return next()
  } catch (e) { return next(e) }
}
