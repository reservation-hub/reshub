const router = require('express').Router()
const jwt = require('jsonwebtoken')
const eah = require('express-async-handler')
const { OAuth2Client: GoogleAuthClient } = require('google-auth-library')
const UserRepository = require('../repositories/userRepository')
const passport = require('./lib/passport')

const login = eah(async (req, res) => {
  const { user } = req

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
    { id: token.user.id },
  ])
  if (!user) return next({ code: 403, message: 'Unauthorized Access' })

  return next({ code: 400, message: 'User is already logged in!' })
})

const googleAuthenticate = eah(async (req, res, next) => {
  const client = new GoogleAuthClient(process.env.GOOGLE_CLIENT_ID)
  const { provider, tokenId } = req.body
  if (!tokenId) return next({ code: 401, message: 'Bad Request' })

  const ticket = await client.verifyIdToken({
    idToken: tokenId,
    audience: process.env.GOOGLE_CLIENT_ID,
  })

  const { email, sub } = ticket.getPayload()
  if (!email) return next({ code: 401, message: 'Bad Request' })

  const { error, value: user } = await UserRepository.findByProps({ email })
  if (error) return next({ code: 404, message: 'User not found', error })
  delete user.password
  if (user.roles.length > 0) {
    user.roles = user.roles.map(role => role.role)
  }
  if (!user.oAuthIDs || !user.oAuthIDs.googleID) {
    await UserRepository.addOAuthID(user, { provider, id: sub })
  }

  req.user = user
  return next()
})

const logout = (req, res) => {
  res.clearCookie('authToken')
  res.send('Logged out successfully!')
}

router.post('/google', verifyIfNotLoggedInYet, googleAuthenticate, login)
router.post('/login', verifyIfNotLoggedInYet, passport.authenticate('local', { session: false }), login)
router.post('/silent_refresh', passport.authenticate('jwt', { session: false }), login)
router.get('/logout', passport.authenticate('jwt', { session: false }), logout)

module.exports = router
