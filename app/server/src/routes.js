const jwtPassport = require('./controllers/auth/jwt')
const apiRoutes = [
  require('./controllers/API/areaController'),
  require('./controllers/API/indexController'),
]

const jwt = require('jsonwebtoken')
const UserRepository = require('./repositories/userRepository')

// TODO learn how to get cookies set in postman then use it for route protection
const protectRoute = jwtPassport.authenticate('jwt', { session: false })
   

module.exports = (app) => {
  app.use('/api', apiRoutes)
  app.use('/auth', require('./controllers/auth/authController'))

  app.use('/areas', jwtPassport.authenticate('jwt', { session: false }), require('./controllers/areaController'))
  app.use('/prefectures', jwtPassport.authenticate('jwt', { session: false }), require('./controllers/prefectureController'))
  app.use('/cities', jwtPassport.authenticate('jwt', { session: false }), require('./controllers/cityController'))
  app.use('/shops', protectRoute, require('./controllers/shopController'))
  
  app.use('/*', (req, res, next) => next({code: 404, message: 'Bad route'})) // 404s
}