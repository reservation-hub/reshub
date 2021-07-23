const router = require('express').Router()
const eah = require('express-async-handler')
const { parseIDToInt } = require('./lib/utils')
const { viewController } = require('./lib/crudController')
const locationRepository = require('../repositories/locationRepository')
const shopRepository = require('../repositories/shopRepository')
const { shopInsertSchema, shopUpdateSchema } = require('./schemas/shop')

const include = {
  area: true,
  prefecture: true,
  city: true,
}

const joiOptions = { abortEarly: false, stripUnknown: true }

const insertShop = eah(async (req, res, next) => {
  const {
    error: shopSchemaError,
    value: shopInsertValues,
  } = shopInsertSchema.validate(req.body, joiOptions)

  if (shopSchemaError) {
    return next({ code: 401, message: 'Invalid input values', error: shopSchemaError })
  }

  const { error: locationsError, value: locationsAreValid } = await locationRepository
    .locationsAreValid(shopInsertValues.areaID, shopInsertValues.prefectureID,
      shopInsertValues.cityID)
  if (locationsError) {
    return next({ code: 500, message: 'DB Error', error: locationsError })
  }

  if (!locationsAreValid) {
    return next({ code: 401, message: 'Locations are invalid' })
  }

  const { error, value: shop } = await shopRepository.insertShop(shopInsertValues.name,
    shopInsertValues.areaID, shopInsertValues.prefectureID, shopInsertValues.cityID)
  if (error) {
    return next({ code: 401, message: 'Shop insert error' })
  }
  return res.send({ data: shop })
})

const updateShop = eah(async (req, res, next) => {
  const { id } = res.locals
  const {
    error: shopSchemaError,
    value: shopUpdateValues,
  } = shopUpdateSchema.validate({ ...req.body, id }, joiOptions)

  if (shopSchemaError) {
    return next({ code: 401, message: 'Invalid input values', error: shopSchemaError })
  }

  const { error: locationsError, value: locationsAreValid } = await locationRepository
    .locationsAreValid(shopUpdateValues.areaID, shopUpdateValues.prefectureID,
      shopUpdateValues.cityID)
  if (locationsError) {
    return next({ code: 500, message: 'DB Error', error: locationsError })
  }

  if (!locationsAreValid) {
    return next({ code: 401, message: 'Locations are invalid' })
  }

  const { error, value: shop } = await shopRepository.updateShop(shopUpdateValues.id,
    shopUpdateValues.name, shopUpdateValues.areaID,
    shopUpdateValues.prefectureID, shopUpdateValues.cityID)
  if (error) {
    return next({ code: 401, message: 'Shop update error' })
  }
  return res.send({ data: shop })
})

const deleteShop = eah(async (req, res, next) => {
  const { id } = res.locals
  const { error, value: deletedShop } = await shopRepository.deleteShop(id)
  if (error) {
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
