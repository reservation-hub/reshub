const express = require('express')
const router = express.Router()
// const { Area } = require('../../models/area')
const AreaRepository = require('../../repositories/areaRepository')
const { Prefecture } = require('../../models/prefecture')

router.get('/:area', (req, res, next) => {
  AreaRepository.fetchBySlug(req.params.area)
  .then(area => res.send({area}))
  .catch(e => next(e))
})


module.exports = router