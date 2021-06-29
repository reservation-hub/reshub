exports.login = (req, res, next) => {
  const { user: profile } = req
  const user = {}
  
  if (profile.password) {
    Object.keys(profile._doc).map(key => {
      if (key !== "password") user[key] = profile[key]
    })
  } else {
    Object.assign(user, profile._doc)
  }

  req.session.user = user
  return res.send({})
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