const router = require('express').Router()
const Joi = require('joi')
const eah = require('express-async-handler')
const { viewController } = require('./lib/crudController')
const locationRepository = require('../repositories/locationRepository')
const shopRepository = require('../repositories/shopRepository')
const { shopSchema } = require('../schemas/shop')

const include = {
  area: true,
  prefecture: true,
  city: true,
}

const insertShop = eah(async (req, res, next) => {
  Joi.assert(req.body, shopSchema)
  const {
    name, areaID, prefectureID, cityID,
  } = req.body
  const city = await locationRepository.fetchCity(cityID)
  if (!city) {
    return next({ code: 404, message: 'City not found' })
  }
  if (city.prefecture.id !== prefectureID || city.prefecture.area.id !== areaID) {
    return next({ code: 401, message: 'Location did not match' })
  }
  const shop = await shopRepository.insertShop(name, areaID, prefectureID, cityID)
  if (!shop) {
    return next({ code: 401, message: 'Shop insert error' })
  }
  return res.send({ data: shop })
})

const updateShop = eah(async (req, res, next) => {
  Joi.assert(req.body, shopSchema)
  const {
    name, areaID, prefectureID, cityID,
  } = req.body
  const id = parseInt(req.params.id, 10)
  const city = await locationRepository.fetchCity(cityID)
  if (!city) {
    return next({ code: 404, message: 'City not found' })
  }
  if (city.prefecture.id !== prefectureID || city.prefecture.area.id !== areaID) {
    return next({ code: 401, message: 'Location did not match' })
  }
  const shop = await shopRepository.updateShop(id, name, areaID, prefectureID, cityID)
  if (!shop) {
    return next({ code: 401, message: 'Shop update error' })
  }
  return res.send({ data: shop })
})

const deleteShop = eah(async (req, res, next) => {
  const id = parseInt(req.params.id, 10)
  const deletedUser = await shopRepository.deleteShop(id)
  if (!deletedUser) {
    return next({ code: 401, message: 'Shop delete error' })
  }
  return res.send({ data: deletedUser })
})

// routes

router.get('/', viewController.index('shop', include))
router.get('/:id', viewController.show('shop', include))
router.post('/', insertShop)
router.patch('/:id', updateShop)
router.delete('/:id', deleteShop)
// TODO: add CUD endpoints

module.exports = router
