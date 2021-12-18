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
  // eslint-disable-next-line
  console.log('running seeder')

  // eslint-disable-next-line
  console.log('running roles seeder')
  await Promise.all(roles.map(async item => prisma.role.upsert({
    where: {
      slug: item.slug,
    },
    update: item,
    create: item,
  }))).catch(e => {
    console.error('Role Seed Error', e)
    process.exit(1)
  })

  // eslint-disable-next-line
  console.log('running admins seeder')

  const adminRole = await prisma.role.findUnique({
    where: { slug: RoleSlug.ADMIN },
  })
  const adminPromises = admins.map(async (admin: any) => prisma.user.upsert({
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
  }))
  await Promise.all(adminPromises).catch(e => {
    console.error(`Admin Seed Error : ${e}`)
    process.exit(1)
  })

  // eslint-disable-next-line
  console.log('running staff seeder')

  const staffRole = await prisma.role.findUnique({
    where: { slug: RoleSlug.SHOP_STAFF },
  })

  const staffPromises = staffs.map(async (staffEmail, i) => {
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
  })

  await Promise.all(staffPromises).catch(e => {
    console.error(`Staff Seed Error : ${e}`)
    process.exit(1)
  })

  // eslint-disable-next-line
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
  await Promise.all(clientPromises).catch(e => {
    console.error(`Client Seed Error : ${e}`)
    process.exit(1)
  })

  // eslint-disable-next-line
  console.log('running area seeder')

  await prisma.area.createMany({
    data: areas.map((area: any) => ({
      slug: area.slug,
      name: area.name,
    })),
    skipDuplicates: true,
  })

  // eslint-disable-next-line
  console.log('running prefecture seeder')

  const prefecturePromises = prefectures.map(async prefec => prisma.prefecture.upsert({
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
  }))

  await Promise.all(prefecturePromises).catch(e => {
    console.error(`Prefecture Seed Error : ${e}`)
    process.exit(1)
  })

  // eslint-disable-next-line
  console.log('running city seeder')

  const cityPromises = cities.map(async city => prisma.city.upsert({
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
  }))

  await Promise.all(cityPromises).catch(e => {
    console.error(`City Seed Error : ${e}`)
    process.exit(1)
  })

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
    // eslint-disable-next-line
    console.log('seed done')
    process.exit(0)
  }).catch(e => {
    console.error(`Reservation Seed Error : ${e}`)
    process.exit(1)
  })
})()
