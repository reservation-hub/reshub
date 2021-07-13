const router = require('express').Router()
const jwt = require('jsonwebtoken')
const UserRepository = require('../repositories/userRepository')
const eah = require('express-async-handler')
const passport = require('./passport')

const login = (req, res, next) => {
  const { user: profile } = req
  const user = {}
  const cookieOptions = { 
    httpOnly: process.env.NODE_ENV === 'production', 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax", 
    maxAge: 1000 * 60 * 60 * 12, 
    signed: true, 
  }
  
  // create safe user obj
  Object.entries(profile.toObject()).map(([key, value]) => {
    if (key !== 'password') user[key] = value
  })

  // トークン生成
  const token = jwt.sign({ user }, process.env.JWT_TOKEN_SECRET, {
    audience: 'http://localhost:8080',
    expiresIn: "1d",
    issuer: process.env.RESHUB_URL
  })

  // クッキーを設定
  res.cookie('authToken', token, cookieOptions)
  return res.send({ user, token })
}

const verifyIfLoggedIn = eah(async (req, res, next) => {
  const { signedCookies } = req

  if (!signedCookies.authToken) return next()

  const token = jwt.verify(signedCookies.authToken, process.env.JWT_TOKEN_SECRET)
  const user = await UserRepository.findByProps([{ email: token.user.email }, { _id: token.user._id }])
  if (!user) return next({ code: 403, message: "Unauthorized Access"})

  return res.send({ message: "User is already logged in!" })
  
})

router.get('/google', verifyIfLoggedIn, passport.authenticate('google', { scope: ['email', 'profile'] }))
router.get('/google/callback', verifyIfLoggedIn, passport.authenticate('google', { session: false }), login)

module.exports = router