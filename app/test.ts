// import { ShopRepository } from '@repositories/ShopRepository'
import { MenuItem } from '@entities/Menu'
import prisma from '@repositories/prisma'

(async () => {
  try {
    // const ids = [125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136]
    const menuItems = await prisma.$queryRaw<MenuItem[]>(`SELECT mi.*, 
    COUNT(SELECT * FROM "Reservation" WHERE menu_item_id in (11)) as reservation_total FROM "MenuItem" as mi
    WHERE mi.id in (11)`)

    // eslint-disable-next-line no-console
    console.log(menuItems)
  } catch (e) { console.error(e) } finally {
    process.exit()
  }
})()
