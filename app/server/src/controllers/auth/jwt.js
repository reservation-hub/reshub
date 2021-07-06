const passport = require('passport')
const { Strategy: JWTStrategy, ExtractJwt } = require('passport-jwt')
const UserRepository = require('../../repositories/userRepository')

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_TOKEN_SECRET,
  audience: 'http://localhost:8080',
  expiresIn: "1d",
  issuer: process.env.RESHUB_URL
}

passport.use(new JWTStrategy(options, async (jwtPayload, done) => {
  try {
    let user = await UserRepository.findByProps({ _id: jwtPayload.user._id })
    if (!user) return done("Unauthorized")
    return done(null, user)
  } catch (e) {return done(e, null)}
}))

module.exports = passport