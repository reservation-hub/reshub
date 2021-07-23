const { Prisma } = require('@prisma/client')

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  console.error('error: ', err)
  const { error, message, code } = err

  // prisma errors
  if (error && error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const invalidFields = error.meta.target
      return res.status(400).send({
        error: invalidFields.map(field => ({
          name: field,
          message: 'Duplicate value found on this field',
        })),
      })
    }
    return res.status(400).send({ error: { message } })
  }

  if (error.name === 'ValidationError') {
    // Joi Validation エラー処理
    const messages = error.details.map(e => ({
      label: e.context.label,
      message: e.message,
    }))
    return res.status(400).send({ error: { message: messages } })
  }

  if (code === 404) {
    return res.status(code).send({ error: { message: message || 'Error: Not Found' } })
  }

  if (code === 401) {
    return res.status(code).send({ error: { message: message || 'Error: Bad request' } })
  }

  if (error.name === 'JsonWebTokenError') {
    return res.status(400).send({ error: { message } })
  }

  return res.status(code || 500).send({ error: { message: message || 'Internal Server Error' } })
}
