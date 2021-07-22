const passport = require('./controllers/lib/passport')
const apiAreaController = require('./controllers/API/areaController')
const apiIndexController = require('./controllers/API/indexController')

const authController = require('./controllers/authController')
const areaController = require('./controllers/areaController')
const prefectureController = require('./controllers/prefectureController')
const cityController = require('./controllers/cityController')
const roleController = require('./controllers/roleController')
const shopController = require('./controllers/shopController')
const userController = require('./controllers/userController')

const apiRoutes = [
  apiAreaController,
  apiIndexController,
]

const protectRoute = passport.authenticate('jwt', { session: false })
const roleCheck = roles => (req, res, next) => {
  const { user } = req
  const userRoles = user.roles.map(role => role.name)
  let authorized = false
  if (Array.isArray(roles)) {
    userRoles.forEach(role => {
      if (roles.indexOf(role) !== -1) authorized = true
    })
  } else if (userRoles.indexOf(roles) !== -1) {
    authorized = true
  }
  if (!authorized) return next({ code: 403, message: 'User unauthorized' })
  return next()
}

module.exports = app => {
  app.use('/api', protectRoute, apiRoutes)
  app.use('/auth', authController)

  app.use('/areas', protectRoute, roleCheck(['admin']), areaController)
  app.use('/prefectures', protectRoute, roleCheck(['admin']), prefectureController)
  app.use('/cities', protectRoute, roleCheck(['admin']), cityController)
  app.use('/roles', protectRoute, roleCheck(['admin']), roleController)
  app.use('/shops', protectRoute, roleCheck(['admin']), shopController)
  app.use('/users', userController)

  app.use('/*', (req, res, next) => next({ code: 404, message: 'Bad route' })) // 404s
}
