const passport = require('./controllers/lib/passport')

const authController = require('./controllers/authController')
const areaController = require('./controllers/areaController')
const prefectureController = require('./controllers/prefectureController')
const cityController = require('./controllers/cityController')
const roleController = require('./controllers/roleController')
const shopController = require('./controllers/shopController')
const userController = require('./controllers/userController')
const reservationController = require('./controllers/reservationController')
const stylistController = require('./controllers/stylistController')

const apiRoutes = []

const protectRoute = passport.authenticate('jwt', { session: false })
const roleCheck = roles => (req, res, next) => {
  const { user } = req
  const authorized = user.roles.filter(ur => roles.includes(ur.name)).length > 0
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
  app.use('/stylists', protectRoute, roleCheck(['admin']), stylistController)
  app.use('/reservations', protectRoute, roleCheck(['admin']), reservationController)
  app.use('/users', protectRoute, roleCheck(['admin']), userController)

  app.use('/*', (req, res, next) => next({ code: 404, message: 'Bad route' })) // 404s
}
