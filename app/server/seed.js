require('./src/db/mongoose')
const bcrypt = require('bcrypt')
const { User } = require('./src/models/user')
const { Role } = require('./src/models/role')
const { Area } = require('./src/models/area')

const admins = [
  {
    firstName: "Eugene",
    lastName: "Sinamban",
    password: "testtest",
    email: "eugene.sinamban@gmail.com",
  },
  {
    firstName: "Yoonsung",
    lastName: "Jang",
    password: "testtest",
    email: "upthe15752@gmail.com"
  },
  {
    firstName: "Sana",
    lastName: "Nakamura",
    password: "testtest",
    email: "dq.tri.fi@gmail.com"
  },
  {
    firstName: "Sabir",
    lastName: "Barahi",
    password: "testtest",
    email: "sabirbarahi41@gmail.com"
  }
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
    description: 'Shop owner. Can edit user roles for shop staff.'
  }
];

(async () => {
  console.log("running seeder")
  
  console.log('running roles seeder')
  await Promise.all(roles.map(async item => {
    try {
      const role = new Role(item)
      const duplicate = await Role.find({ name: role.name }).exec()
      if (duplicate.length > 0) return duplicate
      role.save()
      return role
    } catch (e) {console.error('Role Error', e)}
  }))

  const role = await Role.findOne({ name: "admin" })

  console.log('running admins seeder')

  const adminPromises = admins.map(async admin => {
    const values = {}
    Object.entries(admin).forEach(([key, val]) => {
      values[key] = val
    })
    
    try {
      const user = new User(values)
      const duplicate = await User.find({email: user.email}).exec()
      if (duplicate.length > 0) return duplicate

      user.roles.push(role)
      user.password = bcrypt.hashSync(user.password, saltRounds = 10)
      await user.save()
      return user
    } catch (e) {console.error('User Error', e)}
  })

  await Promise.all(adminPromises)
  
  console.log('running location seeders')

  const areas = require('./areas')
  const areaPromises = areas.map(async area => {
    try {
      const areaObject = new Area(area)
      const duplicate = await Area.find({ _id: area._id }).exec()
      if (duplicate.length > 0) return duplicate
      await areaObject.save()
      return areaObject
    } catch(e) { console.error('Area Error', e) }
  })

  await Promise.all(areaPromises)
  console.log("Seeding done!")
  process.exit()
  
})()
