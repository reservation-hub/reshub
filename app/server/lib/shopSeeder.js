module.exports = (count) => async (req, res, next) => {

  const { City } = require('../src/models/city')
  const { Shop } = require('../src/models/shop')
  
  let counter = 0
  const shops = []

  while(counter < count) {
    const cityCount = 1747
    const random = Math.floor(Math.random() * cityCount)
    const city = await City.findOne({}).skip(random).populate({path: 'prefecture', populate: 'area'}).exec()
  
    const shop = new Shop({
      name: 'test',
      slug: 'test',
      area: city.prefecture.area._id,
      prefecture: city.prefecture._id,
      city: city._id,
      details: 'New Salon in town',
      brand: 'test',
    })
  
    shop.save()
    shops.push(shop)
    counter++
  }

  return res.send({data: shops})

}