const router = require('express').Router()
const Joi = require('joi')
const eah = require('express-async-handler')
const { parseIDToInt } = require('./lib/utils')
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
  const { id } = res.locals
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
  const { id } = res.locals
  const deletedShop = await shopRepository.deleteShop(id)
  if (!deletedShop) {
    return next({ code: 401, message: 'Shop delete error' })
  }
  return res.send({ data: deletedShop })
})

// routes

router.get('/', viewController.index('shop', include))
router.get('/:id', viewController.show('shop', include))
router.post('/', insertShop)
router.patch('/:id', parseIDToInt, updateShop)
router.delete('/:id', parseIDToInt, deleteShop)

module.exports = router
