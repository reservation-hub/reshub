require('./src/db/mongoose')
const { City } = require('./src/models/city')
const { Area } = require('./src/models/area')
const { Prefecture } = require('./src/models/prefecture')
const { Shop } = require('./src/models/shop');

(async () => {
  const cityCount = 1747
  const random = Math.floor(Math.random() * cityCount)
  const city = await City.findOne({}).skip(random).populate({ path: 'prefecture', populate: 'area' }).exec()

  const shop = new Shop({
    name: 'test',
    slug: 'test',
    area: city.prefecture.area._id,
    prefecture: city.prefecture._id,
    city: city._id,
    details: 'New Salon in town',
    brand: 'test',
  })

  await shop.save()
  console.log('Seeding done!')
  process.exit()
})()