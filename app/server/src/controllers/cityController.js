const router = require('express').Router()
const { City } = require('../models/city')
const { crudController } = require('../../lib/crudController')

router.get('/', crudController.index(City))
router.get('/:slug', crudController.show(City, { slug: 'slug' }))

module.exports = router