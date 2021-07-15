const express = require('express')

const router = express.Router()
const { Prefecture } = require('../models/prefecture')
const { crudController } = require('../../lib/crudController')

router.get('/', crudController.index(Prefecture))
router.get('/:slug', crudController.show(Prefecture, { slug: 'slug' }))

module.exports = router
