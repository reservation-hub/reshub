import prisma from '@lib/prisma'
import { MenuRepositoryInterface } from '@client/shop/services/MenuService'
import { Menu } from '@entities/Menu'
import { ReservationStatus } from '@prisma/client'

const MenuRepository: MenuRepositoryInterface = {
  async fetchShopPopularMenus(shopId) {
    const menus = await prisma.$queryRaw<{
      /* eslint-disable */
      id: number
      shop_id: number
      name: string
      description: string
      price: number
      duration: number
      /* eslint-enable */
    }[]>(`
      SELECT m.*,
      (
        SELECT COUNT(*)
        FROM "Reservation" AS r
        WHERE r.menu_id = m.id
        AND r.status = '${ReservationStatus.COMPLETED}'
      ) AS reservation_count
      FROM "Menu" AS m
      WHERE m.shop_id = ${shopId}
      ORDER BY reservation_count DESC
      LIMIT 5
      `)
    return menus.map(m => ({
      id: m.id,
      shopId: m.shop_id,
      name: m.name,
      price: m.price,
      duration: m.duration,
      description: m.description,
    }))
  },

  async fetchShopsMenus(shopIds) {
    const menus = await prisma.menu.findMany({
      where: { shopId: { in: shopIds } },
    })
    const menusGroupedByShopId = shopIds.map(shopId => ({
      shopId,
      menus: [] as Menu[],
    }))
    menus.forEach(m => menusGroupedByShopId.find(mgbsi => mgbsi.shopId === m.shopId)?.menus.push(m))
    return menusGroupedByShopId
  },
}

export default MenuRepository
