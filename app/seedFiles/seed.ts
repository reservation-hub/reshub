import bcrypt from 'bcrypt'
import prisma from '../src/repositories/prisma'
import areas, { AreaObject } from './areas-db'
import prefectures, { PrefectureObject } from './prefec-db'

import cities, { CityObject } from './cities-db'
import {
  RoleSlug, Days, Role, User, Area, Prefecture, City,
} from '.prisma/client'
import {
  UserObject, admins, staffs, clients,
} from './users'
import roles, { RoleObject } from './roles'

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
    connect: r,
  },
})

const roleSeeder = async (rs: RoleObject[]): Promise<Role[]> => Promise.all(rs.map(async r => prisma.role.create({
  data: r,
})))

const userSeeder = async (r: Role, us: UserObject[]): Promise<User[]> => Promise.all(
  us.map(async u => prisma.user.create({
    data: userDataObject(r, u),
  })),
)

const areaSeeder = async (as: AreaObject[]): Promise<Area[]> => Promise.all(
  as.map(async a => prisma.area.create({
    data: {
      slug: a.slug,
      name: a.name,
    },
  })),
)

const prefectureSeeder = async (ps: PrefectureObject[]): Promise<Prefecture[]> => Promise.all(
  ps.map(async p => prisma.prefecture.create({
    data: {
      name: p.name,
      slug: p.slug,
      area: { connect: { slug: p.area } },
    },
  })),
)

const citySeeder = async (cs: CityObject[]): Promise<City[]> => Promise.all(
  cs.map(async c => prisma.city.create({
    data: {
      name: c.name,
      slug: `SUB${c.id}`,
      prefecture: { connect: { slug: c.prefecture } },
    },
  })),
);

