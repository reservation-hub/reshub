const passport = require('passport')
const { Strategy: JWTStrategy, ExtractJwt } = require('passport-jwt')
const UserRepository = require('../../repositories/userRepository')

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_TOKEN_SECRET,
  issuer: 'localhost:8080',
  audience: 'localhost:8090',
}

passport.use(new JWTStrategy(options, async (jwtPayload, done) => {
  try {
    let user = await UserRepository.findByProps({ _id: jwtPayload._id })
    if (!user) return done('JWT TOKEN ERROR')
    return done('SUCCESS')
  } catch (e) {return done(e, null)}
}))

module.exports = passport