const bcrypt = require('bcrypt')
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

admins.forEach(admin => {
  const values = {}
  Object.entries(admin).forEach(([key, val]) => {
    values[key] = val
  })
  const unhashedPass = "testtest"
  const hash = bcrypt.hashSync(unhashedPass, saltRounds = 10)
  values.password = hash
  const user = new User(values)
  user.save()
})