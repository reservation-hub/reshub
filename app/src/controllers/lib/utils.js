exports.parseIntIDMiddleware = (req, res, next) => {
  res.locals.id = parseInt(req.params.id, 10)
  return next()
}
