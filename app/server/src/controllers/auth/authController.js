const router = require('express').Router()
const jwt = require('jsonwebtoken')
const UserRepository = require('../../repositories/userRepository')
const eah = require('express-async-handler')

const verifyIfLoggedIn = eah(async (req, res, next) => {
  const { signedCookies } = req

  if (!signedCookies.authToken) return next()

  const token = jwt.verify(signedCookies.authToken, process.env.JWT_TOKEN_SECRET)
  const user = await UserRepository.findByProps([{ email: token.user.email }, { _id: token.user._id }])
  if (!user) return next({ code: 403, message: "Unauthorized Access"})

  return res.send({ message: "User is already logged in!" })
  
})

router.use('/google', verifyIfLoggedIn, require('./google'))

module.exports = router