const { Prisma } = require('@prisma/client')

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  console.error('error: ', err)
  const { error, message, code } = err

  if (error !== undefined) {
    // prisma errors
    console.error('Prisma error', error.message)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const invalidFields = error.meta.target
        return res.status(400).send({
          error: invalidFields.map(field => ({
            name: field,
            message: 'Duplicate value found on this field',
          })),
        })
      }

      if (error.code === 'P2025') {
        // code 404 エラー
        return res.status(404).send({ error: { message: error.meta.cause } })
      }

      if (error.code[0] === 'P') {
        return res.status(500).send({ error: { message: 'Server Error' } })
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

    if (error.name === 'JsonWebTokenError') {
      return res.status(400).send({ error: { message } })
    }
  }

  if (code === 404) {
    return res.status(code).send({ error: { message: message || 'Error: Not Found' } })
  }

  if (code === 400) {
    return res.status(code).send({ error: { message: message || 'Error: Bad request' } })
  }

  return res.status(code || 500).send({ error: { message: message || 'Internal Server Error' } })
}
