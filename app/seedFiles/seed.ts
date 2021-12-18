import bcrypt from 'bcrypt'
import prisma from '../src/repositories/prisma'
import areas from './areas-db'
import prefectures from './prefec-db'
import lastNames from './lastNames'
import maleNames from './maleNames'
import femaleNames from './femaleNames'
import cities from './cities-db'
import { RoleSlug, Days } from '.prisma/client'

const admins = [
  {
    firstNameKanji: 'eugene',
    lastNameKanji: 'sinamban',
    firstNameKana: 'ユージン',
    lastNameKana: 'シナンバン',
    password: 'testtest',
    email: 'eugene.sinamban@gmail.com',
  },
  {
    firstNameKanji: 'yoonsung',
    lastNameKanji: 'jang',
    firstNameKana: 'ユンソン',
    lastNameKana: 'チャン',
    password: 'testtest',
    email: 'upthe15752@gmail.com',
  },
  {
    firstNameKanji: 'sabir',
    lastNameKanji: 'barahi',
    firstNameKana: 'サビル',
    lastNameKana: 'バラヒ',
    password: 'testtest',
    email: 'sabirbarahi41@gmail.com',
  },
]

const staffs = Array(100).fill('').map((s, i) => `staff${i + 1}@staff.com`)
const clients = Array(2000).fill({ first: '', last: '' }).map((c, i) => {
  const lastNameIndex = Math.floor(Math.random() * lastNames.length)
  const lastName = lastNames[lastNameIndex]
  let firstNameIndex
  let firstName
  if (i % 2 === 0) {
    firstNameIndex = Math.floor(Math.random() * maleNames.length)
    firstName = maleNames[firstNameIndex]
  } else {
    firstNameIndex = Math.floor(Math.random() * femaleNames.length)
    firstName = femaleNames[firstNameIndex]
  }
  return { first: firstName, last: lastName }
})

const roles = [
  {
    name: 'admin',
    slug: RoleSlug.ADMIN,
    description: 'Administrator role. Can make changes on everything.',
  },
  {
    name: 'client',
    slug: RoleSlug.CLIENT,
    description: 'Client role. Can make profile and reservations.',
  },
  {
    name: 'shop staff',
    slug: RoleSlug.SHOP_STAFF,
    description: 'Shop staff user role. Can view shop details connected to the user.',
  },
];

(async () => {
  console.log('running seeder')

  console.log('running roles seeder')
  await Promise.all(roles.map(async item => {
    try {
      await prisma.role.upsert({
        where: {
          slug: item.slug,
        },
        update: item,
        create: item,
      })
    } catch (e) {
      console.error('Role Error', e)
      process.exit()
    }
  }))

  console.log('running admins seeder')

  const adminRole = await prisma.role.findUnique({
    where: { slug: RoleSlug.ADMIN },
  })
  const adminPromises = admins.map(async (admin: any) => {
    try {
      return prisma.user.upsert({
        where: { email: admin.email },
        update: {},
        create: {
          email: admin.email,
          username: admin.username,
          password: bcrypt.hashSync('testtest', 10),
          profile: {
            create: {
              firstNameKanji: admin.firstNameKanji,
              lastNameKanji: admin.lastNameKanji,
              firstNameKana: admin.firstNameKana,
              lastNameKana: admin.lastNameKana,
            },
          },
          role: {
            connect: {
              id: adminRole?.id,
            },
          },
        },
      })
    } catch (e) {
      console.error(`Exception : ${e}`)
      process.exit()
    }
  })
  await Promise.all(adminPromises)

  console.log('running staff seeder')

  const staffRole = await prisma.role.findUnique({
    where: { slug: RoleSlug.SHOP_STAFF },
  })

  const staffPromises = staffs.map(async (staffEmail, i) => {
    try {
      const lastNameIndex = Math.floor(Math.random() * lastNames.length)
      const lastName = lastNames[lastNameIndex]
      let firstNameIndex
      let firstName
      if (i % 2 === 0) {
        firstNameIndex = Math.floor(Math.random() * maleNames.length)
        firstName = maleNames[firstNameIndex]
      } else {
        firstNameIndex = Math.floor(Math.random() * femaleNames.length)
        firstName = femaleNames[firstNameIndex]
      }
      return prisma.user.create({
        data: {
          email: staffEmail,
          username: staffEmail,
          password: bcrypt.hashSync('testtest', 10),
          profile: {
            create: {
              firstNameKanji: firstName,
              lastNameKanji: lastName,
              firstNameKana: firstName,
              lastNameKana: lastName,
            },
          },
          role: {
            connect: {
              id: staffRole?.id,
            },
          },
        },
      })
    } catch (e) {
      console.error(`Exception : ${e}`)
      process.exit()
    }
  })

  await Promise.all(staffPromises)

  console.log('running client seeder')
  const clientRole = await prisma.role.findUnique({
    where: { slug: RoleSlug.CLIENT },
  })
  const clientPromises = clients.map((c, i) => prisma.user.create({
    data: {
      email: `${c.last.toLowerCase}${c.first.toLowerCase}${i}@client.com`,
      username: `${c.last.toLowerCase}${c.first.toLowerCase}${i}`,
      password: bcrypt.hashSync('testtest', 10),
      profile: {
        create: {
          firstNameKanji: c.first,
          lastNameKanji: c.last,
          firstNameKana: c.first,
          lastNameKana: c.last,
        },
      },
      role: {
        connect: {
          id: clientRole?.id,
        },
      },
    },
  }))
  await Promise.all(clientPromises)

  console.log('running area seeder')

  await prisma.area.createMany({
    data: areas.map((area: any) => ({
      slug: area.slug,
      name: area.name,
    })),
    skipDuplicates: true,
  })

  console.log('running prefecture seeder')

  const prefecturePromises = prefectures.map(async prefec => {
    try {
      return await prisma.prefecture.upsert({
        where: { slug: prefec.slug },
        update: {},
        create: {
          name: prefec.name,
          slug: prefec.slug,
          area: {
            connect: {
              slug: prefec.area,
            },
          },
        },
      })
    } catch (e) {
      console.error(`Exception : ${e}`)
      process.exit()
    }
  })

  await Promise.all(prefecturePromises)

  console.log('running city seeder')

  const cityPromises = cities.map(async city => {
    try {
      return await prisma.city.upsert({
        where: { slug: `SUB${city.id}` },
        update: {},
        create: {
          name: city.name,
          slug: `SUB${city.id}`,
          prefecture: {
            connect: {
              slug: city.prefecture,
            },
          },
        },
      })
    } catch (e) {
      console.error(`Exception : ${e}`)
      process.exit()
    }
  })

  await Promise.all(cityPromises)

  console.log('running shop seeder')
  const cityCount = 1747
  let count = 300
  while (count > 0) {
    const randomInt = Math.floor(Math.random() * cityCount)
    try {
      const city = await prisma.city.findFirst({
        skip: randomInt,
        include: {
          prefecture: {
            include: {
              area: true,
            },
          },
        },
      })
      const shopDetail = await prisma.shopDetail.create({
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
      })
      await prisma.shop.create({
        data: {
          city: {
            connect: {
              id: city?.id,
            },
          },
          prefecture: {
            connect: {
              id: city?.prefecture.id,
            },
          },
          area: {
            connect: {
              id: city?.prefecture.area.id,
            },
          },
          shopDetail: {
            connect: {
              id: shopDetail.id,
            },
          },
        },
      })
    } catch (e) {
      console.error(`Exception : ${e}`)
      process.exit()
    }
    count--
  }

  console.log('connecting staff to shops')
  const shopStaffs = await prisma.user.findMany({
    where: { role: { slug: RoleSlug.SHOP_STAFF } },
  })
  const shopStaffIds = shopStaffs.map(s => s.id)
  const staffShopTargets = await prisma.shop.findMany({})
  staffShopTargets.map(async sst => {
    const randomStaffId = Math.floor(Math.random() * shopStaffIds.length) + 1
    await prisma.shopUser.create({
      data: {
        shopId: sst.id,
        userId: shopStaffIds[randomStaffId],
      },
    })
  })

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

  await Promise.all(menuPromises)

  console.log('running stylist seeder')
  const shopsForSeed = await prisma.shop.findMany({
    include: { menu: true },
  })

  const stylistPromises = shopsForSeed.map(async s => {
    const stylistLastNames = Array(10).fill('').map(x => lastNames[Math.floor(Math.random() * lastNames.length)])
    const stylistFemaleNames = Array(5).fill('').map(x => lastNames[Math.floor(Math.random() * femaleNames.length)])
    const stylistMaleNames = Array(5).fill('').map(x => lastNames[Math.floor(Math.random() * maleNames.length)])
    const stylistFirstNames = [...stylistFemaleNames, ...stylistMaleNames]
    return stylistLastNames.map(async (slm, i) => prisma.stylist.create({
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
    }))
  })
  await Promise.all(stylistPromises)

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
      randomDate.setHours(randomHour, randomMinutes)
      return randomDate
    })
    return dates.map(async d => {
      const randomClientIndex = Math.floor(Math.random() * clientsForReservation.length)
      return prisma.reservation.create({
        data: {
          reservationDate: d,
          stylistId: sfs.stylists![0].id,
          shopId: sfs.id,
          userId: clientsForReservation[randomClientIndex].id,
          menuId: sfs.menu[0].id,
        },
      })
    })
  })
  await Promise.all(reservationPromises).then(v => {
    console.log('seed done')
    process.exit()
  })
})()
