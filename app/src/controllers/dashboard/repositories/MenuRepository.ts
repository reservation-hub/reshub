import { MenuRepositoryInterface as ReservationServiceSocket } from '@dashboard/services/ReservationService'
import { MenuRepositoryInterface as MenuServiceSocket } from '../services/MenuService'
import prisma from '@/prisma'
import { ReservationStatus } from '.prisma/client'

const MenuRepository: ReservationServiceSocket & MenuServiceSocket = {
  async fetchMenusByIds(menuIds) {
    return prisma.menu.findMany({
      where: { id: { in: menuIds } },
    })
  },

  async fetchPopularMenusByStaffIdAndDate(userId, year, month) {
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 1)
    const menus = await prisma.$queryRaw<{
      /* eslint-disable */
      id: number
      shop_id: number
      name: string
      description: string
      image_id: number | null
      price: number
      duration: number
      reservation_count: number
      /* eslint-enable */
    }[]>(`
      SELECT m.*, 
      (
        SELECT COUNT(*) 
        FROM "Reservation" AS r
        WHERE r.menu_id = m.id
        AND r.reservation_date >= '${startDate.toISOString().split('T')[0]} 00:00:00'
        AND r.reservation_date < '${endDate.toISOString().split('T')[0]} 00:00:00'
        AND r.status = '${ReservationStatus.COMPLETED}'
      ) AS reservation_count
      FROM "Menu" AS m 
      INNER JOIN "Shop" AS s ON m.shop_id = s.id
      INNER JOIN "ShopUser" AS su ON su.shop_id = s.id
      WHERE su.user_id = ${userId}
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
      reservationCount: m.reservation_count,
    }))
  },
}

export default MenuRepository
