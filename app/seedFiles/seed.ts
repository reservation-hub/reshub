/* eslint-disable  */
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'
import areas, { AreaObject } from './areas-db'
import prefectures, { PrefectureObject } from './prefec-db'

import cities, { CityObject } from './cities-db'
import {
  RoleSlug, Days, Role, User, Area, Prefecture, City, Shop, Menu, ShopDetail, Stylist,
} from '@prisma/client'
import {
  UserObject, admins, staffs, clients,
} from './users'
import roles, { RoleObject } from './roles'
import { Gender, randomNameGenerator } from './utils'
import Logger from './Logger'

const concurrencyRate = 1000

const prisma = new PrismaClient({
  errorFormat: 'minimal'
})

const getRandomDate = (from: Date, to: Date) => {
  const fromTime = from.getTime()
  const toTime = to.getTime()
  return new Date(fromTime + Math.random() * (toTime - fromTime))
}

const userDataObject = (r: Role, u: UserObject) => ({
  email: u.email,
  username: u.email,
  password: bcrypt.hashSync(u.password, 10),
  profile: {
    create: {
      firstNameKana: u.firstNameKana,
      lastNameKana: u.lastNameKana,
      firstNameKanji: u.firstNameKanji,
      lastNameKanji: u.lastNameKanji,
    },
  },
  role: {
    connect: { id: r.id },
  },
})

const roleSeeder = async (rs: RoleObject[]): Promise<void> => {
  try {
    await Promise.all(rs.map(async r => prisma.role.create({ data: r })))
  } catch (e) {
    Logger.info(`Roles Seed Error : ${e}`)
    process.exit(1)
  }
}

const userSeeder = async (r: Role, us: UserObject[]): Promise<void> => {
  try {
    const totalUserCount = us.length
    let counter = 0
    while (us.length) {
      await Promise.all(us.splice(0, concurrencyRate).map(async u => {
        await prisma.user.create({ data: userDataObject(r, u) })
      }))
      counter += Math.min(concurrencyRate, totalUserCount)
      Logger.info(`${counter} of ${totalUserCount} seeded`)
    }
  } catch (e) {
    Logger.info(`${r.name} Seed Error : ${e}`)
    process.exit(1)
  }
}

const areaSeeder = async (as: AreaObject[]): Promise<void> => {
  try {
    await Promise.all(as.map(async a => prisma.area.create({
      data: {
        slug: a.slug,
        name: a.name,
      },
    })))
  } catch (e) {
    Logger.info(`Area Seed Error : ${e}`)
    process.exit(1)
  }
}

const prefectureSeeder = async (ps: PrefectureObject[]): Promise<void> => {
  try {
    await Promise.all(ps.map(async p => prisma.prefecture.create({
      data: {
        name: p.name,
        slug: p.slug,
        area: { connect: { slug: p.area } },
      },
    })))
  } catch (e) {
    Logger.info(`Prefecture Seed Error : ${e}`)
    process.exit(1)
  }
}

const citySeeder = async (cs: CityObject[]): Promise<void> => {
  try {
    await Promise.all(cs.map(async c => prisma.city.create({
      data: {
        name: c.name,
        slug: `SUB${c.id}`,
        prefecture: { connect: { slug: c.prefecture } },
      },
    })))
  } catch (e) {
    Logger.info(`City Seed Error: ${e}`)
    process.exit(1)
  }
}

const shopSeeder = async (count: number, shopCities: (City & {
  prefecture: Prefecture & {
      area: Area;
  };
})[]): Promise<void> => {
  try {
    // shop detail seed
    const shopDetails = await Promise.all(Array(count).fill('').map(v => prisma.shopDetail.create({
      data: {
        name: 'TEST',
        days: [
          Days.MONDAY,
          Days.WEDNESDAY,
          Days.FRIDAY,
          Days.THURSDAY,
          Days.SATURDAY,
          Days.SUNDAY,
        ],
        seats: 3,
        startTime: '10:00',
        endTime: '20:00',
      },
    })))

    await Promise.all(shopDetails.map(async (sd, i) => prisma.shop.create({
      data: {
        city: {
          connect: {
            id: shopCities[i].id,
          },
        },
        prefecture: {
          connect: {
            id: shopCities[i].prefecture.id,
          },
        },
        area: {
          connect: {
            id: shopCities[i].prefecture.area.id,
          },
        },
        shopDetail: {
          connect: {
            id: sd.id,
          },
        },
      },
    })))
  } catch (e) {
    Logger.info(`Shop Seed error : ${e}`)
    process.exit(1)
  }
}

