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
router.post('/test', (req, res, next) => {
  const cookieOptions = { 
    httpOnly: true, 
    secure: true, 
    sameSite: "none", 
    maxAge: 360000, 
    signed: true, 
  }
  const user = UserRepository.findByProps({ email: "eugene.sinamban@gmail.com" })
  const token = jwt.sign({ user }, process.env.JWT_TOKEN_SECRET, {
    audience: 'http://localhost:8080',
    expiresIn: "1d",
    issuer: process.env.RESHUB_URL
  })
  console.log('token : ', token)
  // set cookies values
  res.cookie('authToken', token, cookieOptions)
  console.log(res)
  return res.send({ user })

})
module.exports = router