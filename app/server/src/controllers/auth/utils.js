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