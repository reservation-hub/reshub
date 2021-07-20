const bcrypt = require('bcrypt')
const prisma = require('./src/db/prisma');
const userRepository = require('./src/repositories/userRepository')
const roleRepository = require('./src/repositories/roleRepository')

const admins = [
  {
    firstName: 'eugene',
    lastName: 'sinamban',
    password: 'testtest',
    email: 'eugene.sinamban@gmail.com',
  },
  {
    firstName: 'yoonsung',
    lastName: 'jang',
    password: 'testtest',
    email: 'upthe15752@gmail.com',
  },
  {
    firstName: 'sana',
    lastName: 'nakamura',
    password: 'testtest',
    email: 'dq.tri.fi@gmail.com',
  },
  {
    firstName: 'sabir',
    lastName: 'barahi',
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
      await roleRepository.upsert(item)
    } catch (e) { 
      console.error('Role Error', e)
      process.exit()
    }
  }))

  console.log('running admins seeder')
  
  const adminRole = await roleRepository.fetch({ slug: 'admin' })

  const adminPromises = admins.map(async admin => {
    try {
      return await userRepository.upsert({
        email: admin.email,
        password: bcrypt.hashSync(admin.password, saltRounds = 10),
        firstName: admin.firstName,
        lastName: admin.lastName,
        roles: [adminRole],
      })
    } catch (e) {
      console.error(e)
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
      console.error(e)
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
      console.error(e)
      process.exit()
    }
  })

  await Promise.all(cityPromises)
  
  console.log('seed done')
  process.exit()

})()