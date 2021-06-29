const apiRoutes = [
  require('./controllers/API/areaController'),
  require('./controllers/API/indexController'),
]

const authCheck = (req, res, next) => {
  console.log('session user : ', req.session.user)
  if (req.session.user === undefined) return next({ message: 'aa', code: 401})
  return next()
}

module.exports = (app) => {
  app.use('/api', apiRoutes)
  app.use('/auth', require('./controllers/auth/authController'))

  app.use('/areas', require('./controllers/areaController'))
  app.use('/prefectures', require('./controllers/prefectureController'))
  app.use('/cities', require('./controllers/cityController'))
  app.use('/shops', require('./controllers/shopController'))
  app.use('/', authCheck, require('./controllers/pageController'))

  app.use('/*', (req, res, next) => next({code: 404, message: 'Bad route'})) // 404s
}
