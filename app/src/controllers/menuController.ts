import asyncHandler from 'express-async-handler'
import { MenuItem } from '../entities/Menu'
import ShopService, { upsertMenuItemQuery } from '../services/ShopService'
import { menuItemUpsertSchema } from './schemas/menu'

const joiOptions = { abortEarly: false, stripUnknown: true }

export type ShopServiceInterface = {
  insertMenuItem(shopId: number, query: upsertMenuItemQuery): Promise<MenuItem>
}

export const insertMenuItem = asyncHandler(async (req, res) => {
  const schemaValues = await menuItemUpsertSchema.validateAsync(req.body, joiOptions)
  const { shopId } = res.locals
  const menuItem = await ShopService.insertMenuItem(shopId, schemaValues)
  return res.send(menuItem)
})
