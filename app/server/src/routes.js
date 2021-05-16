const { router: shopController } = require('./controllers/shopController')
const { router: areaController } = require('./controllers/areaController')
const { router: prefectureController } = require('./controllers/prefectureController')
const { router: cityController } = require('./controllers/cityController')

module.exports = (app) => {
  app.use('/prefecture', prefectureController)
  app.use('/shop', shopController)
}
