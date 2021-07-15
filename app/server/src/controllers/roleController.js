const router = require('express').Router()
const { Role } = require('../models/role')
const { crudController } = require('../../lib/crudController')

router.get('/', crudController.index(Role))

module.exports = router
