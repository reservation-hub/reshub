import {
  Router, Response, Request, NextFunction,
} from 'express'
import { roleCheck, parseIntIdMiddleware } from '../routes/utils'
import { MenuItem } from '../entities/Menu'
import ShopService from '../services/ShopService'
import { deleteMenuItemQuery, insertMenuItemQuery, updateMenuItemQuery } from '../request-response-types/ShopService'
import { menuItemUpsertSchema } from './schemas/menu'

const joiOptions = { abortEarly: false, stripUnknown: true }

export type ShopServiceInterface = {
  insertMenuItem(query: insertMenuItemQuery): Promise<MenuItem>,
  updateMenuItem(query: updateMenuItemQuery): Promise<MenuItem>
  deleteMenuItem(query: deleteMenuItemQuery): Promise<MenuItem>
}

export const insertMenuItem = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const params = await menuItemUpsertSchema.validateAsync(req.body, joiOptions)
    const { shopId } = res.locals
    const menuItem = await ShopService.insertMenuItem({ shopId, params })
    return res.send(menuItem)
  } catch (e) { return next(e) }
}

export const updateMenuItem = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const params = await menuItemUpsertSchema.validateAsync(req.body, joiOptions)
    const { shopId, menuItemId } = res.locals
    const menuItem = await ShopService.updateMenuItem({ shopId, menuItemId, params })
    return res.send(menuItem)
  } catch (e) { return next(e) }
}

export const deleteMenuItem = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { shopId, menuItemId } = res.locals
    const menuItem = await ShopService.deleteMenuItem({ shopId, menuItemId })
    return res.send(menuItem)
  } catch (e) { return next(e) }
}

const routes = Router()

// shop menu
routes.post('/:shopId/menu', roleCheck(['admin']), parseIntIdMiddleware, insertMenuItem)
routes.patch('/:shopId/menu/:menuItemId', roleCheck(['admin']), parseIntIdMiddleware, updateMenuItem)
routes.delete('/:shopId/menu/:menuItemId', roleCheck(['admin']), parseIntIdMiddleware, deleteMenuItem)

export default routes
