import prisma from '@lib/prisma'
import redis from '@lib/redis'
import { ReservationStatus } from '.prisma/client'

const setPopularMenus = async (year: number, month: number): Promise<void> => {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 1)
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
        AND r.reservation_date >= '${startDate.toISOString().split('T')[0]} 00:00:00'
        AND r.reservation_date < '${endDate.toISOString().split('T')[0]} 00:00:00'
        AND r.status = '${ReservationStatus.COMPLETED}'
      ) AS reservation_count
      FROM "Menu" AS m
      ORDER BY reservation_count DESC
      LIMIT 5
      `)
  const parsedMenus = menus.map(m => ({
    id: m.id,
    shopId: m.shop_id,
    name: m.name,
    price: m.price,
    duration: m.duration,
    description: m.description,
  }))
  await redis.set('popularMenus', JSON.stringify(parsedMenus))
}

export default setPopularMenus
