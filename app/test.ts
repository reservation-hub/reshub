/* eslint-disable */
import prisma from '@lib/prisma'
(async () => {
  const shopIds = [1, 2, 3, 4, 5, 6]
  const menus = await prisma.menu.groupBy({
    by: ['shopId'],
    where: { shopId: { in: shopIds } },
  })
  console.log(menus)

  try {} catch (e) { console.error(e) }
  
  process.exit(0)
})()

export {}

/* eslint-enable */
