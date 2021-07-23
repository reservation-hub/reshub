const { Prisma } = require('@prisma/client')

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  console.error('error: ', err)

  // prisma errors
  if (err.error && err.error instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.error.code === 'P2002') {
      const invalidFields = err.error.meta.target
      return res.status(400).send({
        error: invalidFields.map(field => ({
          name: field,
          message: 'Duplicate value found on this field',
        })),
      })
    }
    return res.status(400).send({ error: { message: err.message } })
  }

  if (err.name === 'ValidationError') {
    // Joi Validation エラー処理
    const messages = err.details.map(e => ({
      label: e.context.label,
      message: e.message,
    }))
    return res.status(400).send({ error: { message: messages } })
  }

  if (err.code === 404) {
    return res.status(err.code).send({ error: { message: err.message || 'Error: Not Found' } })
  }

  if (err.code === 401) {
    return res.status(err.code).send({ error: { message: err.message || 'Error: Bad request' } })
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(400).send({ error: { message: err.message } })
  }

  return res.status(err.code || 500).send({ error: { message: err.message || 'Internal Server Error', data: err.data } })
}