(async () => {
  // eslint-disable-next-line
  console.log('running seeder')

  // eslint-disable-next-line
  console.log('running roles seeder')
  try {
    await roleSeeder(roles)
  } catch (e) {
    console.error(`Roles Seed Error : ${e}`)
    process.exit(1)
  }

  // eslint-disable-next-line
  console.log('running admins seeder')
  try {
    const adminRole = await prisma.role.findUnique({
      where: { slug: RoleSlug.ADMIN },
    })
    if (!adminRole) {
      throw new Error('Admin role does not exist')
    }
    await userSeeder(adminRole, admins)
  } catch (e) {
    console.error(`Admin Seed Error : ${e}`)
    process.exit(1)
  }

  // eslint-disable-next-line
  console.log('running staff seeder')
  try {
    const staffRole = await prisma.role.findUnique({
      where: { slug: RoleSlug.SHOP_STAFF },
    })
    if (!staffRole) {
      throw new Error('Staff role does not exist')
    }
    await userSeeder(staffRole, staffs)
  } catch (e) {
    console.error(`Staff Seed Error : ${e}`)
    process.exit(1)
  }

  // eslint-disable-next-line
  console.log('running client seeder')
  try {
    const clientRole = await prisma.role.findUnique({
      where: { slug: RoleSlug.CLIENT },
    })
    if (!clientRole) {
      throw new Error('Client role does not exist')
    }
    await userSeeder(clientRole, clients)
  } catch (e) {
    console.error(`Client Seed Error : ${e}`)
    process.exit(1)
  }

  // eslint-disable-next-line
  console.log('running area seeder')
  try {
    await areaSeeder(areas)
  } catch (e) {
    console.error(`Area Seed Error : ${e}`)
    process.exit(1)
  }

  // eslint-disable-next-line
  console.log('running prefecture seeder')
  try {
    await prefectureSeeder(prefectures)
  } catch (e) {
    console.error(`Prefecture Seed Error : ${e}`)
    process.exit(1)
  }

  // eslint-disable-next-line
  console.log('running city seeder')
  try {
    await citySeeder(cities)
  } catch (e) {
    console.error(`City Seed Error: ${e}`)
    process.exit(1)
  }

  // eslint-disable-next-line
  console.log('running shop seeder')
  const cityCount = 1747
  const totalShopToBeCreated = 300
  const cityIds = Array(totalShopToBeCreated * 2).fill(0).map(v => Math.floor(Math.random() * cityCount) + 1)
  const shopCities = await prisma.city.findMany({
    where: { id: { in: cityIds } },
    include: {
      prefecture: {
        include: {
          area: true,
        },
      },
    },
    take: totalShopToBeCreated,
  })

  const shopDetails = await Promise.all(Array(totalShopToBeCreated).fill('').map(v => prisma.shopDetail.create({
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
      startTime: '10:00',
      endTime: '20:00',
    },
  })))

  const shopPromises = shopDetails.map(async (sd, i) => prisma.shop.create({
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
  }))

  await Promise.all(shopPromises).catch(e => {
    console.error(`Shop Seed error : ${e}`)
    process.exit(1)
  })

  // eslint-disable-next-line
  console.log('connecting staff to shops')
  const shopStaffs = await prisma.user.findMany({
    where: { role: { slug: RoleSlug.SHOP_STAFF } },
  })
  const shopStaffIds = shopStaffs.map(s => s.id)
  const maxStaffId = Math.max(...shopStaffIds)
  const minStaffId = Math.min(...shopStaffIds)
  const staffShopTargets = await prisma.shop.findMany({})
  const staffShopConnectionPromises = staffShopTargets.map(async sst => {
    const randomStaffId = Math.floor(Math.random() * maxStaffId) + minStaffId
    return prisma.shopUser.create({
      data: {
        shopId: sst.id,
        userId: randomStaffId,
      },
    })
  })

  await Promise.all(staffShopConnectionPromises).catch(e => {
    console.error(`Staff Connection Error : ${e}`)
    process.exit(1)
  })

  // eslint-disable-next-line
  console.log('running menu seeder')

  const shops = await prisma.shop.findMany()
  const menuPromises = shops.map(async s => prisma.menu.createMany({
    data: [{
      name: 'フワ',
      description: 'ふわふわになる',
      price: Math.floor(Math.random() * 100000) + 3000,
      shopId: s.id,
      duration: Math.floor(Math.random() * 2) === 0 ? 30 : 60,
    }, {
      name: 'ボウズ',
      description: 'ハゲになるやつ',
      price: Math.floor(Math.random() * 100000) + 3000,
      shopId: s.id,
      duration: Math.floor(Math.random() * 2) === 0 ? 30 : 60,
    }, {
      name: 'アフロ',
      description: 'ファンキー',
      price: Math.floor(Math.random() * 100000) + 3000,
      shopId: s.id,
      duration: Math.floor(Math.random() * 2) === 0 ? 30 : 60,
    }],
  }))

  await Promise.all(menuPromises).catch(e => {
    console.error(`Menu Seed Error : ${e}`)
    process.exit(1)
  })

  // eslint-disable-next-line
  console.log('running stylist seeder')

  const shopsForSeed = await prisma.shop.findMany({
    include: { menu: true },
  })

  const stylistPromises = shopsForSeed.map(async s => {
    const stylistLastNames = Array(10).fill('').map(x => lastNames[Math.floor(Math.random() * lastNames.length)])
    const stylistFemaleNames = Array(5).fill('').map(x => lastNames[Math.floor(Math.random() * femaleNames.length)])
    const stylistMaleNames = Array(5).fill('').map(x => lastNames[Math.floor(Math.random() * maleNames.length)])
    const stylistFirstNames = [...stylistFemaleNames, ...stylistMaleNames]
    return Promise.all(stylistLastNames.map(async (slm, i) => prisma.stylist.create({
      data: {
        name: `${slm} ${stylistFirstNames[i]}`,
        price: Math.floor(Math.random() * 100000),
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
  })
  await Promise.all(stylistPromises).catch(e => {
    console.error(`Stylist Seed Error : ${e}`)
    process.exit(1)
  })

  // eslint-disable-next-line
  console.log('running reservation seeder')
  const shopsForReservationSeed = await prisma.shop.findMany({
    include: { menu: true, stylists: true, shopDetail: true },
  })
  function getRandomDate(from: Date, to: Date) {
    const fromTime = from.getTime()
    const toTime = to.getTime()
    return new Date(fromTime + Math.random() * (toTime - fromTime))
  }
  const clientsForReservation = await prisma.user.findMany({
    where: { role: { slug: RoleSlug.SHOP_STAFF } },
  })

  const reservationPromises = shopsForReservationSeed.map(async sfs => {
    const dates = Array(1000).fill(new Date()).map(d => {
      const start = d
      const end = new Date('2025-12-31')
      const shopOpeningHours = sfs.shopDetail.startTime.split(':').map(soh => parseInt(soh, 10))
      const shopClosingHours = sfs.shopDetail.endTime.split(':').map(sch => parseInt(sch, 10))
      const randomDate = getRandomDate(start, end)
      const randomHour = Math.floor(Math.random() * shopClosingHours[0]) + shopOpeningHours[0]
      const randomMinutes = Math.floor(Math.random() * 2) === 0 ? 30 : 0
      randomDate.setHours(randomHour, randomMinutes, 0)
      return randomDate
    })
    return Promise.all(dates.map(async d => {
      const randomClientIndex = Math.floor(Math.random() * clientsForReservation.length)
      return prisma.reservation.create({
        data: {
          reservationDate: d,
          stylistId: sfs.stylists![Math.floor(Math.random() * sfs.stylists!.length) + 1].id,
          shopId: sfs.id,
          userId: clientsForReservation[randomClientIndex].id,
          menuId: sfs.menu[0].id,
        },
      })
    }))
  })

  await Promise.all(reservationPromises).catch(e => {
    console.error(`Reservation Seed Error : ${e}`)
    process.exit(1)
  })

  // eslint-disable-next-line
  console.log('seed done')
  process.exit(0)
})()
