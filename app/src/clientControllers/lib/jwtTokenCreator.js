const jwt = require('jsonwebtoken')

const jwtTokenCreator = {
  create(email) {
    const tokenCreate = jwt.sign(
      { email },
      process.env.JWT_TOKEN_SECRET,
      {
        expiresIn: '12h',
      },
    )
    return tokenCreate
  },
}

module.exports = jwtTokenCreator
