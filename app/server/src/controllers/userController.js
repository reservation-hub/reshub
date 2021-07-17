const router = require('express').Router()
const { validationSchema: userSchema, User } = require('../models/user')
const { registerCrud } = require('../../lib/crudController')

registerCrud(User, userSchema, router)

module.exports = router
