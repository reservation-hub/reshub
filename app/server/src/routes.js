const jwtPassport = require('./controllers/auth/jwt')
const apiRoutes = [
  require('./controllers/API/areaController'),
  require('./controllers/API/indexController'),
]

// TODO learn how to get cookies set in postman then use it for route protection
const protectRoute = () => (req, res, next) => {
  return jwtPassport.authenticate('jwt', { session: false }, () => {
    const { signedCookies, cookies } = req
    console.log('signed cookies : ', signedCookies)
    console.log('cookies ', cookies)
    // console.log(req)
    return next()
  })(req, res, next)
}

module.exports = (app) => {
  app.use('/api', apiRoutes)
  app.use('/auth', require('./controllers/auth/authController'))

  app.use('/areas', jwtPassport.authenticate('jwt', { session: false }), require('./controllers/areaController'))
  app.use('/prefectures', jwtPassport.authenticate('jwt', { session: false }), require('./controllers/prefectureController'))
  app.use('/cities', jwtPassport.authenticate('jwt', { session: false }), require('./controllers/cityController'))
  app.use('/shops', jwtPassport.authenticate('jwt', { session: false }), require('./controllers/shopController'))

  app.use('/*', (req, res, next) => next({code: 404, message: 'Bad route'})) // 404s
}
