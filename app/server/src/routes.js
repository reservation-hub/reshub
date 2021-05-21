const { router: shopController } = require('./controllers/shopController')
const { router: areaController } = require('./controllers/areaController')
const { router: prefectureController } = require('./controllers/prefectureController')
const { router: cityController } = require('./controllers/cityController')
const { router: pageController } = require('./controllers/pageController')

module.exports = (app) => {
  app.use('/area', areaController)
  app.use('/prefecture', prefectureController)
  app.use('/city', cityController)
  app.use('/shop', shopController)
  app.use('/', pageController)
}
