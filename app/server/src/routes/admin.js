const express = require('express')
const router = express.Router()
const { validationSchema: shopSchema, Shop } = require('../models/shop')
const { schemaMiddleware: middleware, idMiddleware } = require('../../lib/validators')
const { crudController } = require('../controllers/crudController')

router.use('/:id', idMiddleware())
router.post('/', middleware(shopSchema), crudController.index({ Model: Shop }))

module.exports = router