const shopUserConnectionSeeder = async (shopStaffIds: number[], shopIds: number[]) => {
  const maxStaffId = Math.max(...shopStaffIds)
  const minStaffId = Math.min(...shopStaffIds)
  try {
    await Promise.all(shopIds.map(async sst => {
      const randomStaffId = Math.floor(Math.random() * maxStaffId) + minStaffId
      return prisma.shopUser.create({
        data: {
          shopId: sst,
          userId: randomStaffId,
        },
      })
    }))
  } catch (e) {
    Logger.info(`Staff Connection Error : ${e}`)
    process.exit(1)
  }
}

const menuSeeder = async (shopsForMenuSeed: Shop[]): Promise<void> => {
  try {
    await Promise.all(shopsForMenuSeed.map(async s => prisma.menu.createMany({
      data: [{
        name: 'フワ',
        description: 'ふわふわになる',
        price: Math.floor(Math.random() * 10000) + 3000,
        shopId: s.id,
        duration: Math.floor(Math.random() * 2) === 0 ? 30 : 60,
      }, {
        name: 'ボウズ',
        description: 'ハゲになるやつ',
        price: Math.floor(Math.random() * 10000) + 3000,
        shopId: s.id,
        duration: Math.floor(Math.random() * 2) === 0 ? 30 : 60,
      }, {
        name: 'アフロ',
        description: 'ファンキー',
        price: Math.floor(Math.random() * 10000) + 3000,
        shopId: s.id,
        duration: Math.floor(Math.random() * 2) === 0 ? 30 : 60,
      }],
    })))
  } catch (e) {
    Logger.info(`Menu Seed Error : ${e}`)
    process.exit(1)
  }
}

const stylistSeeder = async (shopsForStylistSeed: Shop[]): Promise<void> => {
  try {
    await Promise.all(shopsForStylistSeed.map(async s => {
      const stylistNames = Array(10).fill('').map(
        (sn, i) => randomNameGenerator(i % 2 === 0 ? Gender.FEMALE : Gender.MALE),
      )
      return Promise.all(stylistNames.map(async (sn, i) => prisma.stylist.create({
        data: {
          name: `${sn.lastName} ${sn.firstName}`,
          price: Math.floor(Math.random() * 1000 / 100) + 300,
          days: [
            Days.MONDAY,
            Days.WEDNESDAY,
            Days.FRIDAY,
            Days.THURSDAY,
            Days.SATURDAY,
            Days.SUNDAY,
          ],
          startTime: '10:00',
          endTime: '20:00',
          shop: {
            connect: {
              id: s.id,
            },
          },
        },
      })))
    }))
  } catch (e) {
    Logger.info(`Stylist Seed Error : ${e}`)
    process.exit(1)
  }
}

const reservationSeeder = async (shopsForReservationSeed: (Shop & {
  menu: Menu[];
  shopDetail: ShopDetail;
  stylists: Stylist[];
})[], clientsForReservation: User[]): Promise<void> => {
  const datesLength = 1000
  const reservationTotal = datesLength * shopsForReservationSeed.length
  let counter = 0
  try {
    while (shopsForReservationSeed.length) {
      await Promise.all(shopsForReservationSeed.splice(0, 1).map(async sfs => {
        const dates = Array(1000).fill(new Date()).map(d => {
          const start = d
          const end = new Date('2022-12-31')
          const shopOpeningHours = sfs.shopDetail.startTime.split(':').map(soh => parseInt(soh, 10))
          const shopClosingHours = sfs.shopDetail.endTime.split(':').map(sch => parseInt(sch, 10))
          const randomDate = getRandomDate(start, end)
          const randomHour = Math.floor(Math.random() * shopClosingHours[0]) + shopOpeningHours[0]
          const randomMinutes = Math.floor(Math.random() * 2) === 0 ? 30 : 0
          randomDate.setHours(randomHour, randomMinutes, 0, 0)
          return randomDate
        })
        while (dates.length) {
          await Promise.all(dates.splice(0, concurrencyRate).map(async d => {
            const randomClientIndex = Math.floor(Math.random() * clientsForReservation.length)
            const randomStylistIndex = Math.floor(Math.random() * sfs.stylists.length)
            return prisma.reservation.create({
              data: {
                reservationDate: d,
                stylistId: sfs.stylists[randomStylistIndex]?.id,
                shopId: sfs.id,
                userId: clientsForReservation[randomClientIndex].id,
                menuId: sfs.menu[0].id,
              },
            })
          }))
          counter += Math.min(concurrencyRate, reservationTotal)
          Logger.info(`${counter} of ${reservationTotal} seeded`)
        }
      }))
    }
  } catch (e) {
    Logger.info(`Reservation Seed Error : ${e}`)
    process.exit(1)
  }
}

const main = async () => {
  Logger.info('running seeder')

  Logger.info('running roles seeder')
  await roleSeeder(roles)
  Logger.info('roles seeder done')

  Logger.info('running admins seeder')
  const adminRole = await prisma.role.findUnique({
    where: { slug: RoleSlug.ADMIN },
  })
  if (!adminRole) {
    Logger.info('Admin role does not exist')
    process.exit(1)
  }
  await userSeeder(adminRole, admins)
  Logger.info('admin seeder done')

  Logger.info('running staff seeder')
  const staffRole = await prisma.role.findUnique({
    where: { slug: RoleSlug.SHOP_STAFF },
  })
  if (!staffRole) {
    throw new Error('Staff role does not exist')
  }
  await userSeeder(staffRole, staffs)
  Logger.info('staff seeder done')

  Logger.info('running client seeder')
  const clientRole = await prisma.role.findUnique({
    where: { slug: RoleSlug.CLIENT },
  })
  if (!clientRole) {
    throw new Error('Client role does not exist')
  }
  await userSeeder(clientRole, clients)
  Logger.info('client seeder done')

  Logger.info('running area seeder')
  await areaSeeder(areas)
  Logger.info('area seeder done')

  Logger.info('running prefecture seeder')
  await prefectureSeeder(prefectures)
  Logger.info('prefecture seeder done')

  Logger.info('running city seeder')
  await citySeeder(cities)
  Logger.info('city seeder done')

  Logger.info('running shop seeder')
  const shopCount = 300
  const cityCount = 1747
  const cityIds = Array(shopCount * 2).fill(0).map(v => Math.floor(Math.random() * cityCount) + 1)
  const shopCities = await prisma.city.findMany({
    where: { id: { in: cityIds } },
    include: {
      prefecture: {
        include: {
          area: true,
        },
      },
    },
    take: shopCount,
  })
  await shopSeeder(shopCount, shopCities)
  Logger.info('shop seeder done')

  Logger.info('connecting staff to shops')
  const shopStaffs = await prisma.user.findMany({
    where: { role: { slug: RoleSlug.SHOP_STAFF } },
    select: { id: true },
  })
  const shopStaffIds = shopStaffs.map(s => s.id)
  const staffShopTargetIds = (await prisma.shop.findMany({
    select: { id: true },
  })).map(s => s.id)
  await shopUserConnectionSeeder(shopStaffIds, staffShopTargetIds)
  Logger.info('connecting staff to shop done')

  Logger.info('running menu seeder')
  const shopsForMenuSeed = await prisma.shop.findMany()
  await menuSeeder(shopsForMenuSeed)
  Logger.info('menu seeder done')

  Logger.info('running stylist seeder')
  const shopsForStylistSeed = await prisma.shop.findMany({
    include: { menu: true },
  })
  await stylistSeeder(shopsForStylistSeed)
  Logger.info('stylist seeder done')

  Logger.info('running reservation seeder')
  const shopsForReservationSeed = await prisma.shop.findMany({
    include: { menu: true, stylists: true, shopDetail: true },
  })

  if (shopsForReservationSeed.length < 1) {
    Logger.info('No Shops Found')
    process.exit(1)
  }

  const clientsForReservation = await prisma.user.findMany({
    where: { role: { slug: RoleSlug.CLIENT } },
  })

  if (clientsForReservation.length < 1) {
    Logger.info('No Shops Found')
    process.exit(1)
  }

  await reservationSeeder(shopsForReservationSeed, clientsForReservation)
  Logger.info('reservation seeder done')

  Logger.info('seed done')
  process.exit(0)
};

/** MAIN EXECUTED HERE */

(async () => {
  main()
})()
/* eslint-enable  */
