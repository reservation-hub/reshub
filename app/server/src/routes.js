const express = require('express')
const path = require('path')

const apiRoutes = [
  require('./controllers/API/areaController'),
  require('./controllers/API/indexController'),
]

const authCheck = (req, res, next) => {
  if (req.user === undefined) return next({ message: 'aa', code: 401})
  return next()
}

module.exports = (app) => {
  app.use('/api', apiRoutes)
  app.use('/auth', require('./controllers/auth/authController'))

  app.use('/areas', require('./controllers/areaController'))
  app.use('/prefectures', require('./controllers/prefectureController'))
  app.use('/cities', require('./controllers/cityController'))
  app.use('/shops', require('./controllers/shopController'))

  if (process.env.NODE_ENV === "production") {
    console.log("PUBLIC FOLDER PATH : ", path.join(__dirname, 'public'))
    app.use(express.static(path.join(__dirname, 'public')))
    app.get(['/', '/*'], (req, res, next) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    })
  } else {
    app.use('/*', (req, res, next) => next({code: 404, message: 'Bad route'})) // 404s
  }
}
