const apiRoutes = [
  require('./controllers/API/areaController'),
  require('./controllers/API/indexController'),
]

module.exports = (app) => {
  app.use('/api', apiRoutes)

  app.use('/area', require('./controllers/areaController'))
  app.use('/prefecture', require('./controllers/prefectureController'))
  app.use('/city', require('./controllers/cityController'))
  app.use('/shop', require('./controllers/shopController'))
  app.use('/', require('./controllers/pageController'))

  app.use('/*', (req, res, next) => next({code: 404})) // 404s
}
