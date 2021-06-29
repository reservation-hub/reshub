const router = require('express').Router()
const passport = require('passport')
const LineStrategy = require('passport-line-auth')
const UserRepository = require('../../repositories/userRepository')
const { login, passport404Error } = require('./utils')
const jwt = require('jsonwebtoken')

passport.use(new LineStrategy({
  channelID: process.env.LINE_CHANNEL_ID,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  callbackURL: `${process.env.RESHUB_URL}/auth/line/callback`,
  scope: ['profile', 'openid', 'email',],
  botPrompt: 'normal',
  uiLocales: 'en-US',
}, async (token, tokenSecret, params, profile, done) => {
  try {
    // メールをparamsから取得
    profile.email = jwt.decode(params.id_token).email

    let user = await UserRepository.findByProps([{ LineID: profile.id }, { email: profile.email }])
    if (!user) return done(passport404Error(profile))

    // ユーザー情報がDBにあったらIDをユーザー情報に追加する
    user = await UserRepository.addIdFromPassportProfile(user, profile)

    return done(null, user)
  } catch (e) {
    done(e, null)
  }
}))

router.get('/', passport.authenticate('line'))

router.get('/callback', passport.authenticate('line'), login)

module.exports = router