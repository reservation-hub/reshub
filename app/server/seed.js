const db = require('./src/db/mongoose')
const { User } = require('./src/models/user')
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
    email: "sabirbarahi41@gmail.com"
  }
]

console.log("running seeder")
admins.forEach(async admin => {
  const values = {}
  Object.entries(admin).forEach(([key, val]) => {
    values[key] = val
  })
  try {
    const user = new User(values)
    console.log("add", user)
    await user.save()
  } catch (e) {console.log('ERROR', e)}
})

console.log("Seeding done!")