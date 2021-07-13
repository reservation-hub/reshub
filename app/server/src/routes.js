const passport = require('./controllers/passport')
const apiRoutes = [
  require('./controllers/API/areaController'),
  require('./controllers/API/indexController'),
]

const protectRoute = passport.authenticate('jwt', { session: false })
const roleCheck = (roles) => (req, res, next) => {
  const { user } = req
  const userRoles = user.roles.map(role => role.name)
  let authorized = false
  if (Array.isArray(roles)) {
    userRoles.forEach(role => {
      if (roles.indexOf(role) !== -1) authorized = true
    });
  } else {
    if (userRoles.indexOf(roles) !== -1) authorized = true
  }
  if (!authorized) return next({ code: 403, message: 'User unauthorized' })
  return next()
}

module.exports = (app) => {
  app.use('/api', apiRoutes)
  app.use('/auth', require('./controllers/authController'))

  app.use('/areas', protectRoute, roleCheck(['admin', 'shop_owner']), require('./controllers/areaController'))
  app.use('/prefectures', protectRoute, roleCheck(['admin', 'shop_owner']), require('./controllers/prefectureController'))
  app.use('/cities', protectRoute, roleCheck(['admin', 'shop_owner']), require('./controllers/cityController'))
  app.use('/roles', protectRoute, roleCheck(['admin', 'shop_owner']), require('./controllers/roleController'))
  app.use('/shops', protectRoute, roleCheck(['admin', 'shop_owner']), require('./controllers/shopController'))

  app.use('/*', (req, res, next) => next({code: 404, message: 'Bad route'})) // 404s
}