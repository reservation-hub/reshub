const router = require('express').Router()
const passport = require('passport')

router.use('/', require('./local'))
router.use('/google', require('./google'))
router.get('/test', (req, res, next) => {
  console.log(req.session)
  return res.send(req.user)
})

module.exports = router