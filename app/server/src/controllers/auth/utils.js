const jwt = require('jsonwebtoken')
const cookieOptions = { 
  httpOnly: true, 
  secure: true, 
  sameSite: "none", 
  maxAge: 360000, 
  signed: true, 
}

exports.login = (req, res, next) => {
  const { user: profile } = req
  const user = {}
  
  // create safe user obj
  Object.entries(profile.toObject()).map(([key, value]) => {
    if (key !== 'password') user[key] = value
  })

  // create token
  const token = jwt.sign({ user }, process.env.JWT_TOKEN_SECRET, {
    audience: 'http://localhost:8080',
    expiresIn: "1d",
    issuer: process.env.RESHUB_URL
  })
  console.log('token : ', token)
  // set cookies values
  res.cookie('authToken', token, cookieOptions)
  return res.send({ user })
}

exports.passport404Error = (profile) => {
  return {
    code: 404,
    message: "User not found",
    data: this.passportData(profile),
  }
}

exports.passportData = (profile) => {

  switch (profile.provider) {
    case 'google':
      return { 
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value,
        googleID: profile.id
      }
    case 'twitter':
      return {
        email: profile.emails[0].value,
        twitterID: profile.id,
      }
    case 'line':
      return { email: profile.email, lineID: profile.id }
  }
}