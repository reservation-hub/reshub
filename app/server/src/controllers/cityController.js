const express = require('express')
const router = express.Router()
const { validationSchema: citySchema, City } = require('../models/city')
const { crudController } = require('../../lib/crudController')

router.get('/', crudController.index(City))
router.get('/:slug', crudController.show(City, {slug: 'slug'}))

module.exports = router