require('./src/db/mongoose')
const bcrypt = require('bcrypt')
const { User } = require('./src/models/user')
const { Role } = require('./src/models/role')
const { Area } = require('./src/models/area')
const { Prefecture } = require('./src/models/prefecture')
const { City } = require('./src/models/city')

const admins = [
  {
    firstName: 'Eugene',
    lastName: 'Sinamban',
    password: 'testtest',
    email: 'eugene.sinamban@gmail.com',
  },
  {
    firstName: 'Yoonsung',
    lastName: 'Jang',
    password: 'testtest',
    email: 'upthe15752@gmail.com',
  },
  {
    firstName: 'Sana',
    lastName: 'Nakamura',
    password: 'testtest',
    email: 'dq.tri.fi@gmail.com',
  },
  {
    firstName: 'Sabir',
    lastName: 'Barahi',
    password: 'testtest',
    email: 'sabirbarahi41@gmail.com',
  },
]

const roles = [
  {
    name: 'admin',
    description: 'Administrator role. Can make changes on everything.',
  },
  {
    name: 'shop_staff',
    description: 'Shop staff user role. Can view shop details connected to the user.',
  },
  {
    name: 'shop_owner',
    description: 'Shop owner. Can edit user roles for shop staff.',
  },
];

(async () => {
  console.log('running seeder')

  console.log('running roles seeder')
  await Promise.all(roles.map(async item => {
    try {
      const role = new Role(item)
      const duplicate = await Role.find({ name: role.name }).exec()
      if (duplicate.length > 0) return duplicate
      role.save()
      return role
    } catch (e) { console.error('Role Error', e) }
  }))

  const role = await Role.findOne({ name: 'admin' })

  console.log('running admins seeder')

  const adminPromises = admins.map(async admin => {
    const values = {}
    Object.entries(admin).forEach(([key, val]) => {
      values[key] = val
    })

    try {
      const user = new User(values)
      const duplicate = await User.find({ email: user.email }).exec()
      if (duplicate.length > 0) return duplicate

      user.roles.push(role)
      user.password = bcrypt.hashSync(user.password, saltRounds = 10)
      await user.save()
      return user
    } catch (e) { console.error('User Error', e) }
  })

  await Promise.all(adminPromises)

  console.log('running location seeders')

  console.log('running area seeder')

  const areas = require('./areas-db')
  const areaPromises = areas.map(async area => {
    try {
      const areaObject = new Area(area)
      const duplicate = await Area.find({ _id: area._id }).exec()
      if (duplicate.length > 0) return duplicate
      await areaObject.save()
      return areaObject
    } catch (e) { console.error('Area Error', e) }
  })

  await Promise.all(areaPromises)

  console.log('running prefecture seeder')

  const prefectures = require('./prefec-db')
  const prefecturePromises = prefectures.map(async prefecture => {
    try {
      const prefectureObject = new Prefecture(prefecture)
      const duplicate = await Prefecture.find({ _id: prefecture._id}).exec()
      if (duplicate.length > 0) return duplicate
      await prefectureObject.save()
      return prefectureObject
    } catch (e) { console.error('Prefecture Error', e) }
  })

  await Promise.all(prefecturePromises)
  console.log('running city seeder')

  const cities = require('./cities-db')
  const prefectureList = await Prefecture.find({}).exec()
  const cityPromises = cities.filter(city => city.name !== '').map(async city => {
    try {
      const prefecture = prefectureList[prefectureList.findIndex(prefecture => prefecture.slug === city.prefecture)]
      const cityObject = new City({ ...city, prefecture: prefecture._id })
      const duplicate = await City.find({ _id: city._id })
      if (duplicate.length > 0) return duplicate
      await cityObject.save()
      return cityObject
    } catch (e) { console.error('City Error', e )}
  })
  
  await Promise.all(cityPromises)

  console.log('Seeding done!')
  process.exit()
})()
