import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { roleCheck, parseIntIdMiddleware } from '../routes/utils'
import { MenuItem } from '../entities/Menu'
import ShopService, { upsertMenuItemQuery } from '../services/ShopService'
import { menuItemUpsertSchema } from './schemas/menu'

const joiOptions = { abortEarly: false, stripUnknown: true }

export type ShopServiceInterface = {
  insertMenuItem(shopId: number, query: upsertMenuItemQuery): Promise<MenuItem>,
  updateMenuItem(shopId: number, menuItemId: number, query: upsertMenuItemQuery): Promise<MenuItem>
  deleteMenuItem(shopId: number, menuItemId: number): Promise<MenuItem>
}

export const insertMenuItem = asyncHandler(async (req, res) => {
  const schemaValues = await menuItemUpsertSchema.validateAsync(req.body, joiOptions)
  const { shopId } = res.locals
  const menuItem = await ShopService.insertMenuItem(shopId, schemaValues)
  return res.send(menuItem)
})

export const updateMenuItem = asyncHandler(async (req, res) => {
  const schemaValues = await menuItemUpsertSchema.validateAsync(req.body, joiOptions)
  const { shopId, menuItemId } = res.locals
  const menuItem = await ShopService.updateMenuItem(shopId, menuItemId, schemaValues)
  return res.send(menuItem)
})

export const deleteMenuItem = asyncHandler(async (req, res) => {
  const { shopId, menuItemId } = res.locals
  const menuItem = await ShopService.deleteMenuItem(shopId, menuItemId)
  return res.send(menuItem)
})

const routes = Router()

// shop menu
routes.post('/:shopId/menu', roleCheck(['admin']), parseIntIdMiddleware, insertMenuItem)
routes.patch('/:shopId/menu/:menuItemId', roleCheck(['admin']), parseIntIdMiddleware, updateMenuItem)
routes.delete('/:shopId/menu/:menuItemId', roleCheck(['admin']), parseIntIdMiddleware, deleteMenuItem)

export default routes
