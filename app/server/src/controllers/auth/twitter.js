const router = require('express').Router()
const passport = require('passport')
const TwitterStrategy = require('passport-twitter')
const UserRepository = require('../../repositories/userRepository')
const { login, passport404Error } = require('./utils')

passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_API_KEY,
  consumerSecret: process.env.TWITTER_API_SECRET_KEY,
  callbackURL: `${process.env.RESHUB_URL}/auth/twitter/callback`,
  includeEmail: true,
}, async (token, tokenSecret, profile, done) => {
  try {
    let user = await UserRepository.findByProps([{ twitterID: profile.id }, { email: profile.emails[0].value }])
    if (!user) return done(passport404Error(profile))
    
    // ユーザー情報がDBにあったらIDをユーザー情報に追加する
    user = await UserRepository.addIdFromPassportProfile(user, profile)

    return done(null, user)
  } catch (e) {
    done(e, null)
  }
}))

router.get('/', passport.authenticate('twitter'))

router.get('/callback', passport.authenticate('twitter'), login)

module.exports = router