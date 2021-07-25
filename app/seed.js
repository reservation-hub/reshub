const bcrypt = require('bcrypt')
const prisma = require('./src/db/prisma');
const UserRepository = require('./src/repositories/UserRepository')
const RoleRepository = require('./src/repositories/RoleRepository');

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
    firstNameKanji: 'sana',
    lastNameKanji: 'nakamura',
    firstNameKana: 'サナ',
    lastNameKana: 'ナカムラ',
    password: 'testtest',
    email: 'dq.tri.fi@gmail.com',
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

const roles = [
  {
    name: 'admin',
    slug: 'admin',
    description: 'Administrator role. Can make changes on everything.',
  },
  {
    name: 'shop staff',
    slug: 'shop_staff',
    description: 'Shop staff user role. Can view shop details connected to the user.',
  },
];

(async () => {
  console.log('running seeder')

  console.log('running roles seeder')
  await Promise.all(roles.map(async item => {
    try {
      await RoleRepository.upsert(item)
    } catch (e) { 
      console.error('Role Error', e)
      process.exit()
    }
  }))

  console.log('running admins seeder')
  
  const { value: adminRole} = await RoleRepository.findByProps({ slug: 'admin' })
  const adminPromises = admins.map(async admin => {
    try {
      return await UserRepository.upsert(
        admin.email,
        admin.username,
        bcrypt.hashSync(admin.password, saltRounds = 10),
        admin.firstNameKanji,
        admin.lastNameKanji,
        admin.firstNameKana,
        admin.lastNameKana,
        [adminRole],
      )
    } catch (e) {
      console.error(`Exception : ${e}`)
      process.exit()
    }
  })
  await Promise.all(adminPromises)

  console.log('running area seeder')

  const areas = require('./areas-db')
  await prisma.area.createMany({
    data: areas.map(area => ({
      slug: area.slug,
      name: area.name,
    })),
    skipDuplicates: true,
  })

  console.log('running prefecture seeder')

  const prefectures = require('./prefec-db')
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
              slug: prefec.area
            }
          }
        }
      })

    } catch (e) {
      console.error(`Exception : ${e}`)
      process.exit()
    }
  })

  await Promise.all(prefecturePromises)
  
  console.log('running city seeder')

  const cities = require('./cities-db')
  const cityPromises = cities.map(async city => {
    try {
      return await prisma.city.upsert({
        where: { slug: "SUB" + city.id },
        update: {},
        create: {
          name: city.name,
          slug: "SUB" + city.id,
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
  let count = 10
  while (count > 0) {
    const randomInt = Math.floor(Math.random() * cityCount)
    try {
      const city = await prisma.city.findFirst({ 
        skip: randomInt,
        include: {
          prefecture: {
            include: {
              area: true
            }
          }
        }
      })
      await prisma.shop.create({
        data: {
          city: {
            connect: {
              id: city.id
            }
          },
          prefecture: {
            connect: {
              id: city.prefecture.id
            }
          },
          area: {
            connect: {
              id: city.prefecture.area.id
            }
          },
          shopDetail: {
            create: {
              name: 'TEST'
            }
          }
        }
      })
    } catch (e) {
      console.error(`Exception : ${e}`)
      process.exit()
    }
    count--
  }

  console.log('running stylist seeder')
  const shopCounts = await prisma.shop.count()
  const randomShopInt = Math.floor(Math.random() * shopCounts)
  const randomShop = async () => prisma.shop.findFirst({ skip: randomShopInt })
  const stylists = [
    { name: 'Testarou', shop: await randomShop() },
    { name: 'Testoko', shop: await randomShop() }
  ]

  const stylistPromises = stylists.map(async stylist => {
    return prisma.stylist.create({
      data: {
        name: stylist.name,
        shops: {
          create: {
            shop: {
              connect: { id: stylist.shop.id }
            }
          }
        }
      }
    })
  })

  await Promise.all(stylistPromises)

  console.log('seed done')
  process.exit()

})()