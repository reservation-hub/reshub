const router = require('express').Router()
const eah = require('express-async-handler')
const { parseIntIDMiddleware } = require('./lib/utils')
const { viewController } = require('./lib/viewController')
const locationRepository = require('../repositories/locationRepository')
const shopRepository = require('../repositories/shopRepository')
const { shopUpsertSchema } = require('./schemas/shop')

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
  } = shopUpsertSchema.validate(req.body, joiOptions)

  if (shopSchemaError) {
    return next({ code: 400, message: 'Invalid input values', error: shopSchemaError })
  }

  const { error: locationsError, value: locationsAreValid } = await locationRepository
    .locationsAreValid(shopInsertValues.areaID, shopInsertValues.prefectureID,
      shopInsertValues.cityID)
  if (locationsError) {
    return next({ code: 500, message: 'DB Error', error: locationsError })
  }

  if (!locationsAreValid) {
    return next({ code: 400, message: 'Locations are invalid' })
  }

  const { error, value: shop } = await shopRepository.insertShop(
    shopInsertValues.name, shopInsertValues.address, shopInsertValues.phoneNumber,
    shopInsertValues.areaID, shopInsertValues.prefectureID, shopInsertValues.cityID,
  )
  if (error) {
    return next({ code: 400, message: 'Shop insert error' })
  }
  return res.send({ data: shop })
})

const updateShop = eah(async (req, res, next) => {
  const { id } = res.locals
  const {
    error: shopSchemaError,
    value: shopUpdateValues,
  } = shopUpsertSchema.validate(req.body, joiOptions)

  if (shopSchemaError) {
    return next({ code: 400, message: 'Invalid input values', error: shopSchemaError })
  }

  const { error: locationsError, value: locationsAreValid } = await locationRepository
    .locationsAreValid(shopUpdateValues.areaID, shopUpdateValues.prefectureID,
      shopUpdateValues.cityID)
  if (locationsError) {
    return next({ code: 500, message: 'DB Error', error: locationsError })
  }

  if (!locationsAreValid) {
    return next({ code: 400, message: 'Locations are invalid' })
  }

  const { error, value: shop } = await shopRepository.updateShop(
    id, shopUpdateValues.name, shopUpdateValues.address, shopUpdateValues.phoneNumber,
    shopUpdateValues.areaID, shopUpdateValues.prefectureID, shopUpdateValues.cityID,
  )
  if (error) {
    return next({ code: 400, message: 'Shop update error' })
  }
  return res.send({ data: shop })
})

const deleteShop = eah(async (req, res, next) => {
  const { id } = res.locals
  const { error, value: deletedShop } = await shopRepository.deleteShop(id)
  if (error) {
    return next({ code: 400, message: 'Shop delete error', error })
  }
  return res.send({ data: deletedShop })
})

// routes

router.get('/', viewController.index('shop', include))
router.get('/:id', viewController.show('shop', include))
router.post('/', insertShop)
router.patch('/:id', parseIntIDMiddleware, updateShop)
router.delete('/:id', parseIntIDMiddleware, deleteShop)

module.exports = router
