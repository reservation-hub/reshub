const db = require('./src/db/mongoose')
const { User } = require('./src/models/user')
const { Role } = require('./src/models/role')

const admins = [
  {
    firstName: "Eugene",
    lastName: "Sinamban",
    email: "eugene.sinamban@gmail.com",
  },
  {
    firstName: "Yoonsung",
    lastName: "Jang",
    email: "upthe15752@gmail.com"
  },
  {
    firstName: "Sana",
    lastName: "Nakamura",
    email: "dq.tri.fi@gmail.com"
  },
  {
    firstName: "Sabir",
    lastName: "Barahi",
    email: "sabirbarahi41@gmail.com",
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
]

const seed = async () => {
  console.log("running seeder")
  
  console.log('running roles seeder')
  roles.forEach(async item => {
    try {
      const role = new Role(item)
      const duplicate = await Role.find({ name: role.name }).exec()
      if (duplicate.length > 0) return
      role.save()
    } catch(e) {console.log("Role Seeder Error", e)}
  })

  const role = await Role.findOne({ name: "admin" })

  console.log('running admins seeder')
  admins.forEach(async admin => {
    const values = {}
    Object.entries(admin).forEach(([key, val]) => {
      values[key] = val
    })
    try {
      const user = new User(values)
      user.roles.push(role)
      const duplicate = await User.find({email: user.email}).exec()
      if (duplicate.length > 0) return
      user.save()
    } catch (e) {console.log('ERROR', e)}
  })
  
  console.log("Seeding done!")
  
}

seed()
setTimeout(() => {
  process.exit()
}, 1000);