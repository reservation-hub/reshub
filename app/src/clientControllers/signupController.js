const router = require('express').Router()
const bcrypt = require('bcrypt')
const eah = require('express-async-handler')
const { userSchema } = require('../schemas/signup')
const UserRepository = require('../repositories/UserRepository')
const { mailController } = require('./lib/mailController')

const joiOptions = { abortEarly: false, stripUnknown: true }

// validate the signup values with joi schema
const signup = eah(async (req, res, next) => {
  const {
    error: userValuesError,
    value: userValues,
  } = userSchema.validate(req.body, joiOptions)

  if (userValuesError) {
    return next({ error: userValuesError })
  }

  const saltRounds = 10
  const salt = bcrypt.genSaltSync(saltRounds)
  const hash = bcrypt.hashSync(userValues.password, salt)

  const {
    error: createUserError,
    value: user,
  } = await UserRepository
    .signupUser(userValues.email, hash, userValues.username)

  if (createUserError) {
    return next({ error: createUserError })
  }
  delete user.password
  await mailController.mailSender(userValues.email)
  return res.send({ data: user })
})

router.post('/signup', signup)
module.exports = router
