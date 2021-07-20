const router = require('express').Router()
const jwt = require('jsonwebtoken')
const eah = require('express-async-handler')
const { OAuth2Client: GoogleAuthClient } = require('google-auth-library')
const UserRepository = require('../repositories/userRepository')
const passport = require('./passport')

const login = eah(async (req, res, next) => {
  const { email } = res.locals.auth ?? req.user ?? {}
  let user = await UserRepository.findByProps({ email })
  if (!user) return next({ code: 404, message: 'User not found' })

  const { oAuth } = res.locals.auth ?? {}
  if (oAuth) {
    await UserRepository.addIdFromPassportProfile(user, oAuth)
  }

  user = user.toObject()
  delete user.password

  // トークン生成
  const cookieOptions = {
    httpOnly: process.env.NODE_ENV === 'production',
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 12,
    signed: true,
  }
  const token = jwt.sign({ user }, process.env.JWT_TOKEN_SECRET, {
    audience: 'http://localhost:8080',
    expiresIn: '1d',
    issuer: process.env.RESHUB_URL,
  })

  // クッキーを設定
  res.cookie('authToken', token, cookieOptions)
  return res.send({ user, token })
})

const verifyIfNotLoggedInYet = eah(async (req, res, next) => {
  const { signedCookies } = req

  if (!signedCookies || !signedCookies.authToken) return next()

  const token = jwt.verify(signedCookies.authToken, process.env.JWT_TOKEN_SECRET)
  const user = await UserRepository.findByProps([
    { email: token.user.email },
    { _id: token.user._id },
  ])
  if (!user) return next({ code: 403, message: 'Unauthorized Access' })

  return next({ code: 400, message: 'User is already logged in!' })
})

const checkGoogleToken = eah(async (req, res, next) => {
  const client = new GoogleAuthClient(process.env.GOOGLE_CLIENT_ID)
  const { tokenId } = req.body
  if (!tokenId) return next({ code: 401, message: 'Bad Request' })

  const ticket = await client.verifyIdToken({
    idToken: tokenId,
    audience: process.env.GOOGLE_CLIENT_ID,
  })

  const { email, sub } = ticket.getPayload()
  if (!email) return next({ code: 401, message: 'Bad Request' })
  res.locals.auth = { email, oAuth: { provider: 'google', id: sub } }
  return next()
})

const logout = (req, res) => {
  res.clearCookie('authToken')
  res.send('Logged out successfully!')
}

router.post('/google', verifyIfNotLoggedInYet, checkGoogleToken, login)
router.post('/login', verifyIfNotLoggedInYet, passport.authenticate('local', { session: false }), login)
router.post('/silent_refresh', passport.authenticate('jwt', { session: false }), login)
router.get('/logout', passport.authenticate('jwt', { session: false }), logout)

module.exports = router